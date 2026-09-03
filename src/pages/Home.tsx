import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, BrainCircuit, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#85bb65,transparent_70%)]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
              Trade with the <span className="text-emerald-500 italic font-medium">pulse</span> of the market.
            </h1>
            <p className="mt-8 text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              Lumora leverages cutting-edge artificial intelligence to synthesize global market sentiment in real-time. 
              By processing millions of news headlines, social media signals, and financial reports, our proprietary agents identify 
              high-probability trade setups before they hit the mainstream wires.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="px-8 py-4 bg-emerald-500 text-zinc-950 font-bold rounded-2xl hover:bg-emerald-400 transition-all hover:scale-105 flex items-center gap-2 group shadow-lg shadow-emerald-500/20"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="px-8 py-4 bg-zinc-900 text-white font-bold rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition-all hover:scale-105"
              >
                Learn How it Works
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-8 border-t border-zinc-900 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Institutional-Grade Intelligence</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">Our AI agents process millions of data points per second to identify high-probability trading opportunities.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={BrainCircuit}
              title="AI Sentiment Analysis"
              description="Our agent processes thousands of headlines per second to gauge market mood before the first candle closes."
            />
            <FeatureCard 
              icon={Zap}
              title="Autonomous Execution"
              description="Set your risk parameters and let the agent handle the rest. Real-time entries and exits based on data, not emotion."
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Institutional Security"
              description="Your data is encrypted and your trades are executed through secure, audited protocols."
            />
          </div>
        </div>
      </section>

      {/* Detailed Section */}
      <section className="py-24 px-8 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white leading-tight">Eliminate Human Bias from Your Trading Strategy.</h2>
            <p className="text-zinc-500 text-lg leading-relaxed">
              Lumora's proprietary sentiment engine parses complex linguistic patterns, sarcasm, and market nuance in real-time, converting raw text into actionable trading signals.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-zinc-300">
                <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                </div>
                24/7 Global Market Monitoring
              </li>
              <li className="flex items-center gap-3 text-zinc-300">
                <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                </div>
                Multi-Language Sentiment Support
              </li>
              <li className="flex items-center gap-3 text-zinc-300">
                <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                </div>
                Instant Trade Execution via AI Agent
              </li>
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl rounded-full"></div>
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                </div>
                <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Live Terminal</div>
              </div>
              <div className="space-y-4">
                <div className="h-2 bg-zinc-800 rounded-full w-3/4 animate-pulse"></div>
                <div className="h-2 bg-zinc-800 rounded-full w-1/2 animate-pulse delay-75"></div>
                <div className="h-2 bg-zinc-800 rounded-full w-5/6 animate-pulse delay-150"></div>
                <div className="pt-4 mt-4 border-t border-zinc-800 flex justify-between items-center">
                  <div className="text-emerald-500 font-mono text-sm">SENTIMENT: BULLISH (+0.84)</div>
                  <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded">BUY SIGNAL</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8">
        <div className="max-w-5xl mx-auto bg-emerald-500 rounded-[3rem] p-16 text-center">
          <h2 className="text-4xl md:text-6xl font-black text-zinc-950 mb-8 leading-tight">
            READY TO OUTPERFORM <br /> THE MARKET?
          </h2>
          <Link
            to="/login"
            className="inline-flex items-center gap-3 px-10 py-5 bg-zinc-950 text-white font-black rounded-2xl hover:bg-zinc-900 transition-all hover:scale-105"
          >
            START TRADING NOW
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: any) {
  return (
    <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-emerald-500/30 transition-colors group">
      <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
        <Icon className="w-6 h-6 text-emerald-500" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-zinc-500 leading-relaxed">{description}</p>
    </div>
  );
}
