/*
  Seed script — run with `npm run seed`.
  Creates an admin account and a starter set of products so the
  admin dashboard has data to work with.

  Admin login comes from .env (ADMIN_EMAIL / ADMIN_PASSWORD). Both are required:
  there is no default account.
*/
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before seeding (no default admin account).');
  process.exit(1);
}

const PRODUCTS = [
  {
    slug: 'makhani-gravy', name: 'Makhani Gravy', tagline: 'Professionally balanced gravy for commercial kitchens',
    price: 349, mrp: 399, label: 'Bestseller', category: 'gravies', weight: '1kg', serves: 'Serves 4',
    shelfLife: '12 months', stock: 120, sold: 48, isFeatured: true,
    image: 'https://mickys.in/wp-content/uploads/makhani.png',
    description: 'The ultimate base for Butter Chicken, Paneer Makhani and more.',
  },
  {
    slug: 'kadhai-gravy', name: 'Kadhai Gravy', tagline: 'Consistent colour, texture and taste across every service',
    price: 349, mrp: 399, label: 'Chef Pick', category: 'gravies', weight: '1kg', serves: 'Serves 4',
    shelfLife: '12 months', stock: 90, sold: 33, isFeatured: true,
    image: 'https://mickys.in/wp-content/uploads/kadhai.png',
    description: 'Bold flavours of a traditional kadhai dish, ready in minutes.',
  },
  {
    slug: 'malabari-gravy', name: 'Malabari Gravy', tagline: 'Coastal cooking base for faster professional finishing',
    price: 449, mrp: 499, label: 'Coastal', category: 'gravies', weight: '1kg', serves: 'Serves 4',
    shelfLife: '12 months', stock: 60, sold: 21,
    image: 'https://mickys.in/wp-content/uploads/malabari.png',
    description: 'A rich, coconut-based gravy with curry leaves and warm coastal spices.',
  },
  {
    slug: 'onion-tomato-masala', name: 'Onion Tomato Masala', tagline: 'A neutral base that never dominates your recipe',
    price: 249, mrp: 299, label: 'Essential', category: 'pastes', weight: '1kg', serves: 'Serves 4',
    shelfLife: '12 months', stock: 8, sold: 64,
    image: 'https://mickys.in/wp-content/uploads/onion-tomato.png',
    description: 'Slow-cooked onions and tomatoes with whole spices.',
  },
  {
    slug: 'dal-makhani', name: 'Dal Makhani', tagline: 'Three-hour prep brought down to fast service speed',
    price: 249, mrp: 299, label: 'RTC', category: 'pulses', weight: '1kg', serves: 'Serves 4',
    shelfLife: '12 months', stock: 0, sold: 75,
    image: 'https://mickys.in/wp-content/uploads/dal-makhani.png',
    description: 'Ready-to-cook Dal Makhani that keeps the familiar taste guests expect.',
  },
  {
    slug: 'gravies-bundle', name: 'Gravies Bundle', tagline: 'Four signature ready-to-cook gravy bases',
    price: 1, mrp: 1596, label: 'Pack of 4', category: 'bundles', weight: '4 x 1kg',
    shelfLife: '12 months', stock: 40, sold: 12, isFeatured: true,
    image: 'https://mickys.in/wp-content/uploads/bundle-gravies.png',
    description: 'Makhani, Kadhai, Malabari and Yellow gravy — restaurant flavour in minutes.',
  },
];

const run = async () => {
  await connectDB();

  /* Admin user */
  let adminUser = await User.findOne({ email: ADMIN_EMAIL });
  if (adminUser) {
    adminUser.role = 'admin';
    adminUser.password = ADMIN_PASSWORD; // re-hashed by pre-save hook
    await adminUser.save();
    console.log(`Updated existing admin: ${ADMIN_EMAIL}`);
  } else {
    adminUser = await User.create({
      name: 'Micky\'s Admin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
    });
    console.log(`Created admin: ${ADMIN_EMAIL}`);
  }

  /* Products (upsert by slug so re-running is safe) */
  for (const p of PRODUCTS) {
    await Product.findOneAndUpdate({ slug: p.slug }, p, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  console.log(`Seeded ${PRODUCTS.length} products`);

  console.log('\n────────────────────────────────────');
  console.log(' Admin login');
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log('────────────────────────────────────\n');

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
