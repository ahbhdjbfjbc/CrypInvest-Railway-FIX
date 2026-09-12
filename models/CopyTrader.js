const mongoose=require('mongoose');
const schema=new mongoose.Schema({name:{type:String,required:true,trim:true,maxlength:120},active:{type:Boolean,default:true},commissionPercent:{type:mongoose.Schema.Types.Decimal128,default:'0'},minimumCopy:{type:mongoose.Schema.Types.Decimal128,default:'0'},performance:{type:mongoose.Schema.Types.Mixed,default:{}},notes:{type:String,default:'',maxlength:2000}},{timestamps:true});
module.exports=mongoose.model('CopyTrader',schema);
