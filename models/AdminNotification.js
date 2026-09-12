const mongoose=require('mongoose');
const schema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User',default:null},group:{type:String,default:'all'},channel:{type:String,enum:['in_app','email'],default:'in_app'},title:{type:String,required:true,maxlength:150},message:{type:String,required:true,maxlength:2000},status:{type:String,enum:['queued','sent','failed'],default:'queued'},createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}},{timestamps:true});
module.exports=mongoose.model('AdminNotification',schema);
