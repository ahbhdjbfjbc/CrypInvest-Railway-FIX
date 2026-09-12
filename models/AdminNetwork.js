const mongoose=require('mongoose');
const schema=new mongoose.Schema({network:{type:String,required:true,unique:true,trim:true,uppercase:true},enabled:{type:Boolean,default:true},rpcProviders:{type:[String],default:[]},confirmations:{type:Number,min:1,max:100,default:12},status:{type:String,enum:['healthy','degraded','offline','unknown'],default:'unknown'},lastHealthCheck:{type:Date,default:null},nativeSymbol:{type:String,default:'',maxlength:20},networkFee:{type:mongoose.Schema.Types.Decimal128,default:'0'}},{timestamps:true});
module.exports=mongoose.model('AdminNetwork',schema);
