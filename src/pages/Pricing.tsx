import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Shield, Crown, Star } from 'lucide-react';
import { User, SubscriptionPlan } from '../types';
import { clsx } from 'clsx';

const plans = [
  {
    id: SubscriptionPlan.LITE,
    name: 'Lite',
    price: '₹0',
    description: 'Perfect for beginners exploring AI trading.',
    features: [
      'Up to 5 active investments',
      '100 AI analysis tokens / month',
      'Standard market feed',
      'Basic portfolio tracking'
    ],
    icon: Zap,
    color: 'emerald'
  },
  {
    id: SubscriptionPlan.STANDARD,
    name: 'Standard',
    price: '₹1,500',
    description: 'For active traders seeking better insights.',
    features: [
      'Up to 20 active investments',
      '500 AI analysis tokens / month',
      'Priority market feed',
      'Advanced technical indicators',
      'Email alerts'
    ],
    icon: Shield,
    color: 'indigo',
    popular: true
  },
  {
    id: SubscriptionPlan.PREMIUM,
    name: 'Premium',
    price: '₹2,499',
    description: 'Professional tools for serious investors.',
    features: [
      'Unlimited active investments',
      '2000 AI analysis tokens / month',
      'Real-time sentiment streaming',
      'Custom AI agent strategies',
      'Priority support'
    ],
    icon: Crown,
    color: 'amber'
  },
  {
    id: SubscriptionPlan.ULTRA_PREMIUM,
    name: 'Ultra Premium',
    price: '₹3,899',
    description: 'The ultimate Lumora experience.',
    features: [
      'Unlimited everything',
      'Unlimited AI analysis tokens',
      'Early access to new models',
      '1-on-1 strategy consulting',
      'API access for custom bots'
    ],
    icon: Star,
    color: 'rose'
  }
];

export default function Pricing({ user, onUpdateUser }: { user: User, onUpdateUser: (user: User) => void }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: SubscriptionPlan) => {
    setLoading(planId);
    try {
      const res = await fetch('/api/user/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, plan: planId })
      });
      if (res.ok) {
        onUpdateUser({ ...user, plan: planId });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-widest mb-4"
          >
            Pricing Plans
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-6"
          >
            Choose your <span className="text-emerald-500 italic font-medium">trading edge</span>.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg max-w-2xl mx-auto"
          >
            Unlock the full power of Gemini 3.1 Pro and scale your portfolio with our advanced AI agents.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className={clsx(
                "relative flex flex-col p-8 rounded-3xl border transition-all duration-300",
                plan.popular ? "bg-zinc-900 border-emerald-500/50 shadow-2xl shadow-emerald-500/10 scale-105 z-10" : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <div className={clsx(
                  "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
                  plan.color === 'emerald' ? "bg-emerald-500/10 text-emerald-500" :
                  plan.color === 'indigo' ? "bg-indigo-500/10 text-indigo-500" :
                  plan.color === 'amber' ? "bg-amber-500/10 text-amber-500" :
                  "bg-rose-500/10 text-rose-500"
                )}>
                  <plan.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-zinc-500 text-sm">/month</span>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">{plan.description}</p>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <div className="mt-1 p-0.5 rounded-full bg-emerald-500/20 text-emerald-500">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-zinc-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={user.plan === plan.id || loading !== null}
                className={clsx(
                  "w-full py-4 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2",
                  user.plan === plan.id 
                    ? "bg-zinc-800 text-zinc-500 cursor-default" 
                    : plan.popular
                      ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
                      : "bg-white text-zinc-950 hover:bg-zinc-200"
                )}
              >
                {loading === plan.id ? (
                  <div className="w-5 h-5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                ) : user.plan === plan.id ? (
                  'Current Plan'
                ) : (
                  'Upgrade Now'
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
