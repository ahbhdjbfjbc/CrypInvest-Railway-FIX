const router=require('express').Router();const {requireAuth,requireActiveAccount}=require('../middleware/auth');const {getAdminPaymentWallet,getAdminPaymentWallets}=require('../services/paymentWalletService');
router.use(requireAuth,requireActiveAccount);
router.get('/',async(req,res)=>{try{const currency=String(req.query.currency||'USDT').toUpperCase();const network=String(req.query.network||'TRC20').toUpperCase();res.json({success:true,wallet:await getAdminPaymentWallet(currency,network)});}catch(e){res.status(400).json({success:false,message:e.message});}});
router.get('/available',async(req,res)=>{try{res.json({success:true,wallets:await getAdminPaymentWallets()});}catch(e){res.status(400).json({success:false,message:e.message});}});
module.exports=router;
