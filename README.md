# CrypInvest — Complete Project Layout

A Node.js/Express/MongoDB crypto investment platform foundation with a dark orange visual language inspired by the supplied reference screens. It includes user authentication, invitation/referral tree, investment plans, deposits, withdrawals, admin operations, ledger transactions, balance reservation, scheduled maturity settlement, and responsive web pages.

## Important financial behavior
- No guaranteed return field is implemented.
- No artificial profit/loss manipulation is implemented.
- At maturity, the current settlement job credits the investment principal plus the configured plan ROI as a single investment-return ledger entry. This is a configured simulation/strategy rule and must not be presented as a guaranteed return without appropriate legal and financial review.
- Private wallet keys must never be stored in MongoDB or the Node.js application.

## Install
1. Copy `.env.example` to `.env` and set `MONGODB_URI` and a strong `JWT_SECRET`.
2. `npm ci`
3. MongoDB must support transactions (replica set / Atlas).
4. `npm start`
5. Open `http://localhost:3000`.

## Provider integration
`services/paymentProviderService.js` contains the only outbound payment-provider call. It uses configurable URL/path/field/header names so the actual provider API can be wired without inventing an API contract. The blockchain verification service likewise expects a normalized provider response containing `verified`, `recipient`, `amount`, and `confirmations`.

## Admin
Create/promote an admin directly in the database or through a controlled migration. Do not expose public admin registration.

## PM2
`pm2 start ecosystem.config.js` then `pm2 save`.

## File order
- `server.js` — application entry point
- `config/` — wallet, blockchain and payment-provider configuration
- `models/` — MongoDB schemas
- `middleware/` — authentication/authorization
- `services/` — accounting, investment, withdrawal, provider and verification logic
- `routes/` — public, user and admin APIs
- `jobs/` — scheduled settlement
- `public/` — responsive web frontend
- `tests/` — syntax validation

## Frontend routes
- `/` landing page
- `/login.html`, `/register.html`
- `/dashboard.html`, `/deposit.html`, `/withdraw.html`, `/referrals.html`
- `/admin.html`, `/admin-operations.html`
- PWA manifest + service worker included for installable mobile-web behavior.

## Internal market simulation
The platform now includes an internal simulated market. It does not connect to CoinGecko, Binance, Coinbase, an exchange, or a blockchain price feed. Prices for BTC, ETH, BNB, SOL, XRP, ADA and USDT move in memory every few seconds and are exposed through `/api/market/tickers`, `/api/market/ticker/:symbol`, and `/api/market/history/:symbol`.

The simulation resets when the Node.js process restarts. It is intended for UI/demo/testing purposes only and must not be presented to users as live market prices.


## Phone / Termux quick setup
The provided Termux archive is intended to replace the previous local copy safely. Keep the old folder renamed as a backup, then extract this archive into a new folder and configure `.env`.
1. Install Termux from F-Droid or the official Termux GitHub release.
2. Run `termux-setup-storage`, copy the ZIP into Downloads, then unzip it.
3. Enter the project folder and run `npm ci`.
4. Copy `.env.example` to `.env`, then set `MONGODB_URI` and a strong `JWT_SECRET`.
5. Run `npm run bootstrap:admin` once with the three `BOOTSTRAP_ADMIN_*` variables set; save the printed invite code, then remove the admin password from the environment.
6. Run `npm start` and open `http://127.0.0.1:3000`.
7. The app automatically creates the five starter plans if they do not already exist.

## Mobile-first features added
- Bottom navigation on small screens.
- Invite links that pre-fill the registration code.
- Recent transaction history on the dashboard.
- Profile/password APIs.
- Default investment-plan seeding on first startup.
- One-time admin bootstrap script; no public admin registration.

The mobile package is a responsive PWA/web app. It is not a compiled native APK yet.

## Deployment validation

Run `npm run test` for dependency-free project smoke tests after extraction. Run `npm run preflight` after creating `.env`. Once MongoDB Atlas is configured, run `npm run db:smoke` to verify connectivity, collection access, and default plan seeding. For a non-production local/demo database only, set `SEED_DEMO_DATA=true` and run `npm run seed:demo`. Never use demo seed credentials on production.

## GitHub / hosting readiness

The repository is safe to initialize in GitHub because `.env`, logs, and `node_modules` are ignored. Do not commit wallet private keys, seed phrases, real provider secrets, or production JWT secrets. Use GitHub Secrets / hosting environment variables for production configuration.

## Release candidate notes

- Investment spending now uses `availableBalance - reservedBalance`, preventing a pending withdrawal from being spent twice.
- Password changes and bootstrap admin password resets increment a session version, invalidating previously issued JWTs.
- The health endpoint returns HTTP 503 until MongoDB is connected.
- Outbound blockchain/payment-provider requests time out after 15 seconds.
- PM2 is configured as a single forked process because the included market simulator keeps state in process memory.
- Market data remains simulated and must not be represented as live exchange pricing.

## Production boundary

This repository is deployment-ready as an application foundation, not a guarantee that real-money operations are production-safe. Before accepting real funds, complete independent security testing, KYC/AML and legal review, audited blockchain/payment integrations, 2FA, monitoring/alerting, backups, reconciliation and incident-response procedures.


## Final additive UI/security update
See `FINAL-UPDATE.md`. The new public UI is Arabic/RTL and the admin panel is served through an authenticated, admin-only route with protected assets.
