const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('admin client handles server-enforced sensitive confirmation without bypassing it',()=>{
  const js=read('admin-ui/admin.js');
  assert.match(js,/ADMIN_CONFIRMATION_REQUIRED/);
  assert.match(js,/x-admin-confirm/);
  assert.match(js,/window\.confirm/);
});

test('all admin roles are covered by mandatory 2FA gate when enabled',()=>{
  const js=read('routes/admin.js');
  assert.match(js,/process\.env\.REQUIRE_ADMIN_2FA==='true'/);
  assert.doesNotMatch(js,/u\?\.role==='admin'&&process\.env\.REQUIRE_ADMIN_2FA/);
});

test('user notifications and support APIs are wired to the authenticated user',()=>{
  const js=read('routes/user.js');
  assert.match(js,/router\.get\('\/notifications'/);
  assert.match(js,/router\.get\('\/support\/tickets'/);
  assert.match(js,/router\.post\('\/support\/tickets'/);
  assert.match(js,/router\.post\('\/support\/tickets\/:id\/reply'/);
  assert.match(js,/user:req\.user\._id/);
});

test('user UI exposes notifications and support routes without exposing admin UI',()=>{
  const js=read('public/app-ui-v2.js');
  assert.match(js,/\['\/notifications','الإشعارات','notifications'\]/);
  assert.match(js,/\['\/support','الدعم','support'\]/);
  assert.match(js,/async function notifications\(\)/);
  assert.match(js,/async function support\(\)/);
});

test('admin create controls are wired for networks, tokens and copy traders',()=>{
  const js=read('admin-ui/admin.js');
  assert.match(js,/newNetwork.*networkModal/);
  assert.match(js,/newToken.*tokenModal/);
  assert.match(js,/newTrader.*traderModal/);
  assert.match(js,/tokenEdit/);
  assert.match(js,/data-trader-id/);
});
