import React, { useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line } from 'recharts';
import { Loader2, Newspaper, BrainCircuit, Play, TrendingUp, TrendingDown, Minus, Wallet, Briefcase, PieChart, History, ArrowUpRight, Search, CheckCircle2, X } from 'lucide-react';
import { Portfolio, User, Trade, NewsItem, SentimentReport } from '../types';
import { analyzeSentiment } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

// Dashboard Component
export default function Dashboard({ user }: { user: User }) {
  // Portfolio State
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [marketVolatility, setMarketVolatility] = useState(1.0);
  const [netWorthHistory, setNetWorthHistory] = useState<{ time: number, value: number }[]>([]);

  // Agent State
  const [news, setNews] = useState<NewsItem[]>([]);
  const [sectorSentiment, setSectorSentiment] = useState<{sector: string, sentiment: number}[]>([]);
  const [report, setReport] = useState<SentimentReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmingTrade, setConfirmingTrade] = useState<{ symbol: string, action: 'BUY' | 'SELL', reason: string } | null>(null);
  const [sharesInput, setSharesInput] = useState<string>('10');
  const [expandedNewsIndex, setExpandedNewsIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [balanceKey, setBalanceKey] = useState(0);

  useEffect(() => {
    setBalanceKey(prev => prev + 1);
  }, [portfolio?.cash, portfolio?.history?.length]);

  useEffect(() => {
    const handleTrade = () => refreshData();
    window.addEventListener('TRADE_EXECUTED', handleTrade as EventListener);
    return () => window.removeEventListener('TRADE_EXECUTED', handleTrade as EventListener);
  }, [user.id]);

  const thirtyDayHistory = useMemo(() => {
    if (!portfolio) return [];
    
    let val = 100000;
    const history = [];
    for (let i = 29; i > 0; i--) {
      history.push({
        day: format(new Date(Date.now() - i * 24 * 60 * 60 * 1000), 'MMM dd'),
        value: val
      });
      val = val * (1 + (Math.random() - 0.45) * 0.02);
    }
    const currentVal = portfolio.cash + portfolio.holdings.reduce((acc, h) => acc + h.shares * h.currentPrice, 0);
    history.push({
      day: 'Today',
      value: currentVal
    });
    return history;
  }, [portfolio === null]);

  const currentNetWorth = useMemo(() => {
    if (!portfolio) return 100000;
    const holdingsValue = portfolio.holdings.reduce((acc, h) => {
      return acc + (h.shares * h.currentPrice);
    }, 0);
    return portfolio.cash + holdingsValue;
  }, [portfolio]);

  useEffect(() => {
    refreshData();
    fetchNews();
  }, [user.id]);

  // Update net worth history whenever net worth changes
  useEffect(() => {
    if (loading) return;
    setNetWorthHistory(prev => {
      const newPoint = { time: Date.now(), value: currentNetWorth };
      const updated = [...prev, newPoint];
      // Initialize with some history if empty
      if (prev.length === 0) {
        return Array.from({ length: 20 }, (_, i) => ({
          time: Date.now() - (20 - i) * 60000,
          value: currentNetWorth
        }));
      }
      return updated.slice(-20);
    });
  }, [currentNetWorth, loading]);

  const refreshData = () => {
    fetch(`/api/portfolio/${user.id}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(data => {
        setPortfolio(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error("Failed to fetch news");
      const data = await res.json();
      setNews(data);
      
      // Fetch sector sentiment
      if (data.length > 0) {
        fetch('/api/ai/sectors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ news: data })
        })
        .then(r => r.json())
        .then(sectors => setSectorSentiment(sectors))
        .catch(console.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeSentiment(news);
      setReport(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const executeTrade = async () => {
    if (!confirmingTrade) return;
    
    const shares = parseInt(sharesInput);
    if (isNaN(shares) || shares <= 0) {
      alert("Please enter a valid positive number of shares.");
      return;
    }

    setIsExecuting(true);
    try {
      const trade = {
        symbol: confirmingTrade.symbol,
        type: confirmingTrade.action,
        shares: shares,
        price: confirmingTrade.price,
        sentimentScore: report?.overallSentiment || 0,
        reasoning: confirmingTrade.reason
      };

      const res = await fetch('/api/trade/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, trade })
      });

      if (res.ok) {
        refreshData();
        setSuccessMessage(`Successfully executed ${confirmingTrade.action} for ${confirmingTrade.symbol}`);
        const symbolToClear = confirmingTrade.symbol;
        setConfirmingTrade(null);
        
        // Clear recommendation after execution for better UX
        setTimeout(() => {
          if (report) {
            setReport({
              ...report,
              recommendations: report.recommendations.filter(r => r.symbol !== symbolToClear)
            });
          }
          setSuccessMessage(null);
        }, 3000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsExecuting(false);
    }
  };

  const etfs = useMemo(() => [
    { symbol: 'SPY', name: 'S&P 500 ETF', price: 510.23 * marketVolatility, change: (marketVolatility - 1) * 100 },
    { symbol: 'QQQ', name: 'Nasdaq 100 ETF', price: 445.12 * marketVolatility, change: (marketVolatility - 1) * 120 },
    { symbol: 'VTI', name: 'Total Stock Market', price: 255.45 * marketVolatility, change: (marketVolatility - 1) * 90 },
  ], [marketVolatility]);

  if (loading) return <div className="p-8 text-zinc-500">Loading Lumora Dashboard...</div>;

  const profit = currentNetWorth - 100000;
  const profitPercent = (profit / 100000) * 100;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back, {user.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-zinc-500">Lumora AI is analyzing the markets for you.</p>
            <span className={clsx(
              "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
              user.plan === 'ULTRA_PREMIUM' ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" :
              user.plan === 'PREMIUM' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
              user.plan === 'STANDARD' ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20" :
              "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20"
            )}>
              {user.plan || 'LITE'} PLAN
            </span>
          </div>
        </div>
        <div className="text-left md:text-right bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total Net Worth</p>
          <motion.p 
            key={balanceKey}
            initial={{ scale: 1.1, color: '#85bb65' }}
            animate={{ scale: 1, color: '#ffffff' }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-white"
          >
            ${currentNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </motion.p>
        </div>
      </header>

      {/* Scrolling News Ticker */}
      {news.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex items-center shadow-lg">
          <div className="bg-emerald-500 text-zinc-950 px-4 py-2 font-black text-xs tracking-widest uppercase flex items-center gap-2 z-10 shrink-0">
            <Newspaper className="w-4 h-4" /> LIVE
          </div>
          <div className="flex-1 overflow-hidden relative flex items-center">
            <div className="flex w-[200%] animate-marquee">
              <div className="flex-1 flex gap-8 whitespace-nowrap items-center px-4">
                {news.map((n, i) => (
                  <div key={`n1-${i}`} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-zinc-300 font-medium text-sm">{n.title}</span>
                    <span className="text-zinc-600 text-xs font-bold uppercase ml-2">({n.source})</span>
                  </div>
                ))}
              </div>
              <div className="flex-1 flex gap-8 whitespace-nowrap items-center px-4">
                {news.map((n, i) => (
                  <div key={`n2-${i}`} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-zinc-300 font-medium text-sm">{n.title}</span>
                    <span className="text-zinc-600 text-xs font-bold uppercase ml-2">({n.source})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Cash Balance" value={`$${portfolio?.cash.toLocaleString()}`} icon={Wallet} color="emerald" />
        <StatCard title="Portfolio Return" value={`$${profit.toLocaleString()}`} subValue={`${profitPercent.toFixed(2)}%`} icon={profit >= 0 ? TrendingUp : TrendingDown} color={profit >= 0 ? "emerald" : "red"} />
        <StatCard title="Stock Holdings" value={portfolio?.holdings.length.toString() || "0"} icon={Briefcase} color="indigo" />
        <StatCard title="ETF Positions" value="3" icon={PieChart} color="amber" />
      </div>

      {/* Historical Graph moved to Main Grid */}

      {/* Search & Invest */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-emerald-500" />
          Search & Invest
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search company symbol (e.g., AAPL, TSLA)..." 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors uppercase font-bold tracking-wider"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setConfirmingTrade({ symbol: searchQuery, action: 'BUY', reason: 'Manual trade execution' });
                setSharesInput('10');
              }}
              disabled={!searchQuery}
              className="px-6 py-3 bg-emerald-500/10 text-emerald-500 font-bold rounded-xl hover:bg-emerald-500 hover:text-zinc-950 disabled:opacity-50 transition-colors"
            >
              BUY
            </button>
            <button 
              onClick={() => {
                setConfirmingTrade({ symbol: searchQuery, action: 'SELL', reason: 'Manual trade execution' });
                setSharesInput('10');
              }}
              disabled={!searchQuery}
              className="px-6 py-3 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white disabled:opacity-50 transition-colors"
            >
              SELL
            </button>
          </div>
        </div>

        {/* Manual Confirmation Flow */}
        <AnimatePresence>
          {confirmingTrade && confirmingTrade.reason === 'Manual trade execution' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4"
            >
              <div className="pt-4 border-t border-zinc-900 space-y-4">
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50">
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1.5 block tracking-widest">Number of Shares for {confirmingTrade.symbol}</label>
                      <input 
                        type="number" 
                        min="1"
                        value={sharesInput}
                        onChange={(e) => setSharesInput(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                        placeholder="Enter amount..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setConfirmingTrade(null)}
                        className="px-4 py-2.5 text-xs font-bold text-zinc-500 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={executeTrade}
                        disabled={isExecuting}
                        className={clsx(
                          "px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg",
                          confirmingTrade.action === 'BUY' 
                            ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-emerald-500/10" 
                            : "bg-red-500 text-white hover:bg-red-400 shadow-red-500/10"
                        )}
                      >
                        {isExecuting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Confirm {confirmingTrade.action}
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-[10px] text-zinc-500 font-medium">
                      Market Price: <span className="text-white">$150.00</span>
                    </p>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                      Total: <span className="text-white text-xs">${(parseInt(sharesInput || '0') * 150).toLocaleString()}</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Dashboard Bento Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Market Sentiment Overview */}
        <div className="xl:col-span-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-emerald-500" />
            Market Sentiment Overview
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={news}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2c22" vertical={false} />
                <XAxis dataKey="source" stroke="#516e59" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis domain={[-1, 1]} stroke="#516e59" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121a14', border: '1px solid #1f2c22', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [value.toFixed(2), 'Sentiment']}
                />
                <Bar dataKey="sentiment" radius={[4, 4, 0, 0]}>
                  {news.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={(entry.sentiment || 0) >= 0 ? '#85bb65' : '#d35b5b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Heatmap */}
        <div className="xl:col-span-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-500" />
            Sector Sentiment Heatmap
          </h3>
          <div className="flex-1 grid grid-cols-2 gap-3 h-full">
            {sectorSentiment.length > 0 ? sectorSentiment.map((s, i) => (
              <div 
                key={i} 
                className={clsx(
                  "p-3 rounded-xl flex flex-col justify-center items-start transition-all",
                  s.sentiment > 0.5 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : 
                  s.sentiment > 0 ? "bg-emerald-500/5 text-emerald-300 border border-emerald-500/10" : 
                  s.sentiment < -0.5 ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                  s.sentiment < 0 ? "bg-red-500/5 text-red-300 border border-red-500/10" :
                  "bg-zinc-800/50 text-zinc-300 border border-zinc-800"
                )}
              >
                <span className="font-bold text-xs tracking-tight">{s.sector}</span>
                <span className="text-lg font-black mt-1">
                  {s.sentiment > 0 ? '+' : ''}{(s.sentiment * 100).toFixed(0)}%
                </span>
              </div>
            )) : (
              <div className="col-span-2 h-full min-h-[200px] flex flex-col items-center justify-center text-zinc-500">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <span className="text-xs">Analyzing Sectors...</span>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Trend Graph (Portfolio Chart) */}
        <div className="xl:col-span-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-500" />
              Live Portfolio Trend
            </h3>
            <div className="flex items-center gap-2 text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              LIVE
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorthHistory}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#85bb65" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#85bb65" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2c22" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} stroke="#516e59" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(1)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121a14', border: '1px solid #1f2c22', borderRadius: '8px' }} 
                  itemStyle={{ color: '#fff' }} 
                  labelFormatter={(label) => format(new Date(label), 'HH:mm:ss')}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Net Worth']}
                />
                <Area type="monotone" dataKey="value" stroke="#85bb65" strokeWidth={2} fillOpacity={1} fill="url(#colorTrend)" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market ETFs */}
        <div className="xl:col-span-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Market ETFs</h3>
          <div className="space-y-4 flex-1">
            {etfs.map((etf) => (
              <div key={etf.symbol} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center font-bold text-amber-500">{etf.symbol[0]}</div>
                  <div>
                    <p className="font-bold text-white">{etf.symbol}</p>
                    <p className="text-xs text-zinc-500">{etf.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">${etf.price.toFixed(2)}</p>
                  <div className="flex items-center justify-end text-xs text-emerald-400">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>{etf.change.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Agent Integration */}
      <div id="ai-agent-section" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* News Feed */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden relative">
          <AnimatePresence>
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-zinc-950 px-4 py-2 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex justify-between items-center">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-zinc-500" />
              AI Agent: Market Feed
            </h3>
            <div className="flex gap-2">
              <button onClick={fetchNews} className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white">
                <Search className="w-4 h-4" />
              </button>
              <button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || news.length === 0}
                className="px-3 py-1 bg-emerald-500 text-zinc-950 text-xs font-bold rounded-lg hover:bg-emerald-400 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                Analyze
              </button>
            </div>
          </div>
          <div className="divide-y divide-zinc-800 max-h-[500px] overflow-y-auto custom-scrollbar">
            {news.map((item, i) => (
              <div 
                key={i} 
                className="border-b border-zinc-800/50 last:border-0"
              >
                <button 
                  onClick={() => setExpandedNewsIndex(expandedNewsIndex === i ? null : i)}
                  className="w-full p-4 hover:bg-zinc-800/30 transition-all text-left group"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold bg-zinc-800 px-1.5 py-0.5 rounded">
                          {item.source}
                        </span>
                        <span className="text-[9px] text-zinc-600 font-medium">
                          {format(new Date(item.timestamp), 'HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors line-clamp-2">
                        {item.title}
                      </p>
                    </div>
                    <div className={clsx(
                      "px-2 py-1 rounded text-[10px] font-black uppercase shrink-0",
                      (item.sentiment || 0) > 0.1 ? "bg-emerald-500/10 text-emerald-500" :
                      (item.sentiment || 0) < -0.1 ? "bg-red-500/10 text-red-500" :
                      "bg-zinc-500/10 text-zinc-500"
                    )}>
                      {Math.abs((item.sentiment || 0) * 100).toFixed(0)}% {(item.sentiment || 0) >= 0 ? 'POS' : 'NEG'}
                    </div>
                  </div>
                </button>
                
                <AnimatePresence>
                  {expandedNewsIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-zinc-900/30"
                    >
                      <div className="p-4 pt-0 space-y-4">
                        <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                          <p className="text-sm text-zinc-400 leading-relaxed italic">
                            {item.content}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter">
                          <span className="text-zinc-600">AI Sentiment Breakdown</span>
                          <span className={clsx(
                            (item.sentiment || 0) > 0.6 ? "text-emerald-500" : 
                            (item.sentiment || 0) > 0.1 ? "text-emerald-400" : 
                            (item.sentiment || 0) > -0.1 ? "text-zinc-500" : 
                            "text-red-500"
                          )}>
                            {(item.sentiment || 0) > 0.6 ? "Excellent Signal" : 
                             (item.sentiment || 0) > 0.1 ? "Positive Outlook" : 
                             (item.sentiment || 0) > -0.1 ? "Neutral / Mixed" : 
                             "Strong Warning"}
                          </span>
                        </div>
                        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.abs((item.sentiment || 0) * 100)}%` }}
                            className={clsx(
                              "h-full",
                              (item.sentiment || 0) > 0 ? "bg-emerald-500" : "bg-red-500"
                            )}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* AI Recommendations */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-emerald-500" />
              AI Trading Decisions
            </h3>
            {report && (
              <div className={clsx(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                report.overallSentiment > 0.6 ? "bg-emerald-500/10 text-emerald-500" :
                report.overallSentiment > 0.1 ? "bg-emerald-400/10 text-emerald-400" :
                report.overallSentiment > -0.3 ? "bg-zinc-500/10 text-zinc-500" :
                "bg-red-500/10 text-red-500"
              )}>
                {report.overallSentiment > 0.6 ? "Excellent" : 
                 report.overallSentiment > 0.1 ? "Good" : 
                 report.overallSentiment > -0.3 ? "Okay Okay" : 
                 "Worst"}
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!report && !isAnalyzing ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-8 border border-dashed border-zinc-800 rounded-xl">
                <BrainCircuit className="w-12 h-12 text-zinc-800 mb-3" />
                <p className="text-zinc-500 text-sm">Run analysis to generate AI trading decisions based on current sentiment.</p>
              </div>
            ) : isAnalyzing ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-8 border border-zinc-800 rounded-xl">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                <p className="text-white font-medium">Lumora Agent is Processing...</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {report!.recommendations.map((rec, i) => (
                  <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          rec.action === 'BUY' ? "bg-emerald-500/10 text-emerald-500" :
                          rec.action === 'SELL' ? "bg-red-500/10 text-red-500" :
                          "bg-zinc-500/10 text-zinc-500"
                        )}>
                          {rec.action === 'BUY' ? <TrendingUp className="w-5 h-5" /> : rec.action === 'SELL' ? <TrendingDown className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-white">{rec.symbol}</p>
                          <p className="text-[10px] text-zinc-500 line-clamp-1">{rec.reason}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setConfirmingTrade({ symbol: rec.symbol, action: 'BUY', reason: rec.reason });
                            setSharesInput('10');
                          }}
                          className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-zinc-950 rounded-lg font-bold text-xs transition-all"
                        >
                          BUY
                        </button>
                        <button 
                          onClick={() => {
                            setConfirmingTrade({ symbol: rec.symbol, action: 'SELL', reason: rec.reason });
                            setSharesInput('10');
                          }}
                          className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg font-bold text-xs transition-all"
                        >
                          SELL
                        </button>
                      </div>
                    </div>

                    {/* Confirmation Flow */}
                    <AnimatePresence>
                      {confirmingTrade?.symbol === rec.symbol && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 border-t border-zinc-900 space-y-4">
                            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                              <div className="flex items-end gap-4">
                                <div className="flex-1">
                                  <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1.5 block tracking-widest">Number of Shares</label>
                                  <input 
                                    type="number" 
                                    min="1"
                                    value={sharesInput}
                                    onChange={(e) => setSharesInput(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                                    placeholder="Enter amount..."
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => setConfirmingTrade(null)}
                                    className="px-4 py-2.5 text-xs font-bold text-zinc-500 hover:text-white transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button 
                                    onClick={executeTrade}
                                    disabled={isExecuting}
                                    className={clsx(
                                      "px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg",
                                      confirmingTrade.action === 'BUY' 
                                        ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-emerald-500/10" 
                                        : "bg-red-500 text-white hover:bg-red-400 shadow-red-500/10"
                                    )}
                                  >
                                    {isExecuting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                                    Confirm {confirmingTrade.action}
                                  </button>
                                </div>
                              </div>
                              <div className="mt-3 flex justify-between items-center">
                                <p className="text-[10px] text-zinc-500 font-medium">
                                  Market Price: <span className="text-white">$150.00</span>
                                </p>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                  Total: <span className="text-white text-xs">${(parseInt(sharesInput || '0') * 150).toLocaleString()}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* Recent Activity */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-zinc-500" />
            Recent Activity
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(!portfolio?.history || portfolio.history.length === 0) && (
            <div className="col-span-full p-8 text-center border border-dashed border-zinc-800 rounded-xl">
              <p className="text-zinc-500 text-sm">No recent activity. Execute a trade to see it here.</p>
            </div>
          )}
          {portfolio?.history.slice(0, 3).map((trade: Trade) => (
            <div key={trade.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className={clsx("w-2 h-2 rounded-full", trade.type === 'BUY' ? "bg-emerald-500" : "bg-red-500")}></span>
                  <span className="text-sm font-bold text-white">{trade.symbol}</span>
                </div>
                <span className="text-[10px] text-zinc-600 font-bold uppercase">{format(new Date(trade.timestamp), 'MMM d, HH:mm')}</span>
              </div>
              <p className="text-xs text-zinc-500 line-clamp-2 mb-3 italic">"{trade.reasoning}"</p>
              <div className="flex justify-between items-center pt-3 border-t border-zinc-900">
                <span className={clsx("text-xs font-black", trade.type === 'BUY' ? "text-emerald-500" : "text-red-500")}>{trade.type} {trade.shares} @ ${trade.price}</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-zinc-600 uppercase font-bold">Sentiment</span>
                  <span className="text-xs font-bold text-zinc-400">{trade.sentimentScore.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subValue, icon: Icon, color }: any) {
  const colorClasses: any = {
    emerald: "bg-emerald-500/10 text-emerald-500",
    red: "bg-red-500/10 text-red-500",
    indigo: "bg-indigo-500/10 text-indigo-500",
    amber: "bg-amber-500/10 text-amber-500",
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div className={clsx("p-2 rounded-lg", colorClasses[color])}><Icon className="w-6 h-6" /></div>
        {subValue && <span className={clsx("text-xs font-bold px-2 py-1 rounded-full", colorClasses[color])}>{subValue}</span>}
      </div>
      <p className="text-zinc-500 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </motion.div>
  );
}
