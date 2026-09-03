import React from 'react';
import { TrendingUp, ShieldCheck, Zap, Globe } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/url');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get auth URL');
      }
      const { url } = await response.json();
      
      const authWindow = window.open(url, 'oauth_popup', 'width=600,height=700');
      
      if (!authWindow) {
        alert('Please allow popups for this site to connect your account.');
      }
    } catch (error: any) {
      console.error('OAuth error:', error);
      alert(`Authentication Error: ${error.message}. Please ensure GOOGLE_CLIENT_ID is configured in the environment.`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row">
      {/* Left Side: Branding & Features */}
      <div className="flex-1 p-12 flex flex-col justify-between relative overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,#85bb65,transparent_50%)]"></div>
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <TrendingUp className="text-zinc-950 w-7 h-7" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Lumora</span>
        </div>

        <div className="relative z-10 max-w-xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-black text-white leading-[0.9] tracking-tighter mb-8"
          >
            AUTONOMOUS <br />
            <span className="text-emerald-500">SENTIMENT</span> <br />
            TRADING.
          </motion.h1>
          
          <div className="space-y-6">
            <FeatureItem 
              icon={Zap} 
              title="Real-time Sentiment" 
              description="Gemini-powered analysis of global news and social signals." 
            />
            <FeatureItem 
              icon={ShieldCheck} 
              title="Risk Management" 
              description="Dynamic portfolio adjustments based on market volatility." 
            />
            <FeatureItem 
              icon={Globe} 
              title="Global Markets" 
              description="Monitor thousands of assets across all major exchanges." 
            />
          </div>
        </div>

        <div className="relative z-10 pt-12 border-t border-zinc-800">
          <p className="text-zinc-500 text-sm">© 2026 Lumora AI Technologies. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-[480px] bg-zinc-950 p-12 flex flex-col justify-center">
        <div className="max-w-sm mx-auto w-full">
          <h2 className="text-3xl font-bold text-white mb-2">Get Started</h2>
          <p className="text-zinc-500 mb-10">Connect your account to start trading with AI.</p>

          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-zinc-950 py-3.5 rounded-xl font-bold hover:bg-zinc-200 transition-all active:scale-[0.98]"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Continue with Google
          </button>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-zinc-800"></div>
            <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-zinc-800"></div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                placeholder="name@company.com" 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <button className="w-full bg-zinc-800 text-zinc-400 py-3.5 rounded-xl font-bold cursor-not-allowed">
              Continue with Email
            </button>
          </div>

          <p className="mt-10 text-center text-zinc-600 text-sm">
            By continuing, you agree to our <a href="#" className="text-zinc-400 underline underline-offset-4">Terms of Service</a> and <a href="#" className="text-zinc-400 underline underline-offset-4">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon: Icon, title, description }: any) {
  return (
    <div className="flex gap-4">
      <div className="mt-1">
        <Icon className="w-5 h-5 text-emerald-500" />
      </div>
      <div>
        <h4 className="text-zinc-200 font-bold">{title}</h4>
        <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
