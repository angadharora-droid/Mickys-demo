const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

const AddressSchema = new mongoose.Schema({
  label:   { type: String, default: 'Home' },
  line1:   String,
  line2:   String,
  city:    String,
  state:   String,
  pincode: String,
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true, minlength: 6, select: false },
  phone:     { type: String },
  role:      { type: String, enum: ['user', 'admin'], default: 'user' },
  addresses: [AddressSchema],
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });

/* Hash password before save */
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/* Compare password */
UserSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

/* Generate JWT */
UserSchema.methods.getSignedToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

module.exports = mongoose.model('User', UserSchema);
