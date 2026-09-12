require('dotenv').config();
const mongoose=require('mongoose');
const User=require('../models/User');
const {getAdminPaymentWallet}=require('../services/paymentWalletService');
const {validateBlockchainConfig}=require('../config/blockchain');
const {isProviderConfigured}=require('../config/paymentProvider');
(async()=>{
 let ok=true;const req=(v,m)=>{if(!v){console.error('FAIL:',m);ok=false}else console.log('OK:',m)};
 try{
  req(process.env.NODE_ENV==='production','NODE_ENV=production');
  req(process.env.MONGODB_URI,'MONGODB_URI configured');
  req(process.env.JWT_SECRET&&process.env.JWT_SECRET.length>=32,'JWT_SECRET is at least 32 chars');
  for(const n of ['TRC20','ERC20'])req(validateBlockchainConfig(n),`${n} real blockchain verifier and official Tether USDT contract configured`);req(validateBlockchainConfig('BEP20'),'BEP20 real blockchain verifier configured with an explicit 0x token contract and BSC mainnet RPC');
  req(isProviderConfigured()&&process.env.PAYMENT_PROVIDER_ENVIRONMENT==='production','real withdrawal payment provider configured for production');
  if(!mongoose.connection.readyState)await mongoose.connect(process.env.MONGODB_URI);
  const roles=['super_admin','admin','support','finance','auditor','content_manager'];const admins=await User.countDocuments({role:{$in:roles}});const admins2fa=await User.countDocuments({role:{$in:roles},twoFactorEnabled:true});
  req(admins>0,'at least one admin account exists');req(admins===admins2fa,'all admin accounts have 2FA enabled');
  for(const n of ['TRC20','ERC20','BEP20']){try{const w=await getAdminPaymentWallet('USDT',n);req(Boolean(w.address),`${n} admin wallet configured in MongoDB`)}catch(e){console.error('FAIL:',e.message);ok=false}}
  if(ok)console.log('RELEASE PREFLIGHT: PASS');else{console.error('RELEASE PREFLIGHT: BLOCKED');process.exitCode=1}
 }catch(e){console.error('RELEASE PREFLIGHT ERROR:',e.message);process.exitCode=1}finally{if(mongoose.connection.readyState)await mongoose.disconnect()}
})();
