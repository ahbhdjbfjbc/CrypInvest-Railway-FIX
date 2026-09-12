# CrypInvest — Full Pre-Termux Audit

## Scope
Static/code/security review of the current CrypInvest archive before replacing the older Termux copy. The review covered authentication, sessions, CSRF, admin authorization, financial state transitions, blockchain verification, payment-provider idempotency, sensitive data handling, frontend escaping, CSP, service-worker caching, API surface, UI IDs/buttons, package lock, and Termux startup.

## Automated results
- `npm test`: **44/44 passed**
- `node tests/syntax-check.js`: **63/63 JavaScript files passed**
- ZIP integrity: verified after packaging
- `npm audit`: **not completed because npm registry access is unavailable in the audit environment**
- `npm ci --offline`: intentionally checked and **fails because the current lockfile is missing transitive cache/lock entries such as `node-addon-api`**. Do not claim this archive has a fully regenerated production lockfile.

## Security controls confirmed
- JWT is verified with explicit HS256 algorithm, issuer and audience.
- Browser sessions use HttpOnly/SameSite cookies; production adds Secure.
- Cookie-authenticated state-changing requests require the CSRF guard header.
- Admin UI/API is server-gated by authenticated admin role.
- Financial approval and transaction state transitions are enforced server-side.
- Deposits remain pending until blockchain verification and admin approval.
- Withdrawals reserve balance atomically and remain pending until admin/provider workflow completes.
- Withdrawal provider submission uses a stable idempotency key before the external call and preserves it across retry/error states.
- Withdrawal completion requires successful provider submission/request ID.
- USDT blockchain verification is fail-closed and binds the recipient to the admin-wallet snapshot.
- Private wallet keys are not stored in tracked source.
- Public database-originated strings are HTML-escaped before interpolation in the current UI.
- CSP restricts scripts to same-origin; the service-worker registration was moved to an external script so CSP does not silently block it.
- API and admin pages are not cached by the service worker.
- Login duplicate-submit protection is present in the current UI.
- Successful authentication attempts do not consume the login rate-limit budget.

## Authentication behavior for testing
- Registration invite/referral code is **optional**.
- Minimum password length is **8 characters**.
- Admin 2FA is **mandatory for administration roles**; `.env.example` sets `REQUIRE_ADMIN_2FA=true`.
- If an admin account has 2FA enabled, the login code is now actually required and verified; it is not silently bypassable.
- Account lockout is short (2 minutes after 10 failed attempts) to reduce accidental testing lockouts while retaining brute-force resistance.
- The login UI displays server errors instead of failing silently.

## Important production gaps / follow-up items
1. **Dependency audit:** run `npm audit --omit=dev --audit-level=high` from a networked release environment and regenerate a complete transitive lockfile before production `npm ci`.
2. **TLS:** Termux localhost testing is fine over `127.0.0.1`; any public deployment must use HTTPS.
3. **Email verification/password recovery:** the current project does not provide a full email verification or password-reset flow. Add these before treating the platform as production-ready.
4. **KYC:** the current KYC model stores identity metadata and only the last four document characters; it is not a full document-upload/KYC provider integration.
5. **Payments:** the withdrawal provider remains configurable and must be set to a real production provider before live withdrawals.
6. **Blockchain:** configure real TRC20/ERC20 RPC/TronGrid credentials and admin deposit wallets before accepting real deposits.
7. **Monitoring:** add centralized alerting for repeated login failures, admin actions, payout failures, and blockchain verification failures before production.
8. **Account enumeration:** some authentication responses still distinguish locked/blocked/suspended accounts. For a hardened public deployment, consider generic authentication responses while keeping detailed events in server logs.
9. **Financial/legal readiness:** this code review does not establish regulatory, accounting, AML/KYC, tax, custody, or licensing compliance.

## UI / button audit
The current public app uses the v2 app shell and the admin UI is server-gated. Static ID/reference comparison shows several references that are intentionally generated dynamically by modal/forms and page render functions; they are not treated as missing controls. The public and admin JavaScript API calls map to the corresponding route families in `routes/`.

## Termux replacement rule
Do not overwrite the old working directory on the first run. Rename it as a backup, extract the new archive into a fresh `~/crypinvest` directory, install dependencies there, configure `.env`, run preflight/database smoke tests, and only then start the new server.
