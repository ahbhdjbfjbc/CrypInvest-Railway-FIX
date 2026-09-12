const crypto = require('crypto');
const PAYMENT_PROVIDER = {
  name: process.env.PAYMENT_PROVIDER_NAME || 'admin-provider', apiUrl: process.env.PAYMENT_PROVIDER_API_URL || '', apiKey: process.env.PAYMENT_PROVIDER_API_KEY || '',
  webhookSecret: process.env.PAYMENT_PROVIDER_WEBHOOK_SECRET || '', environment: process.env.PAYMENT_PROVIDER_ENVIRONMENT || 'sandbox', currency:'USDT',
  method: process.env.PAYMENT_PROVIDER_METHOD || 'POST', withdrawalPath: process.env.PAYMENT_PROVIDER_WITHDRAWAL_PATH || '/withdrawals',
  authHeader: process.env.PAYMENT_PROVIDER_AUTH_HEADER || 'Authorization', amountField: process.env.PAYMENT_PROVIDER_AMOUNT_FIELD || 'amount', destinationField: process.env.PAYMENT_PROVIDER_DESTINATION_FIELD || 'destination',
  networkField: process.env.PAYMENT_PROVIDER_NETWORK_FIELD || 'network', currencyField: process.env.PAYMENT_PROVIDER_CURRENCY_FIELD || 'currency', idempotencyHeader: process.env.PAYMENT_PROVIDER_IDEMPOTENCY_HEADER || 'Idempotency-Key'
};
function getPublicProviderInfo(){ return {name:PAYMENT_PROVIDER.name,environment:PAYMENT_PROVIDER.environment,currency:PAYMENT_PROVIDER.currency,configured:Boolean(PAYMENT_PROVIDER.apiUrl&&PAYMENT_PROVIDER.apiKey)}; }
function generateProviderRequestId(){return `PAY-${Date.now()}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;}
function isProviderConfigured(){return Boolean(PAYMENT_PROVIDER.apiUrl&&PAYMENT_PROVIDER.apiKey);}
module.exports={PAYMENT_PROVIDER,getPublicProviderInfo,generateProviderRequestId,isProviderConfigured};
