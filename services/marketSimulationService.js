const ASSETS = {
  BTC: { name: 'Bitcoin', price: 67250.00, volatility: 0.0025, volume: 18400000000 },
  ETH: { name: 'Ethereum', price: 3525.00, volatility: 0.0030, volume: 9200000000 },
  BNB: { name: 'BNB', price: 612.00, volatility: 0.0028, volume: 1800000000 },
  SOL: { name: 'Solana', price: 168.00, volatility: 0.0040, volume: 3200000000 },
  XRP: { name: 'XRP', price: 0.57, volatility: 0.0045, volume: 1200000000 },
  ADA: { name: 'Cardano', price: 0.34, volatility: 0.0040, volume: 420000000 },
  USDT: { name: 'Tether', price: 1.00, volatility: 0.00015, volume: 26000000000 }
};

const state = new Map();

for (const [symbol, asset] of Object.entries(ASSETS)) {
  state.set(symbol, {
    symbol,
    name: asset.name,
    price: asset.price,
    open: asset.price,
    high: asset.price,
    low: asset.price,
    change24h: 0,
    volume24h: asset.volume,
    updatedAt: new Date()
  });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function tick() {
  const now = new Date();
  for (const [symbol, asset] of Object.entries(ASSETS)) {
    const item = state.get(symbol);
    const shock = (Math.random() - 0.5) * 2 * asset.volatility;
    const drift = symbol === 'USDT' ? (1 - item.price) * 0.08 : 0;
    const previous = item.price;
    const next = previous * (1 + shock + drift);

    item.price = symbol === 'USDT'
      ? clamp(next, 0.995, 1.005)
      : Math.max(next, 0.000001);
    item.high = Math.max(item.high, item.price);
    item.low = Math.min(item.low, item.price);
    item.change24h = ((item.price - item.open) / item.open) * 100;
    item.volume24h *= 1 + Math.abs(shock) * 0.35;
    item.updatedAt = now;
  }
}

const interval = setInterval(tick, 3000);
if (interval.unref) interval.unref();

function round(value, digits = 8) {
  return Number(value.toFixed(digits));
}

function serialize(item) {
  return {
    symbol: item.symbol,
    name: item.name,
    price: round(item.price, item.price >= 100 ? 2 : item.price >= 1 ? 4 : 8),
    open: round(item.open, item.open >= 100 ? 2 : item.open >= 1 ? 4 : 8),
    high: round(item.high, item.high >= 100 ? 2 : item.high >= 1 ? 4 : 8),
    low: round(item.low, item.low >= 100 ? 2 : item.low >= 1 ? 4 : 8),
    change24h: round(item.change24h, 4),
    volume24h: Math.round(item.volume24h),
    updatedAt: item.updatedAt.toISOString(),
    simulated: true
  };
}

function getTickers(symbols) {
  const requested = symbols?.length ? symbols : Object.keys(ASSETS);
  return requested
    .map(s => String(s).toUpperCase())
    .filter(s => state.has(s))
    .map(s => serialize(state.get(s)));
}

function getTicker(symbol) {
  const item = state.get(String(symbol).toUpperCase());
  if (!item) return null;
  return serialize(item);
}

function getHistory(symbol, points = 60) {
  const ticker = getTicker(symbol);
  if (!ticker) return null;
  const count = clamp(Number(points) || 60, 10, 240);
  const data = [];
  let price = ticker.price / (1 + ticker.change24h / 100);
  const now = Date.now();
  for (let i = count - 1; i >= 0; i--) {
    const wave = Math.sin(i / 4.5) * 0.0018;
    const noise = (Math.random() - 0.5) * 0.006;
    price = Math.max(0.000001, price * (1 + wave + noise));
    data.push({ time: Math.floor((now - i * 60000) / 1000), value: round(price, price >= 100 ? 2 : price >= 1 ? 4 : 8) });
  }
  data[data.length - 1].value = ticker.price;
  return { symbol: ticker.symbol, data, simulated: true };
}

module.exports = { getTickers, getTicker, getHistory };
