# CrypInvest — Live Funds Readiness

This release keeps all real-money paths fail-closed until the deployment environment is configured. No private key or provider secret belongs in GitHub.

## Deposits
- TRC20: live verification uses the official Tether USD₮ TRC20 contract configured by the application.
- ERC20: live verification uses the official Tether USD₮ ERC20 contract configured by the application.
- BEP20: the application supports BNB Smart Chain as an EVM network, but the token contract must be explicitly configured and independently verified before enabling deposits. The code does not invent or silently trust an unofficial contract.
- Every submitted deposit is stored as pending, the transaction hash is canonicalized, and an admin must verify it on-chain before approval.

## Withdrawals
- User requests are reserved in the ledger and remain pending.
- Admin approval changes the withdrawal to processing and creates a stable idempotency key.
- The configured payment provider receives the withdrawal only after admin approval.
- Completion requires a provider submission ID and a successful on-chain verification of the exact destination, amount, token contract and confirmations.

## Production configuration
Set these only as Railway/private deployment variables: MongoDB URI, JWT secret, TronGrid/RPC endpoints and keys, the explicitly verified BEP20 token contract if BEP20 is enabled, and the audited withdrawal provider URL/key/webhook secret.

The release preflight intentionally fails until production chain configuration, admin wallets, admin 2FA, and a production withdrawal provider are present.

## Real end-to-end proof
`npm run live:chain-test` verifies a real confirmed USDT deposit transaction against the current admin wallet. A real withdrawal still requires a real provider account and a real provider-submitted transaction; those credentials are external to this repository and must not be committed.
