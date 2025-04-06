'use client';
import { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown, Coins, DollarSign, BarChart3, Star, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { addCoin, removeCoin, toggleFavoriteCoin } from '../../redux/cryptoSlice';

const coinDetails = {
  Bitcoin: { binance: 'btcusdt', coingecko: 'bitcoin', icon: '₿', color: 'text-amber-500' },
  Ethereum: { binance: 'ethusdt', coingecko: 'ethereum', icon: 'Ξ', color: 'text-indigo-400' },
  Solana: { binance: 'solusdt', coingecko: 'solana', icon: 'S', color: 'text-green-400' },
  // Add more coin details here as needed when users add new coins
};

export default function CryptoDashboard() {
  const [cryptoData, setCryptoData] = useState({});
  const [newCoin, setNewCoin] = useState('');
  const dispatch = useDispatch();
  const { coins, favoriteCoins } = useSelector((state) => state.crypto);
  const router = useRouter();
  const wsRef = useRef(null);

  useEffect(() => {
    async function fetchMarketCaps() {
      try {
        const ids = coins.map(coin => coinDetails[coin]?.coingecko || coin.toLowerCase()).join(',');
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_market_cap=true`
        );
        const data = await res.json();

        const updated = {};
        for (const coin of coins) {
          const coingeckoId = coinDetails[coin]?.coingecko || coin.toLowerCase();
          updated[coin] = {
            marketCap: data[coingeckoId]?.usd_market_cap
              ? `$${(data[coingeckoId].usd_market_cap / 1e9).toFixed(2)}B`
              : '--',
          };
        }
        setCryptoData((prev) => ({ ...prev, ...updated }));
      } catch (e) {
        console.error('Market cap fetch error', e);
      }
    }

    fetchMarketCaps();
    const interval = setInterval(fetchMarketCaps, 60000);
    return () => clearInterval(interval);
  }, [coins]);

  useEffect(() => {
    const streams = coins
      .map(coin => coinDetails[coin]?.binance || `${coin.toLowerCase()}usdt`)
      .map(ticker => `${ticker}@ticker`)
      .join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const data = msg.data;

      const coinName = coins.find(
        coin => (coinDetails[coin]?.binance || `${coin.toLowerCase()}usdt`) === data.s.toLowerCase()
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
  }, [coins]);

  const handleDashboardClick = () => {
    router.push(`/crypto/${coins[0]?.toLowerCase() || 'bitcoin'}`);
  };

  const handleCoinClick = (coin) => {
    router.push(`/crypto/${coin.toLowerCase()}`);
  };

  const handleAddCoin = (e) => {
    e.preventDefault();
    if (newCoin.trim()) {
      dispatch(addCoin(newCoin.trim()));
      setNewCoin('');
    }
  };

  const sortedCoins = [
    ...favoriteCoins,
    ...coins.filter(coin => !favoriteCoins.includes(coin)),
  ];

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

      {/* Add Coin Form */}
      <form onSubmit={handleAddCoin} className="flex gap-2">
        <input
          type="text"
          value={newCoin}
          onChange={(e) => setNewCoin(e.target.value)}
          placeholder="Add a coin (e.g., Cardano)..."
          className="bg-gray-700 text-white p-2 rounded-lg w-full"
        />
        <button type="submit" className="bg-teal-500 text-white p-2 rounded-full hover:bg-blue-600">
          <Plus/>
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedCoins.map((coin) => {
          const isPositive = cryptoData[coin]?.change >= 0;
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;
          const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
          const isFavorite = favoriteCoins.includes(coin);
          const coinInfo = coinDetails[coin] || {
            icon: coin[0],
            color: 'text-gray-400',
          };

          return (
            <div
              key={coin}
              onClick={() => handleCoinClick(coin)}
              className="bg-gray-800/50 p-6 rounded-2xl backdrop-blur-sm border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className={`text-xl font-bold ${coinInfo.color} bg-gray-700 h-10 w-10 rounded-full flex items-center justify-center`}>
                    {coinInfo.icon}
                  </div>
                  <h3
                    onClick={() => handleCoinClick(coin)}
                    className="font-bold text-lg text-white cursor-pointer hover:underline"
                  >
                    {coin.charAt(0).toUpperCase() + coin.slice(1)}

                  </h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); dispatch(toggleFavoriteCoin(coin)); }}
                    className={`p-1 ${isFavorite ? 'text-yellow-400' : 'text-gray-400'} hover:text-yellow-500`}
                  >
                    <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); dispatch(removeCoin(coin)); }}
                    className="text-red-400 hover:text-red-500 p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="mb-4 flex items-baseline gap-4">
                <div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <DollarSign size={14} />
                    <span>Current Price</span>
                  </div>
                  <div className="text-3xl font-bold text-white flex items-baseline gap-2">
                    {cryptoData[coin]?.price || '--'}
                    {cryptoData[coin]?.change && (
                      <span className={`font-medium text-sm ${changeColor}`}>
                        <TrendIcon size={18} />
                        {cryptoData[coin]?.change}%
                      </span>
                    )}
                  </div>
                </div>
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