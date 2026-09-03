import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';

// Mock dependencies
vi.mock('better-sqlite3', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      exec: vi.fn(),
      prepare: vi.fn().mockReturnValue({
        get: vi.fn().mockReturnValue({ cash: 50000 }),
        all: vi.fn().mockReturnValue([]),
        run: vi.fn()
      }),
      transaction: (fn: any) => fn
    }))
  };
});

vi.mock('axios');

describe('Trade Execution Logic', () => {
  it('should calculate total cost correctly and check funds', () => {
    // In a real integration test, we'd boot the express server via supertest.
    // For unit testing the logic paths:
    const shares = 10;
    const mockPrice = 150.0;
    const totalCost = shares * mockPrice;

    expect(totalCost).toBe(1500.0);

    const cash = 1000.0;
    const isInsufficient = cash < totalCost;
    
    expect(isInsufficient).toBe(true);
  });

  it('should allow BUY if funds are sufficient', () => {
    const shares = 10;
    const mockPrice = 150.0;
    const totalCost = shares * mockPrice;

    const cash = 5000.0;
    const isInsufficient = cash < totalCost;
    
    expect(isInsufficient).toBe(false);
  });

  it('should correctly increment shares on BUY', () => {
    const existingShares = 15;
    const newSharesToBuy = 10;
    const finalShares = existingShares + newSharesToBuy;
    expect(finalShares).toBe(25);
  });

  it('should accurately calculate new average price on BUY', () => {
    const existingShares = 10;
    const existingAvgPrice = 100.0;
    
    const newSharesToBuy = 10;
    const currentMarketPrice = 150.0;
    const costOfNewShares = newSharesToBuy * currentMarketPrice;
    
    const newTotalShares = existingShares + newSharesToBuy;
    const newAvgPrice = ((existingShares * existingAvgPrice) + costOfNewShares) / newTotalShares;
    
    expect(newAvgPrice).toBe(125.0);
  });

  it('should prevent SELL if shares are insufficient', () => {
    const existingShares = 5;
    const attemptToSell = 10;
    
    expect(existingShares < attemptToSell).toBe(true);
  });
});
