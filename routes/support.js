const router=require('express').Router();
const {getSettings}=require('../services/platformSettingsService');
router.get('/',async(req,res,next)=>{try{const s=await getSettings();res.setHeader('Cache-Control','no-store');res.json({success:true,support:{enabled:Boolean(s.support?.enabled),label:String(s.support?.label||'الدعم'),url:String(s.support?.url||''),text:String(s.support?.text||'تواصل مع الدعم')},theme:s.theme,announcement:s.announcement,offers:s.offers,limits:s.limits});}catch(e){next(e);}});
module.exports=router;

const SupportTicket=require('../models/SupportTicket');const {requireAuth,requireActiveAccount}=require('../middleware/auth');
router.post('/tickets',requireAuth,requireActiveAccount,async(req,res,next)=>{try{const t=await SupportTicket.create({user:req.user._id,subject:String(req.body.subject||'').trim().slice(0,200),messages:[{sender:req.user._id,body:String(req.body.message||'').trim().slice(0,5000)}]});res.status(201).json({success:true,ticket:t});}catch(e){next(e)}});
router.get('/tickets',requireAuth,requireActiveAccount,async(req,res,next)=>{try{const items=await SupportTicket.find({user:req.user._id}).sort({updatedAt:-1}).limit(50);res.json({success:true,items});}catch(e){next(e)}});
router.post('/tickets/:id/messages',requireAuth,requireActiveAccount,async(req,res,next)=>{try{const t=await SupportTicket.findOne({_id:req.params.id,user:req.user._id});if(!t)return res.status(404).json({success:false,message:'Ticket not found.'});t.messages.push({sender:req.user._id,body:String(req.body.message||'').trim().slice(0,5000)});t.status='open';await t.save();res.json({success:true,ticket:t});}catch(e){next(e)}});
