const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('cookie sessions enforce CSRF before route handlers',()=>{
  const s=read('middleware/auth.js');
  assert.match(s,/const hasCookie=Boolean\(readCookie\(req,'ci_session'\)\)/);
  assert.match(s,/hasCookie&&!hasBearer&&req\.get\('x-csrf-guard'\)!=='1'/);
});

test('login and registration never return JWT to browser JavaScript',()=>{
  const s=read('routes/auth.js');
  assert.doesNotMatch(s,/json\(\{success:true,token:t/);
  assert.match(s,/res\.cookie\?res\.cookie\('ci_session'/);
});

test('deposit routing uses only the admin-configured wallet service',()=>{
  const s=read('routes/deposits.js');
  assert.match(s,/getAdminPaymentWallet/);
  assert.doesNotMatch(s,/getPaymentWallet\(/);
  assert.match(s,/walletAddress:wallet\.address/);
  assert.match(s,/adminWalletAddress:wallet\.address/);
  assert.match(s,/txHash/);
});

test('on-chain verification binds recipient to the deposit wallet snapshot',()=>{
  const s=read('routes/admin.js');
  const v=read('services/blockchainVerificationService.js');
  assert.match(s,/expectedRecipient:tx\.walletAddress/);
  assert.match(v,/expectedRecipient/);
  assert.match(v,/admin wallet was found|recipient/);
});

test('admin UI is server-gated and never cached by service worker',()=>{
  const s=read('server.js');
  const sw=read('public/sw.js');
  assert.match(s,/requireAuth\(req,res,\(\)=>requireAdmin\(req,res,next\)\)/);
  assert.match(s,/app\.use\('\/admin-assets',adminGate/);
  assert.match(sw,/u\.pathname\.startsWith\('\/admin'\)/);
});

test('no legacy browser token storage or third-party frontend script is present',()=>{
  const files=['public/js/app.js','public/app-ui.js','admin-ui/admin.js','admin-ui/index.html'];
  for(const f of files)assert.doesNotMatch(read(f),/localStorage|unpkg|cdn\.|googletagmanager|google-analytics|hotjar|clarity|mixpanel|segment|posthog|sentry/i);
});


test('official Tether contracts remain allowlisted; BEP20 requires explicit configuration',()=>{
  const c=require('../config/blockchain');
  assert.equal(c.OFFICIAL_USDT_CONTRACTS.TRC20,'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t');
  assert.equal(c.OFFICIAL_USDT_CONTRACTS.ERC20.toLowerCase(),'0xdac17f958d2ee523a2206206994597c13d831ec7');
  assert.equal(c.OFFICIAL_USDT_CONTRACTS.BEP20,null);
  assert.equal(c.isOfficialUsdtContract('ERC20',c.OFFICIAL_USDT_CONTRACTS.ERC20),true);
  assert.equal(c.validateBlockchainConfig('BEP20'),false);
});

test('dependency installation is deterministic in CI after generating a complete lockfile',()=>{
  const pkg=JSON.parse(read('package.json')); const ci=read('.github/workflows/ci.yml');
  assert.match(pkg.scripts.build,/package-lock-only/);
  assert.match(pkg.scripts['verify:production'],/npm ci --omit=dev/);
  assert.match(ci,/npm run build/);
  assert.match(ci,/npm ci --omit=dev --ignore-scripts/);
});

test('admin withdrawal UI completes processing withdrawals only after provider submission',()=>{
  const ui=read('admin-ui/admin.js');
  assert.match(ui,/x\.status==='processing' && x\.metadata\?\.providerRequestId/);
  assert.match(ui,/x\.status==='processing'\)actions=.*wdSend/);
});

test('legacy environment wallet module fails closed and cannot bypass admin wallet routing',()=>{
  const legacy=require('../config/paymentWallet');
  assert.throws(()=>legacy.getPaymentWallet('USDT','TRC20'),/Legacy environment wallet access is disabled/);
  assert.deepEqual(legacy.getAvailablePaymentWallets(),[]);
});

test('critical dependency metadata is checked after lockfile generation in CI',()=>{
  const ci=read('.github/workflows/ci.yml');
  assert.match(ci,/npm run build/);
  assert.match(ci,/npm ci --omit=dev --ignore-scripts/);
});

test('login UI exposes a real second-step 2FA field and optional referral remains optional',()=>{
  const ui=read('public/app-ui-v2.js');
  assert.match(ui,/id=\"twoFactorField\"/);
  assert.match(ui,/requiresTwoFactor/);
  assert.match(ui,/input class=\"input\" id=\"i\"/);
  assert.doesNotMatch(ui,/id=\"i\"[^>]*required/);
});

test('required default investment range starts at 50 and ends at 5000 without touching custom plans',()=>{
  const s=read('services/defaultDataService.js');
  assert.match(s,/minimumInvestment:'50',maximumInvestment:'499'/);
  assert.match(s,/minimumInvestment:'5000',maximumInvestment:'5000'/);
  assert.doesNotMatch(s,/updateOne|findOneAndUpdate|updateMany|\$setOnInsert/);assert.match(s,/Plan\.exists\(\{slug:p\.slug\}\)/);assert.match(s,/if\(!exists\) await Plan\.create\(p\)/);
});

test('login has duplicate-submit protection and server rate limiting skips successful authentication attempts',()=>{
  const ui=read('public/app-ui-v2.js');
  const auth=read('routes/auth.js');
  assert.match(ui,/if\(submitting\)return/);
  assert.match(ui,/loginBtn/);
  assert.match(auth,/skipSuccessfulRequests:true/);
});

test('withdrawal approval creates a stable provider idempotency key before provider submission',()=>{
  const s=read('services/withdrawalSettlementService.js');
  const a=read('routes/admin.js');
  assert.match(s,/providerIdempotencyKey/);
  assert.match(s,/providerSubmissionStatus:'ready'/);
  assert.match(a,/idempotencyKey:key/);
  assert.match(a,/providerSubmissionStatus':'unknown'/);
  assert.match(read('services/withdrawalSettlementService.js'),/providerSubmissionStatus!=='submitted'/);
});

test('customer deposits and withdrawals remain admin-approved flows',()=>{
  const d=read('routes/deposits.js');
  const w=read('routes/withdrawals.js');
  const ds=read('services/depositService.js');
  assert.match(d,/status:'pending'/);
  assert.match(ds,/approveDeposit/);
  assert.match(w,/createWithdrawal/);
  assert.match(read('services/withdrawalSettlementService.js'),/status:'pending'/);
});

test('app shell disables stale HTML caching and service worker is versioned',()=>{
  const s=read('server.js');
  const sw=read('public/sw.js');
  const index=read('public/app-ui/index.html');
  assert.match(s,/Cache-Control/);
  assert.match(sw,/crypinvest-v6/);
  assert.match(index,/sw-register\.js/);assert.match(read('public/sw-register.js'),/serviceWorker\.register/);
});
