// Legacy compatibility module retained so older imports do not disappear.
// New production code MUST use services/paymentWalletService.js, which reads only
// the admin-configured MongoDB wallet. This legacy module fails closed for all
// networks rather than reintroducing an environment-wallet fallback.
const PAYMENT_WALLETS = {
  USDT: {
    TRC20: { address: process.env.USDT_TRC20_ADDRESS || '', confirmations: Number(process.env.USDT_TRC20_CONFIRMATIONS || 12) },
    ERC20: { address: process.env.USDT_ERC20_ADDRESS || '', confirmations: Number(process.env.USDT_ERC20_CONFIRMATIONS || 12) },
    BEP20: { address: process.env.USDT_BEP20_ADDRESS || '', confirmations: Number(process.env.USDT_BEP20_CONFIRMATIONS || 15) }
  }
};
function getPaymentWallet() {
  throw new Error('Legacy environment wallet access is disabled. Use the admin-configured wallet service.');
}
function getAvailablePaymentWallets() {
  return [];
}
module.exports = { PAYMENT_WALLETS, getPaymentWallet, getAvailablePaymentWallets };
