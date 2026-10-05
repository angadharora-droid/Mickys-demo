const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

/* Everything under /api/admin requires an authenticated admin */
router.use(protect, admin);

/* ── Dashboard summary ───────────────────────────────────────── */
router.get('/stats', async (req, res, next) => {
  try {
    const [orders, products, users] = await Promise.all([
      Order.find(),
      Product.countDocuments(),
      User.countDocuments({ role: 'user' }),
    ]);

    const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');
    const revenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    /* count orders per status */
    const statusCounts = orders.reduce((acc, o) => {
      acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
      return acc;
    }, {});

    /* revenue for the last 7 days (paid orders) */
    const today = new Date();
    const revenueByDay = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const key = day.toISOString().slice(0, 10);
      const dayTotal = paidOrders
        .filter((o) => new Date(o.createdAt).toISOString().slice(0, 10) === key)
        .reduce((sum, o) => sum + (o.total || 0), 0);
      revenueByDay.push({ date: key, total: dayTotal });
    }

    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);

    const lowStock = await Product.find({ stock: { $lte: 10 } })
      .select('name stock category')
      .sort({ stock: 1 })
      .limit(8);

    res.json({
      success: true,
      stats: {
        revenue,
        totalOrders: orders.length,
        paidOrders: paidOrders.length,
        pendingOrders: orders.filter((o) => o.orderStatus === 'placed').length,
        totalProducts: products,
        totalCustomers: users,
        statusCounts,
        revenueByDay,
        recentOrders,
        lowStock,
      },
    });
  } catch (err) {
    next(err);
  }
});

/* ── All products (including inactive) for management ────────── */
router.get('/products', async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    next(err);
  }
});

/* ── Customers ───────────────────────────────────────────────── */
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
});

/* Toggle a user's active state */
router.put('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
