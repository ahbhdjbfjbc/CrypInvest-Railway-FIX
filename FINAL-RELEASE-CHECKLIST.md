# CrypInvest final release checklist

## Source protection
- Original project preserved as rollback reference.
- No original project file deleted by the UI integration.
- Secrets remain outside source control.
- Admin assets are server-gated and not cached by the service worker.

## UI/UX
- Supplied user and admin images are stored under `design-reference/`.
- RTL Arabic layout, dark navy surfaces, gold primary actions, blue/green status accents, dense admin tables, responsive breakpoints and mobile navigation are implemented.
- User-facing market UI contains no simulation/provider disclaimer text.
- Market generation remains internal and non-live in the backend.

## Security
- Cookie sessions, CSRF, rate limits, Helmet/CSP, admin role guards, mandatory admin 2FA, IP allow-listing, sensitive-action confirmation, audit logs, wallet snapshot verification, duplicate transaction protection and fail-closed chain verification are covered by automated checks.

## Admin integration
- Dashboard metrics include users, active users, linked wallets, investments, deposits, withdrawals, transactions, volume, fees, pending and failed counts.
- Role-specific navigation and permission presentation are dynamic.
- Network health checks use chain-appropriate probes for EVM and TRON-style providers.
- Report user counts respect report date filters.
- PDF report generation does not make an internal HTTP request to localhost.

## Required release gate
Automated tests must pass. A real MongoDB/Railway deployment and real provider credentials are still required before accepting real funds.
