const AuditLog=require('../models/AuditLog');
function ipOf(req){return String(req.headers['x-forwarded-for']||req.ip||'').split(',')[0].trim().slice(0,100)}
async function audit(req,{actor=null,action,targetType='',targetId='',before=null,after=null,metadata=null}){
 try{await AuditLog.create({actor:actor||req.user?._id||null,action,targetType,targetId,ip:ipOf(req),userAgent:String(req.get('user-agent')||'').slice(0,500),before,after,metadata});}
 catch(e){console.error('AUDIT_LOG_ERROR',e.message)}
}
module.exports={audit,ipOf};