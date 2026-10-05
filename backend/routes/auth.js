const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const sendToken = (user, statusCode, res) => {
  res.status(statusCode).json({
    success: true,
    token: user.getSignedToken(),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      addresses: user.addresses,
    },
  });
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate,
  ],
  async (req, res, next) => {
    try {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email is already registered' });
      }

      const user = await User.create(req.body);
      sendToken(user, 201, res);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email }).select('+password');
      if (!user || !(await user.matchPassword(req.body.password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      sendToken(user, 200, res);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
