/**
 * createAdmin.js — Provision the Admin (Authority) account
 * Run: node src/scripts/createAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const ADMIN_CREDENTIALS = {
  name: 'Admin Authority',
  email: 'admin@gmail.com',
  password: 'Admin@123',
  role: 'Admin'
};

const createAdminAccount = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sih-db';

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');

    // Check if Admin account already exists
    const existing = await User.findOne({ email: ADMIN_CREDENTIALS.email.toLowerCase() });

    if (existing) {
      console.log('⚠️  Admin account already exists:');
      console.log(`   Email : ${existing.email}`);
      console.log(`   Role  : ${existing.role}`);
      console.log('\n✅ No changes made.');
      await mongoose.connection.close();
      return;
    }

    // Password is hashed automatically by the User model's pre-save hook
    const admin = new User({
      name: ADMIN_CREDENTIALS.name,
      email: ADMIN_CREDENTIALS.email.toLowerCase(),
      password: ADMIN_CREDENTIALS.password,
      role: ADMIN_CREDENTIALS.role
    });

    await admin.save();

    console.log('\n✅ Admin account created successfully!\n');
    console.log('══════════════════════════════════════════════');
    console.log('   ADMIN / AUTHORITY LOGIN CREDENTIALS');
    console.log('══════════════════════════════════════════════');
    console.log(`   Email    : ${ADMIN_CREDENTIALS.email}`);
    console.log(`   Password : ${ADMIN_CREDENTIALS.password}`);
    console.log(`   Role     : ${ADMIN_CREDENTIALS.role}`);
    console.log('══════════════════════════════════════════════\n');
    console.log('⚠️  Do NOT commit these credentials to version control.\n');

    await mongoose.connection.close();
    console.log('🔒 Database connection closed.');
  } catch (error) {
    console.error('❌ Error creating Admin account:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

createAdminAccount();
