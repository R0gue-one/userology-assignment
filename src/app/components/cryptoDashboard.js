'use client';
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Coins, DollarSign, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

const coins = {
  Bitcoin: { binance: 'btcusdt', coingecko: 'bitcoin', icon: '₿', color: 'text-amber-500' },
  Ethereum: { binance: 'ethusdt', coingecko: 'ethereum', icon: 'Ξ', color: 'text-indigo-400' },
  Solana: { binance: 'solusdt', coingecko: 'solana', icon: 'S', color: 'text-green-400' },
};

export default function CryptoDashboard() {
  const [cryptoData, setCryptoData] = useState({});

  useEffect(() => {
    async function fetchMarketCaps() {
      try {
        const ids = Object.values(coins).map((c) => c.coingecko).join(',');
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_market_cap=true`
        );
        const data = await res.json();
  
        const updated = {};
        for (const [name, { coingecko }] of Object.entries(coins)) {
          updated[name] = {
            marketCap: `$${(data[coingecko].usd_market_cap / 1e9).toFixed(2)}B`,
          };
        }
  
        setCryptoData((prev) => ({ ...prev, ...updated }));
      } catch (e) {
        console.error('Market cap fetch error', e);
      }
    }
  
    fetchMarketCaps();
    const interval = setInterval(fetchMarketCaps, 60000); // every 1 min
  
    return () => clearInterval(interval);
  }, []);

  const wsRef = useRef(null);

    useEffect(() => {
    const streams = Object.values(coins)
        .map((c) => `${c.binance}@ticker`)
        .join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        const data = msg.data;

        const coinName = Object.keys(coins).find(
        (name) => coins[name].binance === data.s.toLowerCase()
        );

        if (!coinName) return;

        setCryptoData((prev) => ({
        ...prev,
        [coinName]: {
            ...prev[coinName],
            price: `$${parseFloat(data.c).toFixed(2)}`,
            change: parseFloat(data.P).toFixed(2),
        },
        }));
    };

    return () => {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      };
    }, []);


    const router = useRouter();
    const handleDashboardClick = () => {
    router.push(`/crypto/bitcoin`);
    };
    const handleCityClick = (coin) => {
    router.push(`/crypto/${coin}`);
    };

  return (
    <section id="crypto" className="space-y-6">
       <div
        onClick={handleDashboardClick}
        className="flex justify-between items-center border-b border-gray-700 pb-4 cursor-pointer hover:opacity-80 transition"
        >
        <div className="flex items-center gap-2">
            <Coins className="text-yellow-500" size={24} />
            <h2 className="text-2xl font-semibold">Crypto Dashboard</h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(coins).map((coin) => {
          const isPositive = cryptoData[coin]?.change >= 0;
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;
          const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
          
          return (
            <div
              key={coin}
              onClick={() => handleCityClick(coin.toLowerCase())}
              className="bg-gray-800/50 p-6 rounded-2xl backdrop-blur-sm border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className={`text-xl font-bold ${coins[coin].color} bg-gray-700 h-10 w-10 rounded-full flex items-center justify-center`}>
                    {coins[coin].icon}
                  </div>
                  <h3 className="font-bold text-lg text-white">{coin}</h3>
                </div>
                
                {cryptoData[coin]?.change && (
                  <div className={`flex items-center gap-1 ${changeColor}`}>
                    <TrendIcon size={18} />
                    <span className="font-medium">{cryptoData[coin]?.change}%</span>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <DollarSign size={14} /> 
                  <span>Current Price</span>
                </div>
                <div className="text-3xl font-bold text-white">{cryptoData[coin]?.price || '--'}</div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <BarChart3 size={14} />
                  <span>Market Cap</span>
                </div>
                <div className="text-xl text-gray-200">{cryptoData[coin]?.marketCap || '--'}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}