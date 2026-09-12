require('dotenv').config();
const {verifyBlockchainTransaction}=require('../services/blockchainVerificationService');
const {getAdminPaymentWallet}=require('../services/paymentWalletService');
(async()=>{
  const network=String(process.env.LIVE_TEST_NETWORK||'TRC20').toUpperCase();
  const txHash=String(process.env.LIVE_TEST_TX_HASH||'').trim();
  const amount=String(process.env.LIVE_TEST_AMOUNT||'').trim();
  if(!txHash||!amount)throw new Error('Set LIVE_TEST_TX_HASH and LIVE_TEST_AMOUNT to a real confirmed USDT transaction sent to the current admin wallet.');
  const wallet=await getAdminPaymentWallet('USDT',network);
  const result=await verifyBlockchainTransaction({currency:'USDT',network,txHash,expectedAmount:amount,expectedRecipient:wallet.address,requiredConfirmations:wallet.confirmations});
  console.log(JSON.stringify({network,wallet:wallet.address,transaction:txHash,result},null,2));
  if(!result.verified)process.exitCode=1;
})().catch(e=>{console.error('LIVE CHAIN SMOKE FAILED:',e.message);process.exitCode=1});
