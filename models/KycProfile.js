const mongoose=require('mongoose');
const schema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,unique:true,index:true},
 status:{type:String,enum:['not_started','pending','approved','rejected'],default:'not_started',index:true},
 fullName:{type:String,trim:true,maxlength:120,default:''},
 country:{type:String,trim:true,maxlength:80,default:''},
 documentType:{type:String,enum:['','passport','national_id','drivers_license'],default:''},
 documentNumberLast4:{type:String,trim:true,maxlength:4,default:''},
 riskLevel:{type:String,enum:['low','medium','high'],default:'low'},
 sanctionsScreened:{type:Boolean,default:false},
 amlReviewed:{type:Boolean,default:false},
 reviewedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',default:null},
 reviewedAt:{type:Date,default:null},
 rejectionReason:{type:String,default:'',maxlength:500}
},{timestamps:true});
module.exports=mongoose.model('KycProfile',schema);