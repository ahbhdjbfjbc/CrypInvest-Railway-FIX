const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,minlength:2,maxlength:100}, email:{type:String,required:true,unique:true,lowercase:true,trim:true,index:true}, passwordHash:{type:String,required:true,select:false},
 referralCode:{type:String,required:true,unique:true,uppercase:true,index:true}, sponsor:{type:mongoose.Schema.Types.ObjectId,ref:'User',default:null}, status:{type:String,enum:['pending','active','suspended','blocked'],default:'active'}, role:{type:String,enum:['user','super_admin','admin','support','finance','auditor','content_manager'],default:'user'},
 availableBalance:{type:mongoose.Schema.Types.Decimal128,default:'0',min:0}, reservedBalance:{type:mongoose.Schema.Types.Decimal128,default:'0',min:0}, totalDeposited:{type:mongoose.Schema.Types.Decimal128,default:'0',min:0}, totalWithdrawn:{type:mongoose.Schema.Types.Decimal128,default:'0',min:0},
 directReferralsCount:{type:Number,default:0,min:0}, totalReferralsCount:{type:Number,default:0,min:0}, emailVerified:{type:Boolean,default:false}, lastLoginAt:{type:Date,default:null}, lastLoginIp:{type:String,default:'',maxlength:100}, lastLoginUserAgent:{type:String,default:'',maxlength:500}, loginHistory:{type:[{at:Date,ip:String,userAgent:String}],default:[]}, adminNotes:{type:String,default:'',maxlength:5000}, failedLoginAttempts:{type:Number,default:0,min:0}, lockedUntil:{type:Date,default:null}, sessionVersion:{type:Number,default:0,min:0}, twoFactorSecret:{type:String,default:'',select:false}, twoFactorEnabled:{type:Boolean,default:false}, twoFactorVerifiedAt:{type:Date,default:null}
},{timestamps:true,toJSON:{virtuals:true}});
userSchema.index({sponsor:1}); userSchema.index({status:1,createdAt:-1});
userSchema.virtual('isLocked').get(function(){return this.lockedUntil && this.lockedUntil>new Date();});
userSchema.methods.toSafeObject=function(){const o=this.toObject({virtuals:true}); delete o.passwordHash; delete o.failedLoginAttempts; delete o.lockedUntil; delete o.sessionVersion; return o;};
module.exports=mongoose.model('User',userSchema);
