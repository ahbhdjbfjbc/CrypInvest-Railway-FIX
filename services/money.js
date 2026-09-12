function normalizeDecimal(v){const s=String(v??'').trim();if(!/^\d+(\.\d{1,18})?$/.test(s))throw new Error('Invalid decimal amount.');return s;}
function toUnits(v){const s=normalizeDecimal(v);const [i,f='']=s.split('.');return BigInt(i)*1000000000000000000n+BigInt(f.padEnd(18,'0'));}
function fromUnits(v){const n=BigInt(v);const i=n/1000000000000000000n;let f=(n%1000000000000000000n).toString().padStart(18,'0').replace(/0+$/,'');return f?`${i}.${f}`:i.toString();}
function add(a,b){return fromUnits(toUnits(a)+toUnits(b));}
function percentOf(a,pct){const rate=String(pct??'0').trim();if(!/^\d+(\.\d{1,18})?$/.test(rate))throw new Error('Invalid percent.');const ru=toUnits(rate);return fromUnits((toUnits(a)*ru)/1000000000000000000n);} function sub(a,b){const r=toUnits(a)-toUnits(b);if(r<0n)throw new Error('Insufficient balance.');return fromUnits(r);} function cmp(a,b){return toUnits(a)<toUnits(b)?-1:toUnits(a)>toUnits(b)?1:0;} function positive(v){return toUnits(v)>0n;}
module.exports={normalizeDecimal,toUnits,fromUnits,add,sub,cmp,positive,percentOf};
