const mongoose=require('mongoose');
const schema=new mongoose.Schema({symbol:{type:String,required:true,uppercase:true,trim:true},network:{type:String,required:true,uppercase:true,trim:true},contractAddress:{type:String,default:'',trim:true},enabled:{type:Boolean,default:true},minimumDeposit:{type:mongoose.Schema.Types.Decimal128,default:'0'},visibleNetworkFee:{type:mongoose.Schema.Types.Decimal128,default:'0'}},{timestamps:true});
schema.index({symbol:1,network:1},{unique:true});module.exports=mongoose.model('AdminToken',schema);
