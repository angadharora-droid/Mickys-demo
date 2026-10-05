const mongoose = require('mongoose');

/*
  Serverless-safe connection.
  On platforms like Vercel the module is re-used across warm invocations, so we
  cache the connection (and the in-flight promise) on the global object to avoid
  opening a new connection on every request. We never call process.exit here —
  that would kill the serverless function; instead we surface the error.
*/
let cached = global._mongooseConn;
if (!cached) cached = global._mongooseConn = { conn: null, promise: null };

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mickys';
    cached.promise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 5000 })
      .then((m) => {
        console.log(`MongoDB connected: ${m.connection.host}`);
        return m;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // allow a retry on the next call
    console.error(`MongoDB error: ${err.message}`);
    throw err;
  }

  return cached.conn;
};

module.exports = connectDB;
