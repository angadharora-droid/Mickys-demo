const crypto = require('crypto');
const express = require('express');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const shiprocket = require('../utils/shiprocket');

const router = express.Router();

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials are not configured');
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

router.post('/create-order', async (req, res, next) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    const order = await getRazorpay().orders.create({
      amount: Math.round(Number(amount) * 100),
      currency,
      receipt,
    });

    res.status(201).json({ success: true, order, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    next(err);
  }
});

router.post('/verify', async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    // never verify against an empty key: a missing secret must fail closed
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, message: 'Payment verification is not configured' });
    }
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const verified = expectedSignature === razorpay_signature;
    if (!verified) {
      return res.json({ success: false, message: 'Payment verification failed' });
    }

    let order = null;
    if (orderId) {
      order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = 'paid';
        order.razorpayOrderId = razorpay_order_id;
        order.razorpayPaymentId = razorpay_payment_id;
        order.orderStatus = 'confirmed';
        order.statusHistory.push({ status: 'confirmed', note: 'Payment received via Razorpay' });
        await order.save();

        shiprocket.createShipment(order).then(async (result) => {
          order.shiprocket = {
            orderId: result.order_id ? String(result.order_id) : order.shiprocket?.orderId,
            shipmentId: result.shipment_id ? String(result.shipment_id) : order.shiprocket?.shipmentId,
            awbCode: order.shiprocket?.awbCode,
            courierName: order.shiprocket?.courierName,
            status: result.status || 'created',
          };
          if (result.awb_code) order.trackingNumber = result.awb_code;
          await order.save();
        }).catch((err) => {
          console.error(`Shiprocket shipment creation failed for ${order.orderId}: ${err.message}`);
        });
      }
    }

    res.json({ success: true, message: 'Payment verified', order });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
