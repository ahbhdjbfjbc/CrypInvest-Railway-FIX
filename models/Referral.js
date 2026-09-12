const mongoose=require('mongoose');
const schema=new mongoose.Schema({sponsor:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},referredUser:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},referralCode:{type:String,required:true,index:true},level:{type:Number,required:true,min:1,max:20},parentReferral:{type:mongoose.Schema.Types.ObjectId,ref:'Referral',default:null},status:{type:String,enum:['pending','active','inactive'],default:'active'},activatedAt:{type:Date,default:null}},{timestamps:true});
schema.index({sponsor:1,referredUser:1,level:1},{unique:true});
schema.pre('validate',function(next){if(this.sponsor?.equals(this.referredUser))return next(new Error('Self referral is not allowed.'));next();});
module.exports=mongoose.model('Referral',schema);
