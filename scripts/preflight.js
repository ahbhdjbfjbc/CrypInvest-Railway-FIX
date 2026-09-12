const required = ['MONGODB_URI','JWT_SECRET'];
const missing = required.filter(k => !String(process.env[k] || '').trim());
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}
if (String(process.env.JWT_SECRET).length < 32) {
  console.error('JWT_SECRET must be at least 32 characters.');
  process.exit(1);
}
if (String(process.env.NODE_ENV || '').toLowerCase() === 'production') {
  const uri = String(process.env.MONGODB_URI);
  if (/^mongodb:\/\/(127\.0\.0\.1|localhost)(?::|\/)/i.test(uri)) {
    console.error('Production deployments must use a managed/remote MongoDB URI.');
    process.exit(1);
  }
}
console.log('Preflight checks passed.');
