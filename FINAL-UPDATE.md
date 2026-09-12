# CrypInvest final additive security update

This release is additive: no file from the previous release was deleted.

## Added and hardened
- Arabic RTL public UI and dedicated dark/gold admin UI.
- Dedicated admin route and assets outside `public`; `/admin`, `/admin/`, `/admin.html`, and `/admin-operations.html` require authentication and the `admin` role.
- Admin pages are sent with `Cache-Control: no-store, private` and are excluded from the service-worker cache.
- Admin management for users, plans, deposits, withdrawals, investments, transactions, market view, deposit wallets and support settings.
- Deposit wallets are sourced only from `PlatformSetting.paymentWallets`, configured by the admin. Environment wallet variables are retained only for backward compatibility and are not used for deposit routing.
- User deposit creation snapshots the exact admin-configured receiving address and required confirmations.
- On-chain verification checks the recipient against that deposit snapshot, so changing the admin wallet later cannot redirect or silently change an existing deposit record.
- Login and registration set an HttpOnly session cookie and no longer return the JWT to browser JavaScript.
- Cookie-authenticated state-changing requests require the CSRF header; Bearer-token requests remain compatible.
- Legacy frontend code no longer stores bearer tokens in `localStorage`.
- Strict same-origin frontend CSP and no third-party frontend script/CDN dependency.
- Referral-tree response has a hard node cap to limit resource exhaustion.
- Node HTTP request/header/keep-alive timeouts are set for production resilience.
- Production release preflight now requires configured admin deposit wallets, blockchain verification settings, a payment provider, and a non-sandbox provider environment.
- Dependency versions in `package.json` are pinned exactly.
- Added security regression tests for CSRF, JWT exposure, admin wallet routing, recipient binding, admin isolation and third-party/localStorage checks.

## Important production boundary
The archive contains no live MongoDB/provider credentials. Real-funds operation still requires the production environment variables and the actual blockchain/payment-provider endpoints to be configured. The release preflight intentionally refuses production startup checks when those real integrations are missing.
