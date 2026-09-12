const PlatformSetting=require('../models/PlatformSetting');
const envWallets=()=>({USDT:{TRC20:{address:process.env.USDT_TRC20_ADDRESS||'',confirmations:Number(process.env.USDT_TRC20_CONFIRMATIONS||12)},ERC20:{address:process.env.USDT_ERC20_ADDRESS||'',confirmations:Number(process.env.USDT_ERC20_CONFIRMATIONS||12)},BEP20:{address:process.env.USDT_BEP20_ADDRESS||'',confirmations:Number(process.env.USDT_BEP20_CONFIRMATIONS||15)}}});
const DEFAULTS={
  paymentWallets:{USDT:{TRC20:{address:'',confirmations:12},ERC20:{address:'',confirmations:12},BEP20:{address:'',confirmations:15}}},
  support:{enabled:true,label:'الدعم',url:'',text:'تواصل مع دعم CrypInvest'},
  site:{name:'CrypInvest',language:'ar',direction:'rtl'},
  theme:{primary:'#ff9e17',secondary:'#ffc63e',background:'#061321',surface:'#0a2438',border:'#1e5f8f',text:'#ffffff',muted:'#91a8ba',success:'#19d39a',danger:'#ff5c69'},
  announcement:{enabled:true,title:'فرصة استثمارية جديدة',text:'تابع أحدث خطط الاستثمار والسحب والإيداع عبر منصة CrypInvest.',ctaLabel:'عرض الخطط',ctaUrl:'/plans'},
  offers:{enabled:true,items:[]},
  limits:{depositMin:'10',depositMax:'100000',withdrawMin:'10',withdrawMax:'100000'},
  adminSecurity:{allowedIPs:[],sessionMinutes:60}
};
async function getSetting(key){const row=await PlatformSetting.findOne({key}).lean();return row?row.value:DEFAULTS[key];}
async function setSetting(key,value){return PlatformSetting.findOneAndUpdate({key},{key,value},{upsert:true,new:true,setDefaultsOnInsert:true});}
async function getSettings(){const rows=await PlatformSetting.find({key:{$in:Object.keys(DEFAULTS)}}).lean();const out=JSON.parse(JSON.stringify(DEFAULTS));for(const r of rows)out[r.key]=r.value;return out;}
module.exports={DEFAULTS,getSetting,setSetting,getSettings};
