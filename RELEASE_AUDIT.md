# CrypInvest release audit

## Scope
Static code, project structure, accounting paths, authentication/authorization, deployment configuration, frontend rendering, wallet routing, admin isolation, outbound integrations and automated regression checks were reviewed. No production database or live payment/blockchain credentials are present in the archive, so live-network settlement cannot be proven from the archive alone.

## Security fixes included in this release
- Fixed CSRF enforcement for cookie-authenticated state-changing requests by detecting the session cookie directly in the CSRF middleware.
- Removed JWT values from login/register JSON responses; the session is carried by an HttpOnly cookie.
- Removed legacy `localStorage` bearer-token usage from retained frontend code.
- Made deposit routing depend only on admin-configured `PlatformSetting.paymentWallets`.
- Added network-specific wallet address validation.
- Stored the exact admin receiving address and confirmation requirement on each deposit.
- Bound blockchain recipient verification to the stored deposit wallet snapshot.
- Added a hard referral-tree node cap.
- Added Node request/header/keep-alive timeouts.
- Kept admin UI outside `public`, gated its routes server-side, marked responses no-store, and excluded admin paths from the service worker.
- Removed third-party frontend CDN/script dependencies from the active UI.
- Pinned dependency versions exactly in `package.json`.
- Added security regression tests for the fixes above.

## Verification performed
- JavaScript syntax/static checks: **passed (53 JS files)**.
- Automated project/security tests: **18/18 passed**.
- File comparison against the immediately previous `CrypInvest-Final-Ready.zip`: **0 deleted files; 2 additive files** (`services/paymentWalletService.js`, `tests/security-regression.test.js`).
- Search for browser `localStorage` bearer-token usage in application source: **none**.
- Search for third-party frontend CDN/analytics/tracking code in active UI: **none**.
- Search for private-key/seed/production-secret patterns in tracked source: **none found**.
- Live MongoDB and live blockchain/payment-provider integration tests were not possible because no production credentials are contained in the archive.
- `npm install --package-lock-only` could not reach `registry.npmjs.org` in the isolated build environment (`EAI_AGAIN`), so no fabricated lockfile was added. Dependency versions are pinned exactly instead.

## Real-funds deployment gate
Production preflight now refuses a release check unless:
- `MONGODB_URI` and a sufficiently long `JWT_SECRET` are configured;
- all three admin USDT receiving wallets exist in MongoDB settings;
- TRON, Ethereum and BSC verification endpoints/contracts are configured;
- the payment provider URL/API key are configured;
- the payment provider is not running in sandbox mode;
- destructive reset flags are not enabled.

The code therefore does not silently fall back to an environment wallet for deposits when the admin-configured wallet is missing.


## Dependency / real-chain hardening update
- Express pinned to 4.22.2 (latest 4.x line used here to minimize breaking changes).
- Mongoose pinned to 8.24.4.
- bcrypt pinned to 6.0.0.
- `package-lock.json` is present and CI uses `npm ci`. The isolated build environment could not reach the npm registry, so a full transitive lock resolution could not be regenerated locally; the lock contains the exact runtime direct versions and dependency metadata, and CI must regenerate/validate it online before the production release is accepted.
- Official Tether USDT contract allowlist: TRON and Ethereum only; BNB Smart Chain USDT is fail-closed.
- Added `npm run live:chain-test`, which requires a real confirmed deposit to the currently configured admin wallet and real provider endpoints. It intentionally refuses to run without those production inputs.
- Admin withdrawal UI now shows `Complete` only after the provider submission request ID exists; duplicate provider submission is rejected server-side.

## 2026-09-07 security hardening pass
- Closed the critical withdrawal-completion trust gap: an administrator can no longer mark a processing withdrawal completed merely by entering an arbitrary TXID.
- Withdrawal completion now performs real on-chain verification before changing ledger state to `completed`.
- Verification binds the TXID to: the official USDT contract for the selected network, the configured admin withdrawal wallet as the sender, the exact user destination address, the exact net USDT amount, successful transaction execution, and the configured confirmation threshold.
- The verified chain result is stored in both the withdrawal metadata and the ledger transaction metadata for auditability.
- Added/updated regression coverage for the sender-binding verification path.
- `npm test`: **29/29 passed** after the hardening change.
- `node tests/syntax-check.js`: **passed** (61 JS files).

### Remaining production blocker
A real mainnet withdrawal/deposit has still not been executed from this environment because live RPC/DNS access and production credentials are unavailable. The code path is fail-closed, but production launch with customer funds still requires a controlled staging/mainnet smoke test using the actual configured RPC/provider and a small test amount.


## Additional hardening — 2026-09-07
- Canonicalized USDT transaction hashes before uniqueness checks to prevent the same EVM/TRON transaction from being credited more than once using different hex casing.
- Removed unsupported BEP20 from customer deposit/withdrawal selectors; server remains fail-closed.
- Made admin settings form submission handlers replacement-safe so repeated navigation does not accumulate duplicate submit listeners.
- Removed fabricated dashboard percentage trends from the admin UI.
- Added explicit production Dockerfile and Docker ignore rules; the image runs the test suite and syntax checks before the dependency audit.
- CSP keeps executable scripts same-origin while permitting existing inline style attributes through `style-src-attr` only.
- Added additional security/UI regression tests; final local suite: **35/35 passed**, syntax check: **62 JS files passed**.
- Dependency audit against the npm registry could not be completed in this execution environment because outbound DNS/network access to `registry.npmjs.org` is unavailable.

## Final hardening pass — 2026-09-07
- Re-audited customer/admin button wiring and API paths in the primary routed UIs.
- Confirmed investment plan UI reads ROI/limits/duration from the active backend plan instead of hard-coded ROI values in the retained legacy UI.
- Corrected admin financial formatting to `USDT` rather than `$`.
- Replaced fabricated admin dashboard investment distribution percentages with a real investment-principal total from the database.
- Replaced the synthetic dashboard line curve with an explicit no-fake-data message until real trend aggregation is available.
- Removed the hard-coded admin notification count.
- Added server-side dashboard aggregation for total invested principal.
- Re-ran the security/regression suite: **36/36 passed**.
- JavaScript syntax/static checks: **62 JS files passed**.
- The requested unrelated services (`CMS Open Data`, `DailyMed`, `Medicare Care Compare`, `NPI Registry`, `openFDA`, `PubMed`, `RxNorm`, `OpenAI Platform`) were scanned for references and are not dependencies/integrations of CrypInvest.

## Deployment truth
- Railway supports root `Dockerfile` builds and GitHub-based deployment. The repository now contains an explicit Node 22 production Dockerfile.
- Express `4.22.2` is the current `latest-4` release line; bcrypt `6.0.0` is current on npm.
- The bundled `package-lock.json` currently contains direct dependency pins but is not a fully regenerated transitive lock because this execution environment cannot reach the npm registry. Do not claim `npm ci` or a clean live `npm audit` from this environment.
- Live mainnet USDT transfers, real payment-provider webhooks/payouts, load testing, and external KYC/AML/sanctions integrations remain deployment-environment validation tasks.
