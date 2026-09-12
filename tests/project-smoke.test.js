const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const requiredFiles = [
  'server.js','package.json','.env.example','ecosystem.config.js',
  'models/User.js','models/InvestmentPlan.js','models/Investment.js',
  'models/Transaction.js','models/Withdrawal.js','models/Referral.js',
  'routes/auth.js','routes/user.js','routes/plans.js','routes/investments.js',
  'routes/deposits.js','routes/withdrawals.js','routes/admin.js','routes/market.js',
  'services/money.js','services/defaultDataService.js',
  'services/depositService.js','services/investmentService.js',
  'services/investmentSettlementService.js','services/withdrawalService.js',
  'services/withdrawalSettlementService.js','scripts/bootstrap-admin.js'
];

test('project structure is complete', () => {
  for (const f of requiredFiles) assert.equal(fs.existsSync(path.join(ROOT, f)), true, `missing ${f}`);
});

test('package has required runtime dependencies and scripts', () => {
  const pkg = JSON.parse(read('package.json'));
  for (const dep of ['express','mongoose','bcrypt','jsonwebtoken','helmet','express-rate-limit','node-cron','dotenv']) {
    assert.ok(pkg.dependencies?.[dep], `missing dependency ${dep}`);
  }
  for (const script of ['start','test:syntax','test','bootstrap:admin']) assert.ok(pkg.scripts?.[script]);
  assert.ok(pkg.engines?.node);
});

test('server mounts expected API surfaces and security controls', () => {
  const s = read('server.js');
  for (const route of ['/api/auth','/api/user','/api/plans','/api/market','/api/investments','/api/deposits','/api/withdrawals','/api/payment-wallet','/api/admin']) {
    assert.match(s, new RegExp(`app\\.use\\('${route.replaceAll('/','\\/')}'`));
  }
  assert.match(s, /helmet\(/);
  assert.match(s, /X-Robots-Tag/);
  assert.match(s, /X-Frame-Options/);
  assert.match(s, /express-rate-limit/);
});

test('single-currency accounting is consistent with USDT deposit/withdrawal flow', () => {
  const plan = read('models/InvestmentPlan.js');
  const tx = read('models/Transaction.js');
  const defaults = read('services/defaultDataService.js');
  assert.match(plan, /default:'USDT'/);
  assert.match(plan, /enum:\['USDT'\]/);
  assert.match(tx, /default:'USDT'/);
  assert.match(defaults, /currency:'USDT'/);
});

test('financial amount helper rejects malformed and negative amounts', () => {
  const money = require(path.join(ROOT, 'services/money.js'));
  assert.equal(money.add('1.25','2.75'), '4');
  assert.equal(money.sub('5','1.25'), '3.75');
  assert.equal(money.cmp('5','5'), 0);
  assert.equal(money.cmp('4','5'), -1);
  assert.equal(money.positive('0.000000000000000001'), true);
  assert.throws(() => money.normalizeDecimal('-1'));
  assert.throws(() => money.normalizeDecimal('abc'));
  assert.throws(() => money.sub('1','2'));
});

test('market is internally generated while user-facing UI stays neutral', () => {
  const route = read('routes/market.js');
  const legacy = read('services/marketSimulationService.js');
  const page = read('public/app-ui-v2.js');
  assert.match(route, /marketSimulationService/);
  assert.doesNotMatch(page, /محاك|simulation|SIMULATION/i);
  assert.match(legacy, /BTC/);
});

test('public frontend escapes database-originated strings', () => {
  const app = read('public/js/app.js');
  assert.match(app, /const esc=/);
  assert.match(app, /esc\(p\.name\)/);
  assert.match(app, /esc\(p\.description/);
  assert.match(app, /esc\(i\.investmentId\)/);
});

test('no private wallet key is configured in tracked source files', () => {
  const banned = /PRIVATE_KEY|MNEMONIC|SEED_PHRASE|WALLET_PRIVATE_KEY/i;
  const files = [];
  function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
      if (name === 'node_modules' || name === '.git') continue;
      const full = path.join(dir, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full);
      else if (/\.(js|json|md|html|sh|env\.example)$/.test(name)) files.push(full);
    }
  }
  walk(ROOT);
  for (const f of files) {
    if (path.basename(f) === 'project-smoke.test.js') continue;
    const text = fs.readFileSync(f, 'utf8');
    assert.doesNotMatch(text, banned, `private-key marker found in ${path.relative(ROOT,f)}`);
  }
});

test('production container build is explicitly defined',()=>{ assert.ok(fs.existsSync(path.join(ROOT,'Dockerfile'))); const d=read('Dockerfile'); assert.match(d,/FROM node:22/); assert.match(d,/npm install --ignore-scripts/); assert.match(d,/npm test/); });
