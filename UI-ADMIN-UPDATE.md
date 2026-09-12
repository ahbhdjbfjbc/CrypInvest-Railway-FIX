# CrypInvest Admin/UI Update

## Included
- Admin dashboard styled around the supplied dark navy/gold reference.
- Full admin-only settings for support, theme colors, homepage announcement, promotional offers, and deposit/withdrawal limits.
- Server-side enforcement of deposit and withdrawal limits.
- Deposits and withdrawals remain pending until the existing admin approval/verification flow completes.
- Homepage announcement/offers are escaped before rendering.
- Mobile-responsive admin settings and public homepage components.
- Existing authentication, KYC, blockchain verification, accounting, and withdrawal idempotency logic preserved.

## Verification
- `npm test`: 43/43 passing.
- `node tests/syntax-check.js`: 62/62 JavaScript files passed.
- HTML structural parse: admin shell and public app shell balanced.

## Important
The design reference was used as a visual target; final pixel-perfect browser rendering still requires running the app against the real MongoDB/Atlas environment and checking desktop + Android viewport screenshots.
