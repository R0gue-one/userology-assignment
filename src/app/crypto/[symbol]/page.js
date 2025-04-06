'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {useRouter} from 'next/navigation';
import 'chart.js/auto';
import { ChevronDown, ChevronUp, Search, TrendingUp, House } from 'lucide-react';

export default function CryptoDetails() {
  const { symbol } = useParams();
  const [details, setDetails] = useState(null);
  const [history, setHistory] = useState([]);
  const router = useRouter();
  const [volume, setVolume] = useState([]);
  const [livePrice, setLivePrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previousPrice, setPreviousPrice] = useState(null);
  const [showFullTable, setShowFullTable] = useState(false);
  const [query, setQuery] = useState('');
  Router
  const binanceSymbols = {
    bitcoin: 'btcusdt',
    ethereum: 'ethusdt',
    solana: 'solusdt',
    cardano: 'adausdt',
    polkadot: 'dotusdt',
    dogecoin: 'dogeusdt',
    // add more as needed
  };

  // Fetch static data
  useEffect(() => {
    async function fetchData() {
      try {

        setLoading(true);

        const res = await fetch(`https://api.coingecko.com/api/v3/coins/${symbol}`);
        const data = await res.json();
        console.log(data);
        setDetails(data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching coin details:", error);
      }
    }

    async function fetchHistory() {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=15`
        );
        const data = await res.json();
        setHistory(data.prices);
        setVolume(data.total_volumes);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    }

    fetchData();
    fetchHistory();
  }, [symbol]);

  // WebSocket for live price
  useEffect(() => {
    const pair = binanceSymbols[symbol.toLowerCase()];
    if (!pair) return;
  
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair}@ticker`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      const newPrice = parseFloat(data.c);
      
      setPreviousPrice(livePrice);
      setLivePrice(newPrice.toFixed(2));
    };
    
    return () => ws.close();
  }, [symbol, livePrice]);

  const isPriceUp = livePrice && previousPrice && parseFloat(livePrice) > parseFloat(previousPrice);
  const isPriceDown = livePrice && previousPrice && parseFloat(livePrice) < parseFloat(previousPrice);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      window.location.href = `/crypto/${query.toLowerCase()}`;
    }
  };

  // Chart configuration
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#9CA3AF',
          maxRotation: 0,
          font: {
            size: 10,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 10,
          },
        },
      },
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 6,
      },
      line: {
        tension: 0.4,
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  // Show only the last 7 days in the table initially
  const displayHistory = showFullTable ? history : history.slice(-7);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  

  const onHomeClick = () =>{
    router.push(`/`);
  }

  return (
    <div className="p-4 md:p-6 space-y-6 text-white bg-gradient-to-br from-gray-950 to-gray-900 min-h-screen">
    <div className="flex justify-center">
        <button onClick={onHomeClick} className="w-12 h-12 p-2 mx-2 my-2 bg-stone-100 text-stone-900 rounded-full hover:bg-stone-300 transition flex items-center justify-center">
            <House className="w-4 h-4" />
        </button>
        <form onSubmit={handleSearch} className="flex items-center border rounded-full px-4 py-2 shadow-md w-full max-w-md bg-white">
        <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search crypto"
            className="flex-grow outline-none text-sm px-2 text-black"
        />
        <button type="submit" className="ml-2 bg-stone-700 text-white p-2 rounded-full hover:bg-blue-900 transition">
            <Search className="w-4 h-4" />
        </button>
        </form>
    </div>

      {details && (
        <div className="bg-gray-800/40 p-6 mx-30 rounded-2xl shadow-xl border border-gray-700/30 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
            {/* Left side - Title, symbol and price */}
            <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-3">
                {details.image?.thumb && (
                    <img 
                    src={details.image.thumb} 
                    alt={details.name} 
                    className="w-10 h-10 rounded-full"
                    />
                )}
                <h2 className="text-3xl font-bold">{details.name} 
                    <span className="text-gray-400 ml-2 text-xl">{details.symbol.toUpperCase()}</span>
                </h2>
                </div>
                
                <div className="flex items-end">
                <p className={`text-4xl font-bold ${
                    isPriceUp ? 'text-green-400' : 
                    isPriceDown ? 'text-red-400' : 'text-white'
                }`}>
                    ${livePrice || (details.market_data?.current_price?.usd || '--')}
                </p>
                {(isPriceUp || isPriceDown) && (
                    <span className="ml-2 mb-1">
                    {isPriceUp && <ChevronUp className="text-green-400" size={20} />}
                    {isPriceDown && <ChevronDown className="text-red-400" size={20} />}
                    </span>
                )}
                </div>
                
                {details.market_data?.price_change_percentage_24h && (
                <div className={`px-3 py-1 rounded-lg text-sm font-medium w-fit ${
                    details.market_data.price_change_percentage_24h >= 0 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                    {details.market_data.price_change_percentage_24h.toFixed(2)}%
                </div>
                )}
            </div>
            
            {/* Right side - Data boxes */}
            <div className="flex flex-col gap-4 text-gray-300">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/30 p-3 rounded-xl">
                <p className="text-xs text-gray-400">Market Cap</p>
                <p className="font-semibold">${details.market_data.market_cap.usd.toLocaleString()}</p>
                </div>
                <div className="bg-gray-700/30 p-3 rounded-xl">
                <p className="text-xs text-gray-400">24h High</p>
                <p className="font-semibold text-green-400">${details.market_data.high_24h.usd.toLocaleString()}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/30 p-3 rounded-xl">
                <p className="text-xs text-gray-400">24h Low</p>
                <p className="font-semibold text-red-400">${details.market_data.low_24h.usd.toLocaleString()}</p>
                </div>
                <div className="bg-gray-700/30 p-3 rounded-xl">
                <p className="text-xs text-gray-400">Total Supply</p>
                <p className="font-semibold">{details.market_data.total_supply?.toLocaleString() || 'N/A'}</p>
                </div>
            </div>
            </div>

            </div>
        </div>
        )}

        {/*Charts start here*/}
      <div className="space-y-6 mx-30">
        <div className="bg-gray-800/40 p-4 rounded-2xl shadow-lg border border-gray-700/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <TrendingUp size={18} className="mr-2 text-blue-400" />
              Price History (15d)
            </h3>
            {history.length > 0 && (
              <div className="text-sm text-gray-400">
                Range: ${Math.min(...history.map(([, price]) => price)).toFixed(2)} - ${Math.max(...history.map(([, price]) => price)).toFixed(2)}
              </div>
            )}
          </div>
          <div className="h-256 w-full">
            {history.length > 0 && (
              <Line 
                data={{
                  labels: history.map(([ts]) => {
                    const date = new Date(ts);
                    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  }),
                  datasets: [{
                    label: 'Price',
                    data: history.map(([, price]) => price),
                    borderColor: 'rgb(56, 189, 248)',
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    fill: true,
                  }]
                }} 
                options={chartOptions}
              />
            )}
          </div>
        </div>

        <div className="bg-gray-800/40 p-4 rounded-2xl shadow-lg border border-gray-700/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <TrendingUp size={18} className="mr-2 text-pink-400" />
              Volume History (15d)
            </h3>
          </div>
          <div className="h-256 w-full">
            {volume.length > 0 && (
              <Line 
                data={{
                  labels: volume.map(([ts]) => {
                    const date = new Date(ts);
                    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  }),
                  datasets: [{
                    label: 'Volume',
                    data: volume.map(([, vol]) => vol),
                    borderColor: 'rgb(236, 72, 153)',
                    backgroundColor: 'rgba(236, 72, 153, 0.1)',
                    fill: true,
                  }]
                }} 
                options={chartOptions}
              />
            )}
          </div>
        </div>
      </div>
        

      {/*Table start here*/}
      <div className="bg-gray-800/40 p-6 mx-30 rounded-2xl shadow-lg border border-gray-700/30 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Price History</h3>
          <button 
            onClick={() => setShowFullTable(!showFullTable)}
            className="flex items-center px-3 py-1 bg-gray-700/50 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            {showFullTable ? (
              <>Show Less <ChevronUp size={16} className="ml-1" /></>
            ) : (
              <>Show More <ChevronDown size={16} className="ml-1" /></>
            )}
          </button>
        </div>
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700/50">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Price ($)</th>
                <th className="py-3 px-4">Volume</th>
              </tr>
            </thead>
            <tbody>
              {displayHistory.map(([ts, price], i) => {
                const currentIndex = showFullTable ? i : history.length - 7 + i;
                const volumeData = volume[currentIndex];
                
                return (
                  <tr key={i} className="border-t border-gray-800/30 hover:bg-gray-700/30 transition">
                    <td className="py-3 px-4">
                      {new Date(ts).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 font-medium">${price.toFixed(2)}</td>
                    <td className="py-3 px-4">${volumeData?.[1]?.toLocaleString(undefined, {maximumFractionDigits: 0}) || '--'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}