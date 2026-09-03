import React, { useEffect, useState } from 'react';
import { History as HistoryIcon, ArrowUpRight, ArrowDownRight, Search, Filter } from 'lucide-react';
import { Trade, User } from '../types';
import { format } from 'date-fns';
import { clsx } from 'clsx';

export default function History({ user }: { user: User }) {
  const [history, setHistory] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/portfolio/${user.id}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(data => {
        setHistory(data.history);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user.id]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <HistoryIcon className="text-zinc-500 w-8 h-8" />
            Trade History
          </h1>
          <p className="text-zinc-500 mt-1">Review your past autonomous trading decisions.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search symbol..." 
              className="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg hover:text-white transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </header>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-900/80 border-b border-zinc-800">
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Asset</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Sentiment</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Reasoning</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {history.map((trade) => (
              <tr key={trade.id} className="hover:bg-zinc-800/20 transition-colors group">
                <td className="px-6 py-4">
                  <p className="text-sm text-zinc-300">{format(new Date(trade.timestamp), 'MMM d, yyyy')}</p>
                  <p className="text-xs text-zinc-500">{format(new Date(trade.timestamp), 'HH:mm:ss')}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center font-bold text-zinc-400 text-xs">
                      {trade.symbol[0]}
                    </div>
                    <span className="font-bold text-white">{trade.symbol}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={clsx(
                    "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                    trade.type === 'BUY' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {trade.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-300 font-medium">
                  {trade.shares} shares
                </td>
                <td className="px-6 py-4 text-sm text-zinc-300 font-medium">
                  ${trade.price.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={clsx(
                      "w-2 h-2 rounded-full",
                      trade.sentimentScore > 0.2 ? "bg-emerald-500" : trade.sentimentScore < -0.2 ? "bg-red-500" : "bg-zinc-500"
                    )}></div>
                    <span className="text-sm text-zinc-400">{trade.sentimentScore.toFixed(2)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <p className="text-xs text-zinc-500 line-clamp-2 group-hover:line-clamp-none transition-all">
                    {trade.reasoning}
                  </p>
                </td>
              </tr>
            ))}
            {history.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-zinc-600 italic">
                  No trades executed yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
