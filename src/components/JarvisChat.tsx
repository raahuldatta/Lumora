import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2, TrendingUp, TrendingDown, Minus, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { getJarvisResponse, getStockDecision } from '../services/jarvisService';
import { Portfolio, User } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
  decision?: {
    symbol: string;
    action: 'BUY' | 'SELL' | 'HOLD';
    reason: string;
    confidence: number;
  };
}

export default function JarvisChat({ user, portfolio }: { user: User, portfolio: Portfolio | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Hello ${user.name}, I am Jarvis. How can I assist your trading strategy today?` }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const [hasCheckedRisk, setHasCheckedRisk] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Only check risk once per session when Jarvis opens and portfolio is loaded
    if (isOpen && portfolio && portfolio.holdings.length > 0 && !hasCheckedRisk) {
      setHasCheckedRisk(true);
      fetch('/api/news').then(r => r.json()).then(news => {
        fetch('/api/ai/risk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ portfolio, news })
        })
        .then(r => r.json())
        .then(risk => {
          if (risk.riskLevel === 'HIGH') {
            setMessages(prev => [...prev, { 
              role: 'model', 
              text: `⚠️ PORTFOLIO RISK ALERT: ${risk.alertMessage}` 
            }]);
          }
        })
        .catch(console.error);
      }).catch(console.error);
    }
  }, [isOpen, portfolio, hasCheckedRisk]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // Check if it's a decision request like "Should I buy AAPL?"
      const decisionMatch = userMsg.match(/should i (buy|sell|hold) ([a-z]+)/i) || userMsg.match(/analyze ([a-z]+)/i);
      
      if (decisionMatch) {
        const symbol = (decisionMatch[2] || decisionMatch[1]).toUpperCase();
        const decision = await getStockDecision(symbol, portfolio);
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: `I've analyzed ${symbol} for you.`,
          decision: {
            symbol,
            action: decision.decision,
            reason: decision.reason,
            confidence: decision.confidence
          }
        }]);
      } else {
        const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
        const response = await getJarvisResponse(userMsg, history, portfolio);
        setMessages(prev => [...prev, { role: 'model', text: response || "I'm sorry, I couldn't process that." }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "System error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeTrade = async (decision: any) => {
    setIsLoading(true);
    try {
      const trade = {
        symbol: decision.symbol,
        type: decision.action,
        shares: 10,
        price: 150, // Mock price
        sentimentScore: decision.confidence,
        reasoning: decision.reason
      };

      const res = await fetch('/api/trade/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, trade })
      });

      if (res.ok) {
        const msgText = `Trade executed successfully! 10 shares of ${decision.symbol} have been ${decision.action === 'BUY' ? 'purchased' : 'sold'}.`;
        window.dispatchEvent(new CustomEvent('TRADE_EXECUTED', { detail: { message: msgText } }));
        setMessages(prev => [...prev, { role: 'model', text: msgText }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: `Failed to execute trade. Please check your cash balance or holdings.` }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: `System error while executing trade.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-96 h-[500px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Bot className="text-zinc-950 w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Jarvis AI</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={clsx("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={clsx(
                    "max-w-[85%] p-3 rounded-xl text-sm",
                    msg.role === 'user' ? "bg-emerald-500 text-zinc-950 font-medium" : "bg-zinc-900 text-zinc-300 border border-zinc-800"
                  )}>
                    {msg.text}
                    
                    {msg.decision && (
                      <div className="mt-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white">{msg.decision.symbol}</span>
                          <div className="flex items-center gap-2">
                            {msg.decision.action !== 'HOLD' && (
                              <button 
                                onClick={() => executeTrade(msg.decision)}
                                disabled={isLoading}
                                className="px-2 py-0.5 bg-emerald-500 text-zinc-950 rounded text-[10px] font-black uppercase hover:bg-emerald-400 transition-colors disabled:opacity-50"
                              >
                                Trade Now
                              </button>
                            )}
                            <span className={clsx(
                              "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                              msg.decision.action === 'BUY' ? "bg-emerald-500/10 text-emerald-500" :
                              msg.decision.action === 'SELL' ? "bg-red-500/10 text-red-500" :
                              "bg-zinc-500/10 text-zinc-500"
                            )}>
                              {msg.decision.action}
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-relaxed italic">"{msg.decision.reason}"</p>
                        <div className="flex items-center gap-1 pt-1 border-t border-zinc-900">
                          <span className="text-[9px] text-zinc-600 uppercase font-bold">Confidence</span>
                          <div className="flex-1 h-1 bg-zinc-900 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${msg.decision.confidence * 100}%` }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl">
                    <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-zinc-900 border-t border-zinc-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Jarvis (e.g. 'Analyze NVDA')"
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading}
                  className="p-2 bg-emerald-500 text-zinc-950 rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90",
          isOpen ? "bg-zinc-800 text-white rotate-90" : "bg-emerald-500 text-zinc-950 hover:scale-110"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Brain className="w-6 h-6" />}
      </button>
    </div>
  );
}
