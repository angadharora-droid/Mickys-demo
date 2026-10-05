const express = require('express');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/auth');
const { sendOrderConfirmation, sendStatusUpdate } = require('../utils/sendEmail');
const shiprocket = require('../utils/shiprocket');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const order = await Order.create(req.body);

    sendOrderConfirmation(order).catch((err) => {
      console.error(`Order email failed: ${err.message}`);
    });

    // COD orders ship immediately; prepaid orders ship once payment is verified.
    if (order.paymentMethod === 'cod') {
      shiprocket.createShipment(order).catch((err) => {
        console.error(`Shiprocket shipment creation failed for ${order.orderId}: ${err.message}`);
      });
    }

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
});

router.get('/my', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ 'user.userId': req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
});

router.get('/', protect, admin, async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isOwner = order.user.userId?.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorised for this order' });
    }

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/status', protect, admin, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = req.body.orderStatus || order.orderStatus;
    order.trackingNumber = req.body.trackingNumber ?? order.trackingNumber;
    order.statusHistory.push({
      status: order.orderStatus,
      note: req.body.note,
    });
    await order.save();

    sendStatusUpdate(order).catch((err) => {
      console.error(`Status email failed: ${err.message}`);
    });

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
