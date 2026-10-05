const dns = require('dns');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Render's outbound network can't route IPv6 (causes ENETUNREACH to Gmail,
// Shiprocket, etc.) — prefer IPv4 for all DNS lookups app-wide.
dns.setDefaultResultOrder('ipv4first');

const app = express();

const allowedOrigins = [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    // Allow non-browser tools (no origin), explicitly configured origins,
    // and any localhost/127.0.0.1 port during development.
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/shipping', require('./routes/shipping'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: "Micky's API running" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
});

// Kick off the DB connection. On serverless this primes the cached connection
// (mongoose buffers queries until it's ready); locally it connects on boot.
connectDB().catch((err) => console.error('Initial DB connection failed:', err.message));

// Only run a long-lived HTTP server when executed directly (local dev / a VPS).
// On Vercel this file is imported as a serverless function, so we export the app.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Micky's server running on port ${PORT}`));
}

module.exports = app;
