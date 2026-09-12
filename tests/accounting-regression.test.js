const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

test('investments cannot consume withdrawal-reserved balance', () => {
  const src = read('services/investmentService.js');
  assert.match(src, /const available=user\.availableBalance\?\.toString\(\)\|\|'0'/);
  assert.match(src, /const reserved=user\.reservedBalance\?\.toString\(\)\|\|'0'/);
  assert.match(src, /const spendable=sub\(available,reserved\)/);
  assert.match(src, /if\(cmp\(spendable,a\)<0\)/);
});

test('deployment does not use multi-process mode with in-memory market state', () => {
  const ecosystem = read('ecosystem.config.js');
  const market = read('services/marketSimulationService.js');
  assert.match(market, /const state = new Map\(\)/);
  assert.match(ecosystem, /instances:1/);
  assert.match(ecosystem, /exec_mode:'fork'/);
});

test('outbound provider calls have finite timeouts', () => {
  assert.match(read('services/paymentProviderService.js'), /AbortController/);
  assert.match(read('services/blockchainVerificationService.js'), /AbortController/);
  assert.match(read('services/paymentProviderService.js'), /15000/);
  assert.match(read('services/blockchainVerificationService.js'), /15000/);
});

test('session version is never exposed in safe user objects', () => {
  const src = read('models/User.js');
  assert.match(src, /delete o\.sessionVersion/);
  assert.match(read('middleware/auth.js'), /sessionVersion/);
});
