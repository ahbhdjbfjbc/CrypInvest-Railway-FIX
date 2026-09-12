# CrypInvest deployment checklist

## 1. GitHub
Push the repository contents, but never commit `.env`, provider secrets, private wallet keys, seed phrases, or production JWT secrets.

## 2. MongoDB Atlas
Create a database named `crypinvest`, create a dedicated database user, and copy the Node.js `mongodb+srv://...` connection string into the hosting environment variable `MONGODB_URI`. Keep the database IP access policy as narrow as the deployment allows.

## 3. Hosting environment variables
Required: `MONGODB_URI`, `JWT_SECRET`.
Recommended: `NODE_ENV=production`, `PORT` supplied by the host, and the wallet/provider settings only after the relevant audited integrations are ready.

## 4. First deploy
Run `npm install` and `npm start`. The current archive pins the direct runtime versions in `package-lock.json`; a full transitive lockfile regeneration still requires npm-registry access and must be completed in a connected CI/release environment before switching the image to `npm ci`. The app seeds the five default USDT plans on first successful database connection.

## 5. First admin
Temporarily set `BOOTSTRAP_ADMIN_NAME`, `BOOTSTRAP_ADMIN_EMAIL`, and a strong `BOOTSTRAP_ADMIN_PASSWORD`, run `npm run bootstrap:admin` once, then remove the bootstrap password from the environment.

## 6. Verification
Run `npm test`, `npm run test:syntax`, then `npm run preflight`. With a real MongoDB connection, run `npm run db:smoke`.

## 7. Before accepting real funds
Do not enable production payments until blockchain verification, provider APIs, KYC/AML, 2FA, monitoring, backups, audit controls, and an independent security review are completed.


## 8. Real deposit verification
Use production RPC/TronGrid endpoints and the exact official Tether USDT token contract for each supported network. The release supports TRC20 and Ethereum ERC20 USDT; BNB Smart Chain USDT is fail-closed because Tether does not publish an official USD₮ contract there. Ethereum-compatible verification uses the chain receipt and ERC-20 Transfer event; TRON uses solidified transaction/contract history. Do not put any private wallet key in the repository.

## 9. Admin hardening
Production admin APIs require admin 2FA. Configure 2FA immediately after bootstrapping the first admin, then re-login. KYC approval is required for withdrawals and investments unless explicitly disabled by an authorized operator.

## Production money-deposit gate

Real USDT deposits are fail-closed: a deposit address must be configured by an authenticated admin in **Settings → Deposit Wallets**. The user-facing deposit endpoint reads only that MongoDB setting; there is no environment-wallet fallback. Each deposit stores the displayed admin wallet as a snapshot, and on-chain verification credits only a matching USDT transfer to that exact snapshot address.

Before switching to production, configure real RPC/TronGrid endpoints and the correct USDT token contracts for each enabled network, then run `npm run production:preflight`. The preflight blocks production when any supported blockchain verifier, admin wallet, all-admin 2FA requirement, or withdrawal provider production setting is missing.
