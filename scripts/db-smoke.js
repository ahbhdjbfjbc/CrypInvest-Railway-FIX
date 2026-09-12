require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Plan = require('../models/InvestmentPlan');

(async()=>{
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.');
  const marker = `db-smoke-${Date.now()}`;
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    await mongoose.connection.db.admin().command({ ping: 1 });
    const plan = await Plan.findOne({ slug: 'starter' }).lean();
    if (!plan) throw new Error('Starter plan is missing. Start the app once to seed default plans.');
    const user = await User.create({ name: 'DB Smoke Test', email: `${marker}@example.invalid`, passwordHash: 'not-a-real-password', referralCode: marker.toUpperCase().slice(-10), status: 'active' });
    await User.deleteOne({ _id: user._id });
    console.log('Database smoke test passed:', mongoose.connection.name);
  } finally {
    await mongoose.disconnect();
  }
})().catch(err=>{ console.error('Database smoke test failed:', err.message); process.exit(1); });
