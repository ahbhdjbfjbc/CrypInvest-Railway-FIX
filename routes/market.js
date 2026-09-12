const express=require('express');
const {getTickers,getTicker,getHistory}=require('../services/marketSimulationService');
const router=express.Router();
router.get('/tickers',async(req,res)=>{const symbols=String(req.query.symbols||'').split(',').map(s=>s.trim()).filter(Boolean),tickers=getTickers(symbols);if(!tickers.length)return res.status(404).json({success:false,simulated:true,message:'العملة المطلوبة غير متاحة في السوق المحاكاة.'});res.json({success:true,live:false,simulated:true,source:'CrypInvest simulated market',tickers});});
router.get('/ticker/:symbol',async(req,res)=>{const ticker=getTicker(req.params.symbol);if(!ticker)return res.status(404).json({success:false,live:false,simulated:true,message:'العملة المطلوبة غير متاحة في السوق المحاكاة.'});res.json({success:true,live:false,simulated:true,source:'CrypInvest simulated market',ticker});});
router.get('/history/:symbol',async(req,res)=>{const history=getHistory(req.params.symbol,req.query.points);if(!history)return res.status(404).json({success:false,live:false,simulated:true,message:'لا توجد بيانات لهذه العملة.'});res.json({success:true,live:false,simulated:true,source:'CrypInvest simulated market',...history});});
module.exports=router;
