import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Play, TrendingUp, TrendingDown, Target, Zap, Clock, Loader2, ArrowUpRight, Activity } from 'lucide-react';
import { BacktestResult } from '../types';
import { clsx } from 'clsx';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Backtest() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  const runBacktest = async () => {
    setIsRunning(true);
    setResult(null);
    try {
      const res = await fetch('/api/backtest', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setTimeout(() => setResult(data), 1500); // Simulate processing time for UX
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsRunning(false), 1500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Agent Calibration & Backtesting
        </h1>
        <p className="text-zinc-400">
          Replay historical market data, synthesize past news sentiment, and evaluate the autonomous agent's hit rate against real historical price action.
        </p>
      </header>

      <div className="flex justify-center mb-12">
        <button
          onClick={runBacktest}
          disabled={isRunning}
          className="flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black tracking-widest uppercase rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
        >
          {isRunning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
          {isRunning ? 'Simulating 30 Days...' : 'Run Historical Backtest'}
        </button>
      </div>

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Stats Overview */}
          <div className="col-span-1 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-500 text-sm font-bold uppercase">Win Rate</span>
                <Target className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-5xl font-black text-white">{(result.hitRate * 100).toFixed(1)}%</p>
              <p className="text-xs text-zinc-500 mt-2">Profitable signals / Total signals</p>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-500 text-sm font-bold uppercase">Sharpe Ratio</span>
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-4xl font-black text-white">{result.sharpeRatio.toFixed(2)}</p>
              <p className="text-xs text-zinc-500 mt-2">Risk-adjusted return metric</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-500 text-sm font-bold uppercase">Simulated Return</span>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-4xl font-black text-emerald-400">+{result.simulatedReturn.toFixed(2)}%</p>
              <p className="text-xs text-zinc-500 mt-2">Alpha generated over 30 days</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-500 text-sm font-bold uppercase">Agent Actions</span>
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-3xl font-black text-white">{result.totalTrades}</p>
              <p className="text-xs text-zinc-500 mt-2">Decisions executed autonomously</p>
            </div>
          </div>

          {/* Trade Log */}
          <div className="col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              Decision Memory & Outcome Log
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
                    <th className="pb-3 px-4 font-bold">Date</th>
                    <th className="pb-3 px-4 font-bold">Asset</th>
                    <th className="pb-3 px-4 font-bold">AI Decision</th>
                    <th className="pb-3 px-4 font-bold">Confidence</th>
                    <th className="pb-3 px-4 font-bold">Outcome</th>
                    <th className="pb-3 px-4 font-bold text-right">P&L</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {result.log.map((log, i) => (
                    <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                      <td className="py-4 px-4 text-zinc-400">{log.date}</td>
                      <td className="py-4 px-4 font-bold text-white">{log.symbol}</td>
                      <td className="py-4 px-4">
                        <span className={clsx(
                          "px-2 py-1 rounded text-xs font-bold",
                          log.action === 'BUY' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                        )}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-zinc-400">{log.aiConfidence}</td>
                      <td className="py-4 px-4">
                        <span className={clsx(
                          "font-bold",
                          log.outcome === 'PROFIT' ? "text-emerald-500" : "text-red-500"
                        )}>
                          {log.outcome}
                        </span>
                      </td>
                      <td className={clsx(
                        "py-4 px-4 text-right font-bold",
                        log.pnlPercent < 0 ? "text-red-500" : "text-emerald-500"
                      )}>
                        {log.pnlPercent > 0 ? '+' : ''}{log.pnlPercent}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visualization Component */}
          <div className="col-span-1 lg:col-span-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              AI Confidence vs Portfolio Returns
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              Correlates the historical sentiment analysis accuracy (AI Confidence) with the resulting portfolio returns (P&L %).
            </p>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2c22" vertical={false} />
                  <XAxis 
                    type="number" 
                    dataKey="aiConfidence" 
                    name="Confidence" 
                    stroke="#516e59" 
                    domain={['auto', 'auto']}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                    label={{ value: 'AI Confidence (%)', position: 'insideBottom', offset: -10, fill: '#7b9983' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="pnlPercent" 
                    name="P&L" 
                    stroke="#516e59" 
                    tickFormatter={(v) => `${v}%`}
                    label={{ value: 'Return (%)', angle: -90, position: 'insideLeft', fill: '#7b9983' }}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3', stroke: '#3c5443' }}
                    contentStyle={{ backgroundColor: '#121a14', border: '1px solid #1f2c22', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number, name: string) => [
                      name === 'Confidence' ? `${(value * 100).toFixed(0)}%` : `${value}%`, 
                      name
                    ]}
                  />
                  <Scatter name="Trades" data={result.log}>
                    {result.log.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnlPercent >= 0 ? '#85bb65' : '#d35b5b'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
