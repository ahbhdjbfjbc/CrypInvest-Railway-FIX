# CrypInvest — Reference UI extraction and implementation audit

Date: 2026-09-10

## Primary references
- `design-reference/01-user-ui-source.jpg` — user-facing board.
- `design-reference/02-admin-ui-source.png` — admin dashboard and management board.

## Extracted visual characteristics
- User board: 1536×1018 px.
- Admin board: 1536×1024 px.
- Dominant background family is near-black navy (`#000C18` to `#071323` range in the sampled pixels).
- Main panel family is deep blue (`#071A29` to `#0C2940`).
- Borders are low-saturation blue, visibly separating panels.
- Primary action/highlight family is warm orange/gold (approximately `#FF9E17` / `#FFC63E`).
- Status/asset accents include emerald/teal, electric blue, violet and red.
- The user board uses compact cards and a mobile bottom navigation pattern.
- The admin board uses a dedicated RTL sidebar, dense data tables, KPI cards, analytics panels, and management shortcuts.

## Screen inventory extracted from the user board
1. Home / landing
2. Login
3. Registration
4. User dashboard
5. Investment plans
6. Deposit
7. Withdrawal
8. Notifications
9. Simulated market
10. Profile
11. Mobile dashboard/navigation

## Admin inventory extracted from the admin board
1. Dashboard KPIs
2. Platform trend chart
3. Investment distribution
4. Recent transactions
5. Recent users
6. Users management
7. Investment plans management
8. Deposits management
9. Withdrawals management
10. Transactions
11. Digital currencies
12. Wallets
13. Networks
14. Tokens/contracts
15. Copy trading
16. Notifications/content
17. Reports
18. Settings/security
19. KYC/compliance
20. Audit log
21. Support

## Implementation changes in this release candidate
- Added the two supplied references to `design-reference/` so the visual source travels with the release candidate.
- Added `UI-SOURCE-OF-TRUTH.md` and this audit so future UI work has a fixed source and does not drift.
- Reworked the admin dashboard KPI values to use actual returned totals instead of pending counts as the primary headline metrics.
- Replaced the admin dashboard placeholder chart with a real seven-day data-driven trend based on database records.
- Corrected market copy so simulated market data is not presented as live data.
- Corrected admin settings wording so non-Super-Admin roles are not told they have full platform authority.
- Added small responsive/spacing refinements without removing the existing UI structure.
- Updated the related smoke test to reflect the intended simulated-market architecture.

## Preservation rule
The original archive remains the untouched rollback baseline. This candidate adds files and modifies existing files only where required for the UI/source-of-truth corrections; it does not intentionally delete any original project file.
