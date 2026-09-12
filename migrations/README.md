# CrypInvest database migration safety policy

CrypInvest uses MongoDB/Mongoose. Production updates must follow these rules:

1. **Never** call `dropDatabase()`, delete all users, or reset collections as part of a deployment.
2. Prefer additive, backward-compatible schema changes first: add optional fields/indexes, deploy code that understands both old and new records, then backfill data separately.
3. A destructive/renaming migration is a separate controlled operation with a verified backup and a tested restore plan.
4. Do not make a migration irreversible in the same release that introduces code depending on it.
5. The old application version must remain able to read the database while Railway is switching traffic.
6. If a release is bad, rollback the application first. Do **not** restore the database unless the release actually changed/corrupted data.
7. If a data migration changed records incorrectly, restore to a separate recovery cluster first, validate it, then perform a controlled recovery.
