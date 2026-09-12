const {getBlockchainConfig,OFFICIAL_USDT_CONTRACTS,OFFICIAL_USDT_DECIMALS,EXPECTED_CHAIN_IDS,isOfficialUsdtContract}=require('../config/blockchain');
const {cmp}=require('./money');
const TRANSFER_TOPIC='0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const RULES={TRC20:/^[a-fA-F0-9]{64}$/,ERC20:/^0x[a-fA-F0-9]{64}$/,BEP20:/^0x[a-fA-F0-9]{64}$/};
function canonicalTransactionHash(network,hash){const n=String(network||'').toUpperCase();const h=String(hash||'').trim();if(!validateTransactionHash(n,h))throw new Error('Invalid transaction hash.');return n==='ERC20'?'0x'+h.slice(2).toLowerCase():h.toLowerCase()}
function validateTransactionHash(network,hash){return RULES[String(network||'').toUpperCase()]?.test(String(hash||''))||false}
async function fetchJson(url,opts={},timeoutMs=15000){const controller=new AbortController();const t=setTimeout(()=>controller.abort(),timeoutMs);try{const r=await fetch(url,{...opts,signal:controller.signal});const text=await r.text();let data;try{data=JSON.parse(text)}catch{data={}}if(!r.ok)throw new Error(`Blockchain provider returned HTTP ${r.status}.`);return data}catch(e){if(e.name==='AbortError')throw new Error('Blockchain provider request timed out.');throw e}finally{clearTimeout(t)}}
function decString(raw,decimals){const n=BigInt(raw);const d=10n**BigInt(decimals);const i=n/d;let f=(n%d).toString().padStart(decimals,'0').replace(/0+$/,'');return f?`${i}.${f}`:i.toString()}
async function rpc(url,method,params){const data=await fetchJson(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})});if(data.error)throw new Error(data.error.message||'RPC error');return data.result}
async function verifyEvm({cfg,network,txHash,expectedAmount,recipient,expectedSender,requiredConfirmations}){
 const official=OFFICIAL_USDT_CONTRACTS[network];if(network!=='BEP20'&&(!official||!isOfficialUsdtContract(network,cfg.tokenContract)))return {verified:false,reason:'The configured token contract is not the official Tether USDT contract for this network.'};
 const chainId=await rpc(cfg.apiUrl,'eth_chainId',[]);if(String(chainId).toLowerCase()!==String(EXPECTED_CHAIN_IDS[network]||'').toLowerCase())return {verified:false,reason:network==='BEP20'?'The blockchain RPC is not connected to BNB Smart Chain mainnet.':'The blockchain RPC is not connected to the expected Ethereum mainnet.'};
 const code=await rpc(cfg.apiUrl,'eth_getCode',[cfg.tokenContract,'latest']);if(!code||String(code).toLowerCase()==='0x')return {verified:false,reason:'The configured USDT token contract has no deployed bytecode.'};
 const tx=await rpc(cfg.apiUrl,'eth_getTransactionByHash',[txHash]);if(!tx)return {verified:false,reason:'Transaction does not exist on the expected network.'};
 if(expectedSender&&String(tx.from||'').toLowerCase()!==String(expectedSender).toLowerCase())return {verified:false,reason:'Transaction sender does not match the configured admin withdrawal wallet.'};
 const receipt=await rpc(cfg.apiUrl,'eth_getTransactionReceipt',[txHash]);if(!receipt)return {verified:false,reason:'Transaction is not mined yet.'};
 if(String(receipt.status||'0x0')!=='0x1')return {verified:false,reason:'Transaction execution failed.'};
 const token=String(cfg.tokenContract).toLowerCase();if(String(receipt.to||'').toLowerCase()!==token)return {verified:false,reason:'Transaction target is not the official USDT token contract.'};
 const latest=await rpc(cfg.apiUrl,'eth_blockNumber',[]);const block=Number.parseInt(receipt.blockNumber,16);const latestNum=Number.parseInt(latest,16);const confirmations=Math.max(0,latestNum-block+1);
 if(confirmations<Number(requiredConfirmations||1))return {verified:false,reason:'Insufficient confirmations.',confirmations,requiredConfirmations:Number(requiredConfirmations||1)};
 const logs=Array.isArray(receipt.logs)?receipt.logs:[];const target='0x'+String(recipient).slice(-40).toLowerCase();let match=null;
 for(const log of logs){if(String(log.address||'').toLowerCase()!==token)continue;const topics=(log.topics||[]).map(String);if(String(topics[0]).toLowerCase()!==TRANSFER_TOPIC)continue;if(topics.length<3||String(topics[1]).length!==66||String(topics[2]).length!==66)continue;const to='0x'+topics[2].slice(-40).toLowerCase();if(to!==target)continue;match=log;break}
 if(!match)return {verified:false,reason:'No matching ERC-20 Transfer to the admin wallet was found.'};
 const raw=BigInt(String(match.data||'0x0'));let decimals=OFFICIAL_USDT_DECIMALS[network];
 try{const out=await rpc(cfg.apiUrl,'eth_call',[{to:cfg.tokenContract,data:'0x313ce567'},'latest']);if(out)decimals=Number(BigInt(out))}catch{}
 if(decimals!==6)return {verified:false,reason:'The configured USDT token contract decimals must be 6.'};
 const amount=decString(raw,decimals);if(cmp(amount,String(expectedAmount))!==0)return {verified:false,reason:'Transferred amount does not match the deposit amount.',amount,confirmations};
 return {verified:true,amount,recipient,sender:expectedSender||tx.from,network,confirmations,blockNumber:block,transactionHash:txHash,tokenContract:cfg.tokenContract,verifiedAgainstOfficialContract:Boolean(official&&String(cfg.tokenContract).toLowerCase()===String(official).toLowerCase())};
}
async function verifyTron({cfg,txHash,expectedAmount,recipient,expectedSender,requiredConfirmations}){
 if(!isOfficialUsdtContract('TRC20',cfg.tokenContract))return {verified:false,reason:'The configured token contract is not the official Tether USDT TRC20 contract.'};
 const base=String(cfg.apiUrl).replace(/\/$/,'');const headers={'Content-Type':'application/json'};if(cfg.apiKey)headers['TRON-PRO-API-KEY']=cfg.apiKey;
 const info=await fetchJson(base+'/walletsolidity/gettransactioninfobyid',{method:'POST',headers,body:JSON.stringify({value:txHash})});if(!info||!Object.keys(info).length)return {verified:false,reason:'TRON transaction is not solidified yet.'};
 if(info.receipt?.result&&String(info.receipt.result).toUpperCase()!=='SUCCESS')return {verified:false,reason:'TRON transaction execution failed.'};
 let row=null;let fingerprint='';for(let page=0;page<20&&!row;page++){let url=base+'/v1/accounts/'+encodeURIComponent(recipient)+'/transactions/trc20?only_confirmed=true&limit=200&contract_address='+encodeURIComponent(cfg.tokenContract);if(fingerprint)url+='&fingerprint='+encodeURIComponent(fingerprint);const history=await fetchJson(url,{headers});const rows=Array.isArray(history.data)?history.data:[];row=rows.find(x=>String(x.transaction_id||'').toLowerCase()===txHash.toLowerCase()&&String(x.to||'')===recipient);fingerprint=String(history.meta?.fingerprint||'');if(!fingerprint)break;}
 if(!row)return {verified:false,reason:'No matching official TRC-20 USDT transfer to the destination wallet was found.'};
 if(expectedSender&&String(row.from||'')!==String(expectedSender))return {verified:false,reason:'Transaction sender does not match the configured admin withdrawal wallet.'};
 const decimals=Number(row.token_info?.decimals??6);if(decimals!==6)return {verified:false,reason:'The token decimals do not match official Tether USDT.'};
 const amount=decString(String(row.value||'0'),decimals);if(cmp(amount,String(expectedAmount))!==0)return {verified:false,reason:'Transferred amount does not match the deposit amount.',amount};
 const latest=await fetchJson(base+'/walletsolidity/getnowblock',{headers});const latestBlock=Number(latest?.block_header?.raw_data?.number||0);const confirmations=Math.max(0,latestBlock-Number(info.blockNumber||0)+1);
 if(confirmations<Number(requiredConfirmations||1))return {verified:false,reason:'Insufficient solidified confirmations.',confirmations,requiredConfirmations:Number(requiredConfirmations||1)};
 return {verified:true,amount,recipient,sender:expectedSender||row.from,network:'TRC20',confirmations,blockNumber:Number(info.blockNumber||0),transactionHash:txHash,tokenContract:OFFICIAL_USDT_CONTRACTS.TRC20};
}
async function verifyBlockchainTransaction({currency='USDT',network,txHash,expectedAmount,expectedRecipient,expectedSender,requiredConfirmations}){
 if(String(currency).toUpperCase()!=='USDT')throw new Error('Only USDT deposits are supported.');const n=String(network||'').toUpperCase();const canonicalHash=canonicalTransactionHash(n,txHash);if(!expectedRecipient)throw new Error('Deposit wallet snapshot is required.');if(!['TRC20','ERC20','BEP20'].includes(n))throw new Error(`Unsupported USDT network: ${n}.`);const cfg=getBlockchainConfig(n);if(!cfg.apiUrl||!cfg.tokenContract)throw new Error(`Real blockchain verification is not configured for ${n}.`);if(n==='TRC20')return verifyTron({cfg,txHash:canonicalHash,expectedAmount,recipient:expectedRecipient,expectedSender,requiredConfirmations:Number(requiredConfirmations||1)});return verifyEvm({cfg,network:n,txHash:canonicalHash,expectedAmount,recipient:expectedRecipient,expectedSender,requiredConfirmations:Number(requiredConfirmations||1)});
}
module.exports={verifyBlockchainTransaction,validateTransactionHash,canonicalTransactionHash};
