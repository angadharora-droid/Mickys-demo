const express = require('express');
const Order = require('../models/Order');
const shiprocket = require('../utils/shiprocket');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

/* Map a Shiprocket shipment status string to our internal orderStatus enum. */
function mapShiprocketStatus(status = '') {
  const s = status.toLowerCase();
  if (s.includes('delivered')) return 'delivered';
  if (s.includes('cancel')) return 'cancelled';
  if (s.includes('transit') || s.includes('shipped') || s.includes('picked')) return 'shipped';
  if (s.includes('out for delivery')) return 'shipped';
  return null;
}

/* Create/push a shipment on Shiprocket for an existing order (admin only). */
router.post('/:orderId/create', protect, admin, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const result = await shiprocket.createShipment(order);

    order.shiprocket = {
      orderId: result.order_id ? String(result.order_id) : order.shiprocket?.orderId,
      shipmentId: result.shipment_id ? String(result.shipment_id) : order.shiprocket?.shipmentId,
      awbCode: order.shiprocket?.awbCode,
      courierName: order.shiprocket?.courierName,
      status: result.status || 'created',
    };
    if (result.awb_code) order.trackingNumber = result.awb_code;
    await order.save();

    res.status(201).json({ success: true, order, shiprocket: result });
  } catch (err) {
    next(err);
  }
});

/* Live tracking lookup — order owner or admin. */
router.get('/:orderId/track', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const isOwner = order.user.userId?.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorised for this order' });
    }
    if (!order.shiprocket?.awbCode && !order.shiprocket?.shipmentId) {
      return res.status(400).json({ success: false, message: 'No shipment created for this order yet' });
    }

    const tracking = order.shiprocket.awbCode
      ? await shiprocket.trackByAwb(order.shiprocket.awbCode)
      : await shiprocket.trackByShipmentId(order.shiprocket.shipmentId);

    res.json({ success: true, tracking });
  } catch (err) {
    next(err);
  }
});

/* Shiprocket webhook — pushes tracking updates as shipments move.
   Configure the same URL + token in Shiprocket's webhook settings. */
router.post('/webhook', express.json(), async (req, res, next) => {
  try {
    const configuredToken = process.env.SHIPROCKET_WEBHOOK_TOKEN;
    if (configuredToken && req.headers['x-api-key'] !== configuredToken) {
      return res.status(401).json({ success: false, message: 'Invalid webhook token' });
    }

    const { order_id: orderId, awb, current_status: currentStatus, courier_name: courierName } = req.body || {};
    if (!orderId) return res.status(400).json({ success: false, message: 'Missing order_id' });

    const order = await Order.findOne({ orderId: String(orderId) });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.shiprocket = {
      ...order.shiprocket,
      awbCode: awb || order.shiprocket?.awbCode,
      courierName: courierName || order.shiprocket?.courierName,
      status: currentStatus || order.shiprocket?.status,
    };
    if (awb) order.trackingNumber = awb;

    const mappedStatus = mapShiprocketStatus(currentStatus);
    if (mappedStatus && mappedStatus !== order.orderStatus) {
      order.orderStatus = mappedStatus;
      order.statusHistory.push({ status: mappedStatus, note: `Shiprocket: ${currentStatus}` });
    }

    await order.save();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
