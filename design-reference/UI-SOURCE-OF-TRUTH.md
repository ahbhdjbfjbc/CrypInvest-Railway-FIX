# CrypInvest UI/UX Source of Truth — 2026-09-10

The two attached reference boards are the PRIMARY visual source for this release candidate. They define the intended quality, hierarchy, spacing, component language, responsive behavior, and separation between user and admin experiences. They are references, not a replacement for functional HTML/CSS.

## Global visual language
- Direction: Arabic RTL.
- Theme: deep navy/near-black crypto terminal aesthetic.
- Primary accent: warm orange/gold for CTAs, active states, logo marks, highlights.
- Secondary accents: electric blue, emerald/teal, violet, red for status/asset identity.
- Surfaces: layered dark-blue cards with subtle blue borders and soft shadows.
- Typography: compact, high-contrast Arabic UI; headings bold; supporting text muted blue-gray.
- Corners: compact rounded cards/buttons; avoid excessive pill-shaped containers except statuses.
- Borders: thin, visible blue lines separating panels.
- Motion: restrained hover/press feedback; no distracting animation.

## User UI source board (01)
1. Landing page: dark hero, Bitcoin/growth visual, strong Arabic headline, two CTA buttons, market ticker row, investment-plan cards, trust/stat strip.
2. Login: centered dark card, branded crypto visual, email/password fields, remember/recovery controls, orange primary CTA, optional Google-style secondary action.
3. Registration: same visual system as login, with name/email/password/referral/terms fields and orange CTA.
4. User dashboard: account header, balance card, deposit/withdraw quick actions, recent activity, investment plans and market information.
5. Investment plans: vertically stacked/boxed plans with colored coin/category icon, amount, return rate, duration and clear orange action.
6. Deposit: USDT asset selector, TRC20/ERC20/BEP20 network selector, admin-provided wallet address, copy action, QR area, TX hash and confirmation status.
7. Withdrawal: network selector, destination wallet, amount/limits, request CTA, and recent withdrawal status.
8. Notifications: transaction/deposit/withdrawal notifications with status and timestamp, plus clear read/action affordances.
9. Simulated market: exchange-like compact table/list, coin icons, price/change, chart, time-range controls; must be visibly labeled simulated when data is not live.
10. Profile: avatar, account data, security/settings rows, password/KYC controls, clear primary action.
11. Mobile: preserve the same visual hierarchy; compact header and fixed bottom navigation; cards become one/two-column stacks without horizontal overflow.

## Admin UI source board (02)
- Admin is a completely separate experience from the user UI. It must never be exposed through the normal user navigation.
- Desktop: fixed RTL sidebar, top bar with search/notifications/admin identity, content workspace.
- Sidebar sections: dashboard, users, investments, deposits, withdrawals, transactions, investment plans, digital currencies, wallets, networks, tokens, copy trading, notifications/content, reports, settings, KYC, audit log, support according to role.
- Dashboard top KPI row: users, investments, deposits, withdrawals.
- Main analytics area: real data-driven line chart, investment distribution visualization, recent transactions table, recent users list.
- Quick-management cards: users, investments, deposits, withdrawals, platform settings.
- Tables: compact, dense, readable; status badges; filters; pagination; action buttons.
- Settings: permissions/2FA, wallet addresses, support, theme, announcements/offers, admin session security, deposit/withdrawal limits.
- Mobile admin: collapsible sidebar, compact top bar, horizontally scrollable data tables only where necessary, stacked panels.

## Non-negotiable implementation rules
- Do not delete existing application files to implement the visual work.
- Do not replace working business/security logic with mock logic.
- Do not embed the reference screenshots as the actual UI. Rebuild their components in HTML/CSS/JS so the platform remains functional and responsive.
- Keep admin authorization server-side.
- Keep secrets out of the repository.
- Keep simulated market data explicitly labeled as simulated.
- User-facing wallet addresses must come from admin-configured settings.
- Preserve rollback ability by keeping the original archive as the untouched baseline.
