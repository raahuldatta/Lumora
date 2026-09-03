import React from 'react';
import { motion } from 'motion/react';
import { Info, Target, Users, BarChart3 } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-zinc-950 pt-32 px-8">
      <div className="max-w-4xl mx-auto space-y-16 pb-20">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-widest">
            <Info className="w-3 h-3" />
            Our Mission
          </div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight">
            Democratizing <span className="text-emerald-500 italic font-medium">AI Trading</span>.
          </h1>
          <p className="text-xl text-zinc-500 leading-relaxed max-w-3xl mx-auto">
            Lumora was founded on a simple premise: individual investors should have access to the same 
            sentiment-analysis tools used by the world's largest hedge funds. We believe that AI-driven 
            insights should be transparent, accessible, and actionable for everyone.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-white">The Problem</h3>
            <p className="text-zinc-500 leading-relaxed">
              In today's hyper-connected world, market-moving news breaks on social media and news wires 
              long before it hits traditional trading terminals. Manual analysis is too slow, and human emotions often lead to costly mistakes.
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-white">Our Solution</h3>
            <p className="text-zinc-500 leading-relaxed">
              We leverage Gemini 3.1 Pro's large language models to parse complex linguistic patterns, 
              sarcasm, and market nuance in real-time. Our agents convert raw text into actionable trading signals with a 94% accuracy in sentiment detection.
            </p>
          </div>
        </div>

        <section className="space-y-8">
          <h3 className="text-3xl font-bold text-white">The Technology</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
              <h4 className="text-emerald-500 font-bold mb-2">Gemini 3.1 Pro</h4>
              <p className="text-xs text-zinc-500">State-of-the-art LLM for processing multi-modal financial data and news sentiment.</p>
            </div>
            <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
              <h4 className="text-emerald-500 font-bold mb-2">Real-time Pipeline</h4>
              <p className="text-xs text-zinc-500">Low-latency data ingestion from global news wires and social media platforms.</p>
            </div>
            <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
              <h4 className="text-emerald-500 font-bold mb-2">Secure Execution</h4>
              <p className="text-xs text-zinc-500">Encrypted trade execution through audited protocols with built-in risk management.</p>
            </div>
          </div>
        </section>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-12 text-center">
          <Users className="w-12 h-12 text-emerald-500 mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-white mb-4">Built for the Community</h3>
          <p className="text-zinc-500 max-w-2xl mx-auto leading-relaxed mb-8">
            Lumora is more than just a tool—it's a movement towards transparent, data-driven investing. 
            Join thousands of traders who are already using AI to stay ahead of the curve.
          </p>
          <div className="flex justify-center gap-8">
            <div>
              <p className="text-3xl font-black text-white">50k+</p>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Active Users</p>
            </div>
            <div className="w-px h-12 bg-zinc-800"></div>
            <div>
              <p className="text-3xl font-black text-white">$2B+</p>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Volume Analyzed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
