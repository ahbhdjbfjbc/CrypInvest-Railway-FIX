# Dependency lockfile note

The repository retains its original `package-lock.json` so no project file is deleted. The previous lockfile was a direct-dependency bootstrap lock and was not safe to use with `npm ci` as-is.

For a networked release environment, the build now runs `npm install --ignore-scripts --package-lock-only` first, generating the complete npm lock graph, then CI/release runs `npm ci --omit=dev --ignore-scripts`. This avoids shipping a misleading partial lock as if it had been validated locally.

This environment cannot resolve `registry.npmjs.org`, so a complete lockfile cannot be regenerated here. The release build on Railway/GitHub Actions is the authoritative networked dependency validation step.
