# CrypInvest — Exact Final Changes

This release was edited in-place from the audited CrypInvest-GitHub-Ready-Fixed tree.

## No core deletion
- Files deleted compared with the source audited ZIP: 0.
- Existing project files are retained, including the original package-lock.json.
- Changes are targeted edits only; two new markdown notes are added.

## Fixed items
1. Final Arabic RTL UI now uses the v2 app shell consistently at `/` and removes the obsolete inline-script root shell.
2. Header authentication state now shows the authenticated user's account and logout action on every v2 page, including the homepage.
3. 2FA login is a real two-step UI: the code field is hidden initially and is shown when the server returns `requiresTwoFactor`.
4. Registration referral code is optional in both the active v2 UI and legacy static registration markup; `ref` and `inviteCode` URL parameters are accepted.
5. Default investment tiers now start at 50 USDT and top out at exactly 5000 USDT. Existing legacy default tiers are migrated only when their old min/max values exactly match the original defaults; custom admin-edited plans are not overwritten.
6. Customer deposit and withdrawal network selectors support TRC20, ERC20 and BEP20. BEP20 is fail-closed until an explicit BNB Smart Chain RPC and token contract are configured; the code never invents an official Tether contract.
7. Admin wallet settings can store a BEP20/BNB Smart Chain address and confirmation count instead of silently disabling the field.
8. Withdrawal destination validation accepts BEP20 EVM addresses, while approvals still require the existing admin/provider/on-chain workflow.
9. Normal successful API reads no longer consume the global read rate-limit counter, greatly reducing false `عدد الطلبات كبير جدًا` blocks during ordinary browsing; failed requests remain rate-limited.
10. Price cards have inline SVG icons, movement animation, and simulated price updates every 3 seconds without external frontend libraries.
11. Service worker cache version is bumped to v6 so the updated UI is not served from the previous cache.
12. CI/Railway dependency flow now generates a complete lock graph in a networked build before running deterministic `npm ci`. The original package-lock.json is retained and is not falsely represented as a fully validated lock in this offline environment.
13. Real-money paths remain fail-closed: production preflight requires chain configuration, admin wallets, admin 2FA and a production withdrawal provider. A real withdrawal provider secret is never committed to GitHub.

## Live money limitation
A code audit cannot prove a real transfer without using the deployment's actual RPC/provider credentials and a real transaction. The repository includes `npm run live:chain-test` for a real confirmed deposit verification. Provider credentials and real withdrawal transactions must be supplied only in the private deployment environment.

## Admin control expansion — exact behavior
- Existing project files were retained; new admin models/pages were added.
- Admin roles: `super_admin`, `admin`, `support`, `finance`, `auditor`, `content_manager`.
- Server-side permission guards now protect administration APIs by role; the UI does not grant permissions by itself.
- Every administrative mutation is covered by the existing audit middleware and explicit audit entries for sensitive resources.
- Admin login is a separate `/admin/login` page and administration URLs are server-gated.
- All administrative roles require 2FA at login. The bootstrap script provisions a Super Admin with 2FA enabled.
- User administration includes detail/history, notes, force logout, status, and verification-request auditing.
- Blockchain/network, token, copy-trading, notifications/content, and reporting APIs are persisted in MongoDB.
- CSV transaction export is available to permitted reporting roles.
- No private wallet keys are exposed; wallet configuration remains address-only.
- `ensureDefaultPlans()` NEVER updates existing plans. It only creates a missing plan by slug; an admin-edited plan is left exactly as stored.


## Final UI-only/live-market pass
- Active admin and user controls now use inline SVG icons instead of emoji/glyph controls.
- Button hover, active and keyboard-focus states were polished without changing action handlers.
- Market endpoints now use live public Binance market data with short server-side caching; no silent simulated prices are returned.
- The existing internal simulation service remains untouched in the repository.
- No existing core file was deleted in this pass.
