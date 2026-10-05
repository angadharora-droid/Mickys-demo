const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:    String,
  rating:  { type: Number, min: 1, max: 5, required: true },
  comment: String,
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  slug:        { type: String, required: true, unique: true },
  name:        { type: String, required: true },
  tagline:     String,
  price:       { type: Number, required: true },
  mrp:         { type: Number, required: true },
  image:       { type: String, required: true },
  images:      [String],
  label:       String,
  category:    { type: String, enum: ['gravies', 'pastes', 'pulses', 'bundles'], required: true },
  description: String,
  ingredients: String,
  weight:      String,
  serves:      String,
  shelfLife:   String,
  stock:       { type: Number, default: 100 },
  sold:        { type: Number, default: 0 },
  reviews:     [ReviewSchema],
  rating:      { type: Number, default: 0 },
  numReviews:  { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
  isFeatured:  { type: Boolean, default: false },
}, { timestamps: true });

/* Auto-update rating on review change */
ProductSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) { this.rating = 0; this.numReviews = 0; return; }
  this.numReviews = this.reviews.length;
  this.rating = this.reviews.reduce((s, r) => s + r.rating, 0) / this.numReviews;
};

module.exports = mongoose.model('Product', ProductSchema);
