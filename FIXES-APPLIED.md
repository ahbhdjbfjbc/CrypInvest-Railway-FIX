# CrypInvest fixes applied

This build preserves the existing project structure and financial/accounting logic while applying targeted fixes.

## Fixed
- Login duplicate-submit protection: the login button is disabled while a request is in flight.
- Login rate limiting: successful authentication attempts are not counted by the authentication limiter; the limiter is keyed by IP + email and the failure threshold was made less sensitive to accidental repeated clicks.
- Admin 2FA flow: the login state is only updated after successful 2FA verification.
- Stale frontend caching: the app shell now sends no-cache headers and the service worker was versioned and changed to network-first for HTML/navigation.
- Mobile responsiveness: additional rules prevent horizontal overflow, make forms/tables/cards usable on small screens, respect safe-area insets, and keep the desktop visual system intact.
- Deposits: customer deposits remain pending until blockchain verification and explicit admin approval.
- Withdrawals: customer withdrawals remain pending until explicit admin approval.
- Withdrawal provider idempotency: approval creates a stable idempotency key before provider submission; retries reuse the same key.
- Provider submission concurrency: only one admin send attempt can claim a withdrawal at a time.
- Provider request ID: the integration now prefers a provider-returned request/transaction ID when available and retains the local idempotency key separately.
- Withdrawal completion: a withdrawal cannot be marked complete until it has been submitted to the payment provider.
- Documentation: investment maturity wording now matches the implemented principal + configured ROI settlement behavior.
- Regression tests: targeted tests were added; all 40 project tests pass and the 62-file JavaScript syntax check passes in this environment.

## Remaining release limitation
The archive's package-lock contains exact direct runtime dependency pins but is not a fully regenerated transitive lockfile because this isolated environment cannot reach the npm registry. The project therefore remains on `npm install` for this build. A connected CI/release environment must regenerate and validate the complete lockfile before changing production installation to `npm ci`.

## Visual reference images
The final pixel/visual matching pass is intentionally pending the reference images supplied for the target design. The responsive hardening is already applied without replacing the existing design system.

- Login/registration usability: referral code is optional; admin 2FA is optional unless `REQUIRE_ADMIN_2FA=true`; failed-login lock is reduced to 10 failures / 2 minutes; aggressive User-Agent blocking was removed to prevent false-positive login/access blocks.
