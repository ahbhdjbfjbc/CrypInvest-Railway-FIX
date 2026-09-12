# CrypInvest — Safe Update & Rollback System

## Goal
A bad application release must be recoverable without deleting or overwriting user balances, investments, withdrawals, referrals, or transactions.

## Production update procedure

### 1. Freeze risky changes
Do not change MongoDB data model destructively in the same release as a feature.

### 2. Create a database backup BEFORE deployment
On a trusted machine with MongoDB Database Tools installed:

```bash
npm run backup:db
```

This creates a timestamped compressed `mongodump` archive in `backups/`. Keep it **outside GitHub** and preferably on encrypted storage. Never commit it to Git.

### 3. Run release checks

```bash
npm test
npm run test:syntax
npm run preflight
```

For a real production connection:

```bash
npm run release:preflight
```

The release preflight only reads/pings MongoDB and refuses obvious destructive production flags.

### 4. Deploy to Railway
Railway is configured to use `/api/health` as a deployment healthcheck. CrypInvest returns `503` until MongoDB is connected, so Railway will not activate an unhealthy release. The project also uses restart-on-failure and a short overlap/draining period.

### 5. Verify immediately
Check:
- `/api/health` returns 200
- login works
- dashboard loads
- user balance is unchanged
- investments/withdrawals/transactions are visible
- admin login and admin dashboard work

### 6. If the update is broken
**Rollback the application first. Do not delete MongoDB.**

Railway: Service → Deployments → find the last known-good deployment → `...` → **Rollback**.

Railway restores the previous deployment image and its custom variables. It does not mean deleting or recreating MongoDB.

### 7. Restore the database only when necessary
Only restore MongoDB if a bad migration or data-changing release actually damaged data. Restore into a separate recovery database/cluster first and validate it before touching production.

## Important rule
Application rollback and database rollback are two different operations:

- **Code bug:** rollback Railway only → user data remains.
- **Bad environment variable:** rollback Railway → previous variables are restored too.
- **Database corruption/destructive migration:** stop writes, preserve evidence, restore from backup/recovery process.

## Current project safety
- `/api/health` is database-aware and returns 503 while MongoDB is unavailable.
- No production deployment should run a database reset or demo seed.
- Database changes must remain backward compatible whenever possible.
- Backups are not stored in GitHub.
