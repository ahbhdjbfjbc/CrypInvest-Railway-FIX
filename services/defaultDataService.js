const Plan=require('../models/InvestmentPlan');
const defaults=[
 {name:'Starter',roiPercent:'1.5',slug:'starter',description:'خطة البداية ضمن الحد الأدنى 50 USDT. العائد غير مضمون.',minimumInvestment:'50',maximumInvestment:'499',durationDays:30,currency:'USDT',sortOrder:1,icon:'star'},
 {name:'Growth',roiPercent:'2.5',slug:'growth',description:'شريحة استثمار من 500 إلى 999 USDT.',minimumInvestment:'500',maximumInvestment:'999',durationDays:30,currency:'USDT',sortOrder:2,icon:'chart'},
 {name:'Advanced',roiPercent:'3.5',slug:'advanced',description:'شريحة استثمار من 1000 إلى 2499 USDT.',minimumInvestment:'1000',maximumInvestment:'2499',durationDays:30,currency:'USDT',sortOrder:3,icon:'rocket'},
 {name:'Premium',roiPercent:'5.0',slug:'premium',description:'شريحة استثمار من 2500 إلى 4999 USDT.',minimumInvestment:'2500',maximumInvestment:'4999',durationDays:30,currency:'USDT',sortOrder:4,icon:'diamond'},
 {name:'Elite',roiPercent:'7.0',slug:'elite',description:'أعلى شريحة افتراضية حتى 5000 USDT.',minimumInvestment:'5000',maximumInvestment:'5000',durationDays:30,currency:'USDT',sortOrder:5,icon:'crown'}
];
async function ensureDefaultPlans(){
 for(const p of defaults){
  const exists=await Plan.exists({slug:p.slug});
  if(!exists) await Plan.create(p);
 }
}
module.exports={ensureDefaultPlans};
