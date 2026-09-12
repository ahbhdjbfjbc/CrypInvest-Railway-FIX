const OFFICIAL_USDT_CONTRACTS = Object.freeze({
  TRC20: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  ERC20: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  // Tether's official supported-protocol list does not publish a USD₮ contract for BNB Smart Chain.
  // Fail closed instead of accepting a Binance-Peg/bridged token as official Tether USD₮.
  BEP20: null
});
const OFFICIAL_USDT_DECIMALS = Object.freeze({TRC20: 6, ERC20: 6});
const EXPECTED_CHAIN_IDS = Object.freeze({ERC20:'0x1',BEP20:'0x38'});

const blockchainConfig={
 TRC20:{network:'TRC20',name:'TRON',apiUrl:process.env.TRON_GRID_URL||process.env.TRON_API_URL||'',apiKey:process.env.TRON_GRID_API_KEY||process.env.TRON_API_KEY||'',tokenContract:process.env.USDT_TRC20_CONTRACT||OFFICIAL_USDT_CONTRACTS.TRC20,rpcUrl:process.env.TRON_RPC_URL||''},
 ERC20:{network:'ERC20',name:'Ethereum',apiUrl:process.env.ETHEREUM_RPC_URL||process.env.ETHEREUM_API_URL||'',apiKey:process.env.ETHEREUM_API_KEY||'',tokenContract:process.env.USDT_ERC20_CONTRACT||OFFICIAL_USDT_CONTRACTS.ERC20},
 BEP20:{network:'BEP20',name:'BNB Smart Chain',apiUrl:process.env.BSC_RPC_URL||process.env.BSC_API_URL||'',apiKey:process.env.BSC_API_KEY||'',tokenContract:process.env.USDT_BEP20_CONTRACT||''}
};
function getBlockchainConfig(network){const c=blockchainConfig[String(network).toUpperCase()];if(!c)throw new Error('Unsupported blockchain network.');return c}
function getOfficialUsdtContract(network){return OFFICIAL_USDT_CONTRACTS[String(network||'').toUpperCase()]||null}
function isOfficialUsdtContract(network,address){const official=getOfficialUsdtContract(network);return Boolean(official&&String(address||'').toLowerCase()===official.toLowerCase())}
function validateBlockchainConfig(network){const n=String(network).toUpperCase();const c=getBlockchainConfig(n);if(!c.apiUrl||!c.tokenContract)return false;if(n==='BEP20')return /^0x[a-fA-F0-9]{40}$/.test(c.tokenContract);const official=getOfficialUsdtContract(n);if(!official||!isOfficialUsdtContract(n,c.tokenContract))return false;if(n==='TRC20')return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(c.tokenContract);return /^0x[a-fA-F0-9]{40}$/.test(c.tokenContract)}
module.exports={blockchainConfig,OFFICIAL_USDT_CONTRACTS,OFFICIAL_USDT_DECIMALS,EXPECTED_CHAIN_IDS,getBlockchainConfig,getOfficialUsdtContract,isOfficialUsdtContract,validateBlockchainConfig};
