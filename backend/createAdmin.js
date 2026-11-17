// Creates the college admin account. This is the ONLY way to make an admin -
// there is no admin sign up page or API.
//
// 1. set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env
// 2. run: npm run create-admin
//
// It does not delete anything. If the admin already exists it is left as it is.
require('dotenv').config({ quiet: true });

const mongoose = require('mongoose');
const User = require('./models/User');

const run = async () => {
  const name = process.env.ADMIN_NAME || 'College Administration';
  const email = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || '';

  if (!email || !password) {
    console.error('Please set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env first');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('ADMIN_PASSWORD must be at least 8 characters');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`An account with ${email} already exists (role: ${existing.role}). Nothing changed.`);
  } else {
    // the password is hashed with bcrypt by the User model before saving
    await User.create({ name, email, password, role: 'admin' });
    console.log(`Admin account created for ${email}`);
    console.log('You can now log in and change the password from Settings.');
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
