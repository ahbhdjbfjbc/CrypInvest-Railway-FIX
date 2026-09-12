const mongoose=require('mongoose');
const schema=new mongoose.Schema({key:{type:String,unique:true,required:true},title:{type:String,default:''},body:{type:String,default:''},published:{type:Boolean,default:true},updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',default:null}},{timestamps:true});
module.exports=mongoose.model('ContentPage',schema);
