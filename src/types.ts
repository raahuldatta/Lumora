export enum SubscriptionPlan {
  LITE = 'LITE',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
  ULTRA_PREMIUM = 'ULTRA_PREMIUM'
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan?: SubscriptionPlan;
}

export interface Portfolio {
  cash: number;
  holdings: Holding[];
  history: Trade[];
}

export interface Holding {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
}

export interface Trade {
  id: string;
  timestamp: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  sentimentScore: number;
  reasoning: string;
}

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  timestamp: string;
  content?: string;
  sentiment?: number; // -1 to 1
}

export interface SectorSentiment {
  sector: string;
  sentiment: number;
}

export interface RiskRules {
  maxPositionSize: number; // max $ amount per trade
  stopLossPercent: number; // e.g., 0.05 for 5%
  dailyTradeCap: number; // max trades per day
  agentEnabled: boolean;
}

export interface BacktestLog {
  date: string;
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  aiConfidence: number;
  outcome: 'PROFIT' | 'LOSS';
  pnlPercent: number;
}

export interface BacktestResult {
  hitRate: number;
  sharpeRatio: number;
  totalTrades: number;
  simulatedReturn: number;
  log: BacktestLog[];
}

export interface SentimentReport {
  reasoning: string;
  recommendations: {
    symbol: string;
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    reason: string;
  }[];
}
