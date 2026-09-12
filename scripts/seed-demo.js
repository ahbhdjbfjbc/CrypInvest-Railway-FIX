require('dotenv').config();
const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const crypto=require('crypto');
const User=require('../models/User');
const Plan=require('../models/InvestmentPlan');
const Transaction=require('../models/Transaction');
const {ensureDefaultPlans}=require('../services/defaultDataService');

(async()=>{
  if(String(process.env.SEED_DEMO_DATA).toLowerCase()!=='true') throw new Error('Set SEED_DEMO_DATA=true to enable demo seeding. Never enable this on production.');
  if(String(process.env.NODE_ENV).toLowerCase()==='production') throw new Error('Demo seed is disabled in production.');
  await mongoose.connect(process.env.MONGODB_URI);
  await ensureDefaultPlans();
  const adminEmail='admin-demo@example.invalid';
  const userEmail='user-demo@example.invalid';
  const hash=await bcrypt.hash('DemoPassword-ChangeMe-123!', Number(process.env.BCRYPT_ROUNDS||12));
  const admin=await User.findOneAndUpdate({email:adminEmail},{$setOnInsert:{name:'Demo Admin',email:adminEmail,passwordHash:hash,referralCode:'DEMOADMIN01',role:'admin',status:'active'}},{upsert:true,new:true});
  const user=await User.findOneAndUpdate({email:userEmail},{$set:{name:'Demo User',passwordHash:hash,referralCode:'DEMOUSER01',sponsor:admin._id,role:'user',status:'active',availableBalance:2500,totalDeposited:2500}},{upsert:true,new:true});
  await Transaction.deleteMany({user:user._id,metadata:{demoSeed:true}});
  await Transaction.create({transactionId:`DEMO-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,user:user._id,type:'deposit',direction:'credit',amount:'2500',currency:'USDT',balanceBefore:'0',balanceAfter:'2500',status:'completed',completedAt:new Date(),description:'Demo seed balance',metadata:{demoSeed:true}});
  console.log('Demo data ready. Admin:',adminEmail,'User:',userEmail,'Password: DemoPassword-ChangeMe-123!');
})().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(async()=>{await mongoose.disconnect();});
