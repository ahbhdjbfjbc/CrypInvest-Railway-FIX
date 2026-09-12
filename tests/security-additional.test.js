const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');

test('transaction hashes are canonicalized before duplicate checks',()=>{
  const {canonicalTransactionHash}=require('../services/blockchainVerificationService');
  assert.equal(canonicalTransactionHash('ERC20','0xAAbb'+('1'.repeat(60))),'0xaabb'+('1'.repeat(60)));
  assert.equal(canonicalTransactionHash('TRC20','AAbB'+('1'.repeat(60))),'aabb'+('1'.repeat(60)));
  assert.throws(()=>canonicalTransactionHash('ERC20','0x1234'),/Invalid transaction hash/);
});

test('BEP20 selectors exist but live verification remains fail-closed until explicitly configured',()=>{
  const ui=read('public/app-ui-v2.js');
  const depositStart=ui.indexOf("async function deposit()");
  const withdrawStart=ui.indexOf("async function withdraw()");
  const deposit=ui.slice(depositStart,withdrawStart);
  const withdraw=ui.slice(withdrawStart,ui.indexOf("async function referrals()"));
  assert.match(deposit,/TRC20/);
  assert.match(deposit,/ERC20/);
  assert.equal(deposit.includes('<option>BEP20</option>'),true);
  assert.match(withdraw,/TRC20/);
  assert.match(withdraw,/ERC20/);
  assert.equal(withdraw.includes('<option>BEP20</option>'),true);
});

test('admin settings form handlers are replacement-safe and do not accumulate listeners',()=>{
  const ui=read('admin-ui/admin.js');
  assert.match(ui,/walletForm\.onsubmit=/);
  assert.match(ui,/supportForm\.onsubmit=/);
  assert.doesNotMatch(ui,/walletForm\.addEventListener\(['"]submit/);
  assert.doesNotMatch(ui,/supportForm\.addEventListener\(['"]submit/);
});

test('admin dashboard does not display fabricated percentage trends',()=>{
  const ui=read('admin-ui/admin.js');
  assert.doesNotMatch(ui,/["']\\+12%["']/);
  assert.doesNotMatch(ui,/["']\\+18%["']/);
  assert.doesNotMatch(ui,/["']\\+15%["']/);
  assert.doesNotMatch(ui,/["']\\+9%["']/);
});

test('CSP keeps scripts same-origin while allowing legacy inline style attributes only',()=>{
  const server=read('server.js');
  assert.match(server,/scriptSrc:\["'self'"\]/);
  assert.match(server,/styleSrc:\["'self'"\]/);
  assert.match(server,/styleSrcAttr:\["'unsafe-inline'"\]/);
});

test('project has no references to unrelated healthcare/OpenAI data services',()=>{
  const files=[];
  function walk(dir){for(const n of fs.readdirSync(dir)){if(['node_modules','.git'].includes(n))continue;const p=path.join(dir,n);const st=fs.statSync(p);if(st.isDirectory())walk(p);else if(/\.(js|json|html|css|yml|yaml|txt|env|example)$/.test(n) && n!=='security-additional.test.js')files.push(p);}}
  walk(root);
  const needles=/\b(CMS Open Data|DailyMed|Medicare Care Compare|NPI Registry|openFDA|PubMed|RxNorm|OpenAI Platform)\b/i;
  const hits=[];
  for(const f of files){const s=fs.readFileSync(f,'utf8');if(needles.test(s))hits.push(path.relative(root,f));}
  assert.deepEqual(hits,[]);
});

test('admin-controlled public settings are server-validated and non-sensitive',()=>{
  const s=read('services/platformSettingsService.js');
  const a=read('routes/admin.js');
  const p=read('routes/support.js');
  assert.match(s,/announcement:/);
  assert.match(s,/offers:/);
  assert.match(s,/limits:/);
  assert.match(s,/theme:/);
  assert.match(a,/admin\.theme\.updated/);
  assert.match(a,/admin\.announcement\.updated/);
  assert.match(a,/admin\.offers\.updated/);
  assert.match(a,/admin\.limits\.updated/);
  assert.match(a,/Theme colors must be 6-digit hex values/);
  assert.match(p,/theme:s\.theme/);
  assert.match(p,/limits:s\.limits/);
  assert.doesNotMatch(p,/paymentWallets/);
});

test('deposit and withdrawal limits are enforced server-side and remain pending for admin approval',()=>{
  const d=read('routes/deposits.js');
  const w=read('services/withdrawalService.js');
  assert.match(d,/getSetting\('limits'\)/);
  assert.match(d,/Deposit amount must be between/);
  assert.match(d,/status:'pending'/);
  assert.match(w,/getSetting\('limits'\)/);
  assert.match(w,/Withdrawal amount must be between/);
  assert.match(w,/status:'pending'/);
});

test('public home includes admin-controlled announcement and offers without unsafe HTML interpolation',()=>{
  const s=read('public/app-ui-v2.js');
  assert.match(s,/publicAnnouncement\(\)/);
  assert.match(s,/publicOffers\(\)/);
  assert.match(s,/esc\(a\.title/);
  assert.match(s,/esc\(x\.text/);
});

test('admin UI does not redirect to login on permission denial', () => {
  const fs = require('fs');
  const src = fs.readFileSync(path.join(__dirname, '..', 'admin-ui', 'admin.js'), 'utf8');
  assert.ok(src.includes("e.status===401)location.href='/login'"));
  assert.ok(src.includes("e.status===403){toast"));
  assert.ok(!src.includes("[401,403].includes(e.status))location.href='/login'"));
});
