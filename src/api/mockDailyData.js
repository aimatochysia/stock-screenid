export function getMockDailyData(ticker) {

  const data = [];
  const basePrice = getBasePrice(ticker);
  let currentPrice = basePrice;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 100);

  for (let i = 0; i < 100; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);


    if (date.getDay() === 0 || date.getDay() === 6) continue;


    const volatility = currentPrice * 0.02;
    const change = (Math.random() - 0.5) * volatility;
    currentPrice = Math.max(currentPrice + change, currentPrice * 0.9);

    const open = currentPrice * (0.98 + Math.random() * 0.04);
    const close = currentPrice * (0.98 + Math.random() * 0.04);
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);
    const volume = Math.floor(10000000 + Math.random() * 50000000);

    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume
    });
  }

  return data;
}

function getBasePrice(ticker) {
  const prices = {
    'AAPL': 170,
    'GOOGL': 135,
    'MSFT': 390,
    'TSLA': 260,
    'AMZN': 165,
    'META': 480,
    'NVDA': 750,
    'AMD': 175
  };
  return prices[ticker] || 100;
}
