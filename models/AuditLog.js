const mongoose=require('mongoose');
const schema=new mongoose.Schema({
 actor:{type:mongoose.Schema.Types.ObjectId,ref:'User',default:null,index:true},
 action:{type:String,required:true,index:true,trim:true,maxlength:120},
 targetType:{type:String,default:'',trim:true,maxlength:80},
 targetId:{type:String,default:'',trim:true,maxlength:120},
 ip:{type:String,default:'',trim:true,maxlength:100},
 userAgent:{type:String,default:'',maxlength:500},
 before:{type:mongoose.Schema.Types.Mixed,default:null},
 after:{type:mongoose.Schema.Types.Mixed,default:null},
 metadata:{type:mongoose.Schema.Types.Mixed,default:null}
},{timestamps:true});
schema.index({createdAt:-1});schema.index({actor:1,createdAt:-1});
module.exports=mongoose.model('AuditLog',schema);