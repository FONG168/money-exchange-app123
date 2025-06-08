'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { getUserSession, clearUserSession, clearAllUserData, forcePageRefresh } from '../utils/session';

// Counter configuration with new requirements
export const COUNTERS: Record<number, {
  id: number;
  name: string;
  minDeposit: number;
  dailyOrders: number;
  commission: number;
  description: string;
  exchangeAmountMin: number;
  exchangeAmountMax: number;
}> = {
  1: { 
    id: 1, 
    name: 'Counter 1', 
    minDeposit: 300, 
    dailyOrders: 20, // updated from 60 to 20
    commission: 0.4, 
    description: 'Entry level counter - Complete 20 daily orders to unlock withdrawals',
    exchangeAmountMin: 10,
    exchangeAmountMax: 500
  },
  2: { 
    id: 2, 
    name: 'Counter 2', 
    minDeposit: 1500, 
    dailyOrders: 30, // updated from 70 to 30
    commission: 0.6, 
    description: 'Standard level counter - Complete 30 daily orders to unlock withdrawals',
    exchangeAmountMin: 50,
    exchangeAmountMax: 1000
  },
  3: { 
    id: 3, 
    name: 'Counter 3', 
    minDeposit: 3000, 
    dailyOrders: 40, // updated from 90 to 40
    commission: 0.8, 
    description: 'Advanced level counter - Complete 40 daily orders to unlock withdrawals',
    exchangeAmountMin: 100,
    exchangeAmountMax: 2000
  },
  4: { 
    id: 4, 
    name: 'Counter 4', 
    minDeposit: 5000, 
    dailyOrders: 50, // updated from 130 to 50
    commission: 1.0, 
    description: 'Professional level counter - Complete 50 daily orders to unlock withdrawals',
    exchangeAmountMin: 200,
    exchangeAmountMax: 3500
  },
  5: { 
    id: 5, 
    name: 'Counter 5', 
    minDeposit: 10000, 
    dailyOrders: 60, // updated from 150 to 60
    commission: 2.0, 
    description: 'VIP level counter - Complete 60 daily orders to unlock withdrawals',
    exchangeAmountMin: 300,
    exchangeAmountMax: 5000
  },
  6: { 
    id: 6, 
    name: 'Counter 6', 
    minDeposit: 20000, 
    dailyOrders: 70, // updated from 160 to 70
    commission: 3.0, 
    description: 'Elite level counter - Complete 70 daily orders to unlock withdrawals',
    exchangeAmountMin: 500,
    exchangeAmountMax: 8000
  }
};

// Helper function to calculate remaining tasks for progressive counter system
export function calculateRemainingTasks(counterId: number, cumulativeCompletedTasks: number): number {
  const counter = COUNTERS[counterId];
  if (!counter) return 0;
  
  // Calculate how many tasks are needed for this counter level
  const requiredTasks = counter.dailyOrders;
  
  // Calculate remaining tasks based on cumulative progress
  const remainingTasks = Math.max(0, requiredTasks - cumulativeCompletedTasks);
  
  return remainingTasks;
}

// Helper function to calculate effective daily orders for progressive system
export function getEffectiveDailyOrders(counterId: number, cumulativeCompletedTasks: number): number {
  return calculateRemainingTasks(counterId, cumulativeCompletedTasks);
}

// Currency pairs for exchange orders (50+ pairs)
export const CURRENCY_PAIRS = [
  // Major USD pairs
  { from: 'USD', to: 'EUR', name: 'US Dollar to Euro' },
  { from: 'EUR', to: 'USD', name: 'Euro to US Dollar' },
  { from: 'USD', to: 'GBP', name: 'US Dollar to British Pound' },
  { from: 'GBP', to: 'USD', name: 'British Pound to US Dollar' },
  { from: 'USD', to: 'JPY', name: 'US Dollar to Japanese Yen' },
  { from: 'JPY', to: 'USD', name: 'Japanese Yen to US Dollar' },
  { from: 'USD', to: 'CHF', name: 'US Dollar to Swiss Franc' },
  { from: 'CHF', to: 'USD', name: 'Swiss Franc to US Dollar' },
  { from: 'USD', to: 'CAD', name: 'US Dollar to Canadian Dollar' },
  { from: 'CAD', to: 'USD', name: 'Canadian Dollar to US Dollar' },
  { from: 'USD', to: 'AUD', name: 'US Dollar to Australian Dollar' },
  { from: 'AUD', to: 'USD', name: 'Australian Dollar to US Dollar' },
  { from: 'USD', to: 'NZD', name: 'US Dollar to New Zealand Dollar' },
  { from: 'NZD', to: 'USD', name: 'New Zealand Dollar to US Dollar' },
  
  // Major cross pairs
  { from: 'EUR', to: 'GBP', name: 'Euro to British Pound' },
  { from: 'GBP', to: 'EUR', name: 'British Pound to Euro' },
  { from: 'EUR', to: 'JPY', name: 'Euro to Japanese Yen' },
  { from: 'JPY', to: 'EUR', name: 'Japanese Yen to Euro' },
  { from: 'GBP', to: 'JPY', name: 'British Pound to Japanese Yen' },
  { from: 'JPY', to: 'GBP', name: 'Japanese Yen to British Pound' },
  { from: 'EUR', to: 'CHF', name: 'Euro to Swiss Franc' },
  { from: 'CHF', to: 'EUR', name: 'Swiss Franc to Euro' },
  { from: 'GBP', to: 'CHF', name: 'British Pound to Swiss Franc' },
  { from: 'CHF', to: 'GBP', name: 'Swiss Franc to British Pound' },
  
  // Asian currencies
  { from: 'USD', to: 'CNY', name: 'US Dollar to Chinese Yuan' },
  { from: 'CNY', to: 'USD', name: 'Chinese Yuan to US Dollar' },
  { from: 'USD', to: 'KRW', name: 'US Dollar to South Korean Won' },
  { from: 'KRW', to: 'USD', name: 'South Korean Won to US Dollar' },
  { from: 'USD', to: 'SGD', name: 'US Dollar to Singapore Dollar' },
  { from: 'SGD', to: 'USD', name: 'Singapore Dollar to US Dollar' },
  { from: 'USD', to: 'HKD', name: 'US Dollar to Hong Kong Dollar' },
  { from: 'HKD', to: 'USD', name: 'Hong Kong Dollar to US Dollar' },
  { from: 'USD', to: 'THB', name: 'US Dollar to Thai Baht' },
  { from: 'THB', to: 'USD', name: 'Thai Baht to US Dollar' },
  { from: 'USD', to: 'INR', name: 'US Dollar to Indian Rupee' },
  { from: 'INR', to: 'USD', name: 'Indian Rupee to US Dollar' },
  
  // Emerging markets
  { from: 'USD', to: 'BRL', name: 'US Dollar to Brazilian Real' },
  { from: 'BRL', to: 'USD', name: 'Brazilian Real to US Dollar' },
  { from: 'USD', to: 'MXN', name: 'US Dollar to Mexican Peso' },
  { from: 'MXN', to: 'USD', name: 'Mexican Peso to US Dollar' },
  { from: 'USD', to: 'ZAR', name: 'US Dollar to South African Rand' },
  { from: 'ZAR', to: 'USD', name: 'South African Rand to US Dollar' },
  { from: 'USD', to: 'RUB', name: 'US Dollar to Russian Ruble' },
  { from: 'RUB', to: 'USD', name: 'Russian Ruble to US Dollar' },
  { from: 'USD', to: 'TRY', name: 'US Dollar to Turkish Lira' },
  { from: 'TRY', to: 'USD', name: 'Turkish Lira to US Dollar' },
  
  // Nordic currencies
  { from: 'USD', to: 'SEK', name: 'US Dollar to Swedish Krona' },
  { from: 'SEK', to: 'USD', name: 'Swedish Krona to US Dollar' },
  { from: 'USD', to: 'NOK', name: 'US Dollar to Norwegian Krone' },
  { from: 'NOK', to: 'USD', name: 'Norwegian Krone to US Dollar' },
  { from: 'USD', to: 'DKK', name: 'US Dollar to Danish Krone' },
  { from: 'DKK', to: 'USD', name: 'Danish Krone to US Dollar' },
  
  // Other major currencies
  { from: 'EUR', to: 'CAD', name: 'Euro to Canadian Dollar' },
  { from: 'CAD', to: 'EUR', name: 'Canadian Dollar to Euro' },
  { from: 'EUR', to: 'AUD', name: 'Euro to Australian Dollar' },
  { from: 'AUD', to: 'EUR', name: 'Australian Dollar to Euro' },
  { from: 'GBP', to: 'CAD', name: 'British Pound to Canadian Dollar' },
  { from: 'CAD', to: 'GBP', name: 'Canadian Dollar to British Pound' },
  { from: 'GBP', to: 'AUD', name: 'British Pound to Australian Dollar' },
  { from: 'AUD', to: 'GBP', name: 'Australian Dollar to British Pound' },
  
  // Oil currencies
  { from: 'USD', to: 'SAR', name: 'US Dollar to Saudi Riyal' },
  { from: 'SAR', to: 'USD', name: 'Saudi Riyal to US Dollar' },
  { from: 'USD', to: 'AED', name: 'US Dollar to UAE Dirham' },
  { from: 'AED', to: 'USD', name: 'UAE Dirham to US Dollar' },
    // Additional Asian pairs
  { from: 'EUR', to: 'CNY', name: 'Euro to Chinese Yuan' },
  { from: 'CNY', to: 'EUR', name: 'Chinese Yuan to Euro' },
  { from: 'GBP', to: 'CNY', name: 'British Pound to Chinese Yuan' },
  { from: 'CNY', to: 'GBP', name: 'Chinese Yuan to British Pound' },
  { from: 'JPY', to: 'CNY', name: 'Japanese Yen to Chinese Yuan' },
  { from: 'CNY', to: 'JPY', name: 'Chinese Yuan to Japanese Yen' },
  
  // More exotic pairs
  { from: 'USD', to: 'PLN', name: 'US Dollar to Polish Zloty' },
  { from: 'PLN', to: 'USD', name: 'Polish Zloty to US Dollar' },
  { from: 'USD', to: 'CZK', name: 'US Dollar to Czech Koruna' },
  { from: 'CZK', to: 'USD', name: 'Czech Koruna to US Dollar' },
  { from: 'USD', to: 'HUF', name: 'US Dollar to Hungarian Forint' },
  { from: 'HUF', to: 'USD', name: 'Hungarian Forint to US Dollar' },
  { from: 'USD', to: 'ILS', name: 'US Dollar to Israeli Shekel' },
  { from: 'ILS', to: 'USD', name: 'Israeli Shekel to US Dollar' },
  { from: 'USD', to: 'PHP', name: 'US Dollar to Philippine Peso' },
  { from: 'PHP', to: 'USD', name: 'Philippine Peso to US Dollar' },
  { from: 'USD', to: 'IDR', name: 'US Dollar to Indonesian Rupiah' },
  { from: 'IDR', to: 'USD', name: 'Indonesian Rupiah to US Dollar' },
  { from: 'USD', to: 'MYR', name: 'US Dollar to Malaysian Ringgit' },
  { from: 'MYR', to: 'USD', name: 'Malaysian Ringgit to US Dollar' },
  { from: 'USD', to: 'VND', name: 'US Dollar to Vietnamese Dong' },
  { from: 'VND', to: 'USD', name: 'Vietnamese Dong to US Dollar' },
  
  // Additional commodity currencies
  { from: 'USD', to: 'CLP', name: 'US Dollar to Chilean Peso' },
  { from: 'CLP', to: 'USD', name: 'Chilean Peso to US Dollar' },
  { from: 'USD', to: 'COP', name: 'US Dollar to Colombian Peso' },
  { from: 'COP', to: 'USD', name: 'Colombian Peso to US Dollar' },
  { from: 'USD', to: 'PEN', name: 'US Dollar to Peruvian Sol' },
  { from: 'PEN', to: 'USD', name: 'Peruvian Sol to US Dollar' },
  { from: 'USD', to: 'ARS', name: 'US Dollar to Argentine Peso' },
  { from: 'ARS', to: 'USD', name: 'Argentine Peso to US Dollar' },
  
  // Cross currency pairs
  { from: 'EUR', to: 'GBP', name: 'Euro to British Pound' },
  { from: 'CHF', to: 'JPY', name: 'Swiss Franc to Japanese Yen' },
  { from: 'JPY', to: 'CHF', name: 'Japanese Yen to Swiss Franc' },
  { from: 'AUD', to: 'NZD', name: 'Australian Dollar to New Zealand Dollar' },
  { from: 'NZD', to: 'AUD', name: 'New Zealand Dollar to Australian Dollar' },
  { from: 'CAD', to: 'CHF', name: 'Canadian Dollar to Swiss Franc' },
  { from: 'CHF', to: 'CAD', name: 'Swiss Franc to Canadian Dollar' },
];

// Transaction types
export type TransactionType = 'deposit' | 'exchange' | 'commission' | 'withdrawal' | 'commission_withdrawal';

export interface Transaction {
  id: string;
  type: TransactionType;
  counterId?: number;
  amount: number;
  currency?: string;
  fromCurrency?: string;
  toCurrency?: string;
  exchangeRate?: number;
  commission?: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

export interface CounterData {
  balance: number;
  totalEarnings: number;
  completedTasks: number;
  cumulativeCompletedTasks: number; // Add cumulative field
  dailyCompletedOrders: number;
  lastActivityDate: string;
  lastOrderResetDate: string;
  isActive: boolean;
  canWithdraw: boolean;
}

export interface AppState {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    totalBalance: number;
    joinDate: string;
    banned?: boolean; // <-- add
    frozen?: boolean; // <-- add
  };
  counters: Record<number, CounterData>;
  transactions: Transaction[];
  currentExchange: {
    counterId: number;
    pair: typeof CURRENCY_PAIRS[0];
    amount: number;
    rate: number;
  } | null;
  isLoaded: boolean;
  isAuthenticated: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncError: string | null;
  dailyCounterCompletions?: Record<number, boolean>; // Track which counters completed today
  totalTasksCompletedToday?: number; // Track total tasks completed today
}

// Action types
type Action =
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'SET_USER_SESSION'; payload: { user: AppState['user']; isAuthenticated: boolean } }
  | { type: 'LOGOUT' }
  | { type: 'SYNC_START' }
  | { type: 'SYNC_SUCCESS'; payload: { user: AppState['user']; counters: Record<number, CounterData>; transactions: Transaction[] } }
  | { type: 'SYNC_ERROR'; payload?: { error: string } }
  | { type: 'DEPOSIT'; payload: { counterId: number; amount: number } }
  | { type: 'COMPLETE_EXCHANGE'; payload: { counterId: number; pair: typeof CURRENCY_PAIRS[0]; amount: number; rate: number; commission: number } }
  | { type: 'REQUEST_WITHDRAWAL'; payload: { counterId: number; amount: number } }
  | { type: 'SET_CURRENT_EXCHANGE'; payload: { counterId: number; pair: typeof CURRENCY_PAIRS[0]; amount: number; rate: number } }
  | { type: 'CLEAR_CURRENT_EXCHANGE' }
  | { type: 'UPDATE_USER'; payload: Partial<AppState['user']> };

// Initial state
const initialState: AppState = {
  user: {
    id: '',
    email: '',
    firstName: '',
    lastName: '',
    totalBalance: 0,
    joinDate: new Date().toISOString(),
    banned: false, // <-- add
    frozen: false, // <-- add
  },  counters: Object.keys(COUNTERS).reduce((acc, key) => {
    acc[parseInt(key)] = {
      balance: 0,
      totalEarnings: 0,
      completedTasks: 0,
      cumulativeCompletedTasks: 0,
      dailyCompletedOrders: 0,
      lastActivityDate: '',
      lastOrderResetDate: new Date().toDateString(),
      isActive: false,
      canWithdraw: false,
    };
    return acc;
  }, {} as Record<number, CounterData>),
  transactions: [],
  currentExchange: null,  isLoaded: false,
  isAuthenticated: false,
  isSyncing: false,
  lastSyncTime: null,
  syncError: null,
  dailyCounterCompletions: {},
  totalTasksCompletedToday: 0,
};

// Reducer
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE': {
      const loadedState = { ...state, ...action.payload, isLoaded: true };
      
      // Ensure all counters have the required properties for backward compatibility
      if (loadedState.counters) {
        Object.keys(loadedState.counters).forEach(counterId => {
          const counter = loadedState.counters[parseInt(counterId)];
          if (!counter.hasOwnProperty('dailyCompletedOrders')) {
            counter.dailyCompletedOrders = 0;
          }
          if (!counter.hasOwnProperty('lastOrderResetDate')) {
            counter.lastOrderResetDate = new Date().toDateString();
          }
          if (!counter.hasOwnProperty('canWithdraw')) {
            counter.canWithdraw = false;
          }
        });
      }
      
      return loadedState;
    }

    case 'SET_USER_SESSION': {
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: action.payload.isAuthenticated,
        isLoaded: true,
      };
    }

    case 'LOGOUT': {
      return {
        ...initialState,
        isLoaded: true,
        isAuthenticated: false,
      };
    }    case 'SYNC_START': {
      return {
        ...state,
        isSyncing: true,
        syncError: null,
      };
    }case 'SYNC_SUCCESS': {
      return {
        ...state,
        user: action.payload.user,
        counters: action.payload.counters,
        transactions: action.payload.transactions,
        isSyncing: false,
        lastSyncTime: new Date().toISOString(),
        syncError: null,
      };
    }case 'SYNC_ERROR': {
      return {
        ...state,
        isSyncing: false,
        syncError: action.payload?.error || 'Failed to sync data',
      };
    }

    case 'DEPOSIT': {
      const { counterId, amount } = action.payload;
      const transaction: Transaction = {
        id: `dep_${Date.now()}`,
        type: 'deposit',
        counterId,
        amount,
        timestamp: new Date().toISOString(),
        status: 'completed',
        description: `Deposit to ${COUNTERS[counterId].name}`,
      };

      return {
        ...state,
        counters: {
          ...state.counters,
          [counterId]: {
            ...state.counters[counterId],
            balance: state.counters[counterId].balance + amount,
            lastActivityDate: new Date().toISOString(),
            isActive: true,
          },
        },
        user: {
          ...state.user,
          totalBalance: state.user.totalBalance + amount,
        },
        transactions: [transaction, ...state.transactions],
      };
    }    case 'COMPLETE_EXCHANGE': {
      const { counterId, pair, amount, rate, commission } = action.payload;
      const currentDate = new Date().toDateString();
      const counter = COUNTERS[counterId];
      const counterData = state.counters[counterId];
      // Reset daily count if it's a new day
      let dailyCount = counterData.lastOrderResetDate !== currentDate ? 0 : counterData.dailyCompletedOrders;
      let totalTasks = state.totalTasksCompletedToday ?? 0;
      let dailyCompletions = state.dailyCounterCompletions ?? {};
      // Reset if new day
      if (counterData.lastOrderResetDate !== currentDate) {
        dailyCompletions = {};
        totalTasks = 0;
      }      // Calculate remaining tasks for this counter using progressive system
      const progressiveRemainingTasks = calculateRemainingTasks(counterId, counterData.cumulativeCompletedTasks);
      
      // 1. Check if user has already completed all required tasks for this counter
      if (progressiveRemainingTasks <= 0) {
        if (typeof window !== 'undefined') {
          alert(`You have already completed all required tasks for ${counter.name}. You can now withdraw or upgrade to the next counter!`);
        }
        return state;
      }
      
      // 2. Prevent more than daily limit exchanges per counter per day
      if (dailyCount >= counter.dailyOrders) {
        if (typeof window !== 'undefined') {
          alert(`You have already completed your daily exchange for ${counter.name}. Try another counter or come back tomorrow!`);
        }
        return state;
      }
      
      // 3. Calculate max allowed tasks for today
      const maxTasksToday = Object.values(COUNTERS).reduce((sum, c) => sum + c.dailyOrders, 0);
      
      // 4. Limit tasks in this counter to remaining quota
      const remainingDailyTasks = Math.min(counter.dailyOrders - dailyCount, progressiveRemainingTasks);
      const remainingQuota = maxTasksToday - totalTasks;
      
      if (remainingQuota <= 0) {
        if (typeof window !== 'undefined') {
          alert('You have reached your total daily task limit. Please come back tomorrow!');
        }
        return state;
      }
      
      // Only allow up to the minimum of remainingDailyTasks and remainingQuota
      const tasksToAdd = Math.min(1, remainingDailyTasks, remainingQuota);
      if (tasksToAdd <= 0) {
        if (typeof window !== 'undefined') {
          alert('No more tasks allowed in this counter today. Try another counter or come back tomorrow!');
        }
        return state;
      }
      
      // Increment dailyCount for this operation
      const newDailyCount = dailyCount + tasksToAdd;
      const newCumulativeTasks = counterData.cumulativeCompletedTasks + tasksToAdd;
      const newProgressiveRemaining = calculateRemainingTasks(counterId, newCumulativeTasks);
      
      // Allow withdrawal for this counter if progressive tasks are completed
      const canWithdrawThisCounter = newProgressiveRemaining <= 0;
      
      // Mark this counter as completed for today if requirement is now met or exceeded
      let completedThisCounter = false;
      if (newDailyCount === counter.dailyOrders) {
        dailyCompletions[counterId] = true;
        completedThisCounter = true;
      }
      // Check if all counters completed for global withdrawal (for future use)
      const allCountersCompleted = Object.keys(COUNTERS).every(cid => dailyCompletions[Number(cid)]);

      // --- AUTO-TRANSFER LOGIC ---
      // If this counter is now fully completed (progressive + daily), transfer remaining balance to next counter
      let countersUpdate = { ...state.counters };
      let userUpdate = { ...state.user };
      if (canWithdrawThisCounter && completedThisCounter) {
        const nextCounterId = counterId + 1;
        const nextCounter = COUNTERS[nextCounterId];
        if (nextCounter && countersUpdate[counterId].balance > 0) {
          // Move all remaining balance to next counter
          const transferAmount = countersUpdate[counterId].balance;
          countersUpdate[counterId] = {
            ...countersUpdate[counterId],
            balance: 0,
            isActive: false,
          };
          countersUpdate[nextCounterId] = {
            ...countersUpdate[nextCounterId],
            balance: countersUpdate[nextCounterId].balance + transferAmount,
            isActive: true,
          };
        }
      }
      // --- END AUTO-TRANSFER LOGIC ---

      const exchangeTransaction: Transaction = {
        id: `exc_${Date.now()}`,
        type: 'exchange',
        counterId,
        amount,
        fromCurrency: pair.from,
        toCurrency: pair.to,
        exchangeRate: rate,
        commission,
        timestamp: new Date().toISOString(),
        status: 'completed',
        description: `Exchange ${amount} ${pair.from} to ${pair.to}`,
      };

      const commissionTransaction: Transaction = {
        id: `com_${Date.now()}`,
        type: 'commission',
        counterId,
        amount: commission,
        timestamp: new Date().toISOString(),
        status: 'completed',
        description: `Commission earned from ${pair.from}/${pair.to} exchange`,
      };      return {
        ...state,
        counters: {
          ...countersUpdate,
          [counterId]: {
            ...countersUpdate[counterId],
            totalEarnings: state.counters[counterId].totalEarnings + commission,
            completedTasks: state.counters[counterId].completedTasks + tasksToAdd,
            cumulativeCompletedTasks: state.counters[counterId].cumulativeCompletedTasks + tasksToAdd,
            dailyCompletedOrders: newDailyCount,
            lastActivityDate: new Date().toISOString(),
            lastOrderResetDate: currentDate,
            canWithdraw: canWithdrawThisCounter, // <-- allow withdrawal for this counter only
          },
        },
        transactions: [commissionTransaction, exchangeTransaction, ...state.transactions],
        dailyCounterCompletions: dailyCompletions,
        totalTasksCompletedToday: (totalTasks ?? 0) + tasksToAdd,        // Don't clear currentExchange here - let the exchange page handle the flow
      };
    }
    
    case 'REQUEST_WITHDRAWAL': {
      const { counterId, amount } = action.payload;
      const counterData = state.counters[counterId];
      
      // Check if withdrawal is allowed
      if (!counterData.canWithdraw) {
        throw new Error(`You must complete ${COUNTERS[counterId].dailyOrders} daily orders before withdrawing from ${COUNTERS[counterId].name}`);
      }
      
      const transaction: Transaction = {
        id: `wit_${Date.now()}`,
        type: 'withdrawal',
        counterId,
        amount,
        timestamp: new Date().toISOString(),
        status: 'completed',
        description: `Withdrawal from ${COUNTERS[counterId].name}`,
      };      return {
        ...state,
        counters: {
          ...state.counters,
          [counterId]: {
            ...state.counters[counterId],
            balance: 0,
            totalEarnings: 0,
            completedTasks: 0,
            // PRESERVE cumulativeCompletedTasks for progressive system
            cumulativeCompletedTasks: state.counters[counterId].cumulativeCompletedTasks,
            dailyCompletedOrders: 0,
            isActive: false,
            canWithdraw: false,
          },
        },
        user: {
          ...state.user,
          totalBalance: state.user.totalBalance - amount,
        },
        transactions: [transaction, ...state.transactions],
      };
    }

    case 'SET_CURRENT_EXCHANGE':
      return {
        ...state,
        currentExchange: action.payload,
      };

    case 'CLEAR_CURRENT_EXCHANGE':
      return {
        ...state,
        currentExchange: null,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    default:
      return state;
  }
}

// Context
const MoneyExchangeContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  syncWithServer: () => Promise<void>;
  logout: () => void;
} | null>(null);

// Provider component
export function MoneyExchangeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Sync with server function
  const syncWithServer = useCallback(async () => {
    const session = getUserSession();
    if (!session) {
      console.warn('No user session found, cannot sync with server');
      return;
    }

    dispatch({ type: 'SYNC_START' });

    try {
      // Fetch data from server
      const response = await fetch('/api/user/sync', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': session.id,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
      }

      const serverData = await response.json();
      
      if (serverData.success) {
        // Transform counters data
        const countersData: Record<number, CounterData> = {};
        let totalBalance = 0;
        Object.keys(COUNTERS).forEach(key => {
          const counterId = parseInt(key);
          countersData[counterId] = {
            balance: 0,
            totalEarnings: 0,
            completedTasks: 0,
            cumulativeCompletedTasks: 0,
            dailyCompletedOrders: 0,
            lastActivityDate: '',
            lastOrderResetDate: new Date().toDateString(),
            isActive: false,
            canWithdraw: false,
          };
        });
        serverData.counters.forEach((counter: any) => {
          const counterId = counter.counterId;
          if (COUNTERS[counterId]) {
            countersData[counterId] = {
              balance: counter.balance,
              totalEarnings: counter.totalEarnings,
              completedTasks: counter.completedTasks,
              cumulativeCompletedTasks: counter.cumulativeCompletedTasks || 0,
              dailyCompletedOrders: counter.dailyCompletedOrders,
              lastActivityDate: counter.lastActivityDate,
              lastOrderResetDate: counter.lastOrderResetDate,
              isActive: counter.isActive,
              canWithdraw: counter.canWithdraw,
            };
            totalBalance += counter.balance;
          }
        });

        // Transform user data
        const userData = {
          id: serverData.user.id.toString(),
          email: serverData.user.email,
          firstName: serverData.user.firstName,
          lastName: serverData.user.lastName,
          totalBalance: totalBalance, // Always use sum of counters
          joinDate: serverData.user.joinDate,
          banned: serverData.user.banned,
          frozen: serverData.user.frozen,
        };

        // Transform transactions data
        const transactionsData = serverData.transactions.map((tx: any) => ({
          id: tx.id.toString(),
          type: tx.type,
          counterId: tx.counterId,
          amount: tx.amount,
          currency: tx.currency,
          fromCurrency: tx.fromCurrency,
          toCurrency: tx.toCurrency,
          exchangeRate: tx.exchangeRate,
          commission: tx.commission,
          timestamp: tx.createdAt,
          status: 'completed' as const,
          description: tx.description,
        }));

        dispatch({
          type: 'SYNC_SUCCESS',
          payload: {
            user: userData,
            counters: countersData,
            transactions: transactionsData,
          },
        });
      } else {
        throw new Error(serverData.message || 'Failed to sync data');
      }
    } catch (error) {
      console.error('Sync error:', error);
      dispatch({ type: 'SYNC_ERROR' });
    }
  }, []);

  // Save state to server
  const saveToServer = useCallback(async (stateToSave: Partial<AppState>) => {
    const session = getUserSession();
    if (!session || !state.isAuthenticated) {
      return;
    }

    try {
      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': session.id,
        },
        body: JSON.stringify({
          user: stateToSave.user,
          counters: stateToSave.counters,
          transactions: stateToSave.transactions,
        }),
      });

      if (!response.ok) {
        console.error('Failed to save data to server:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving to server:', error);
    }
  }, [state.isAuthenticated]);  // Logout function
  const logout = useCallback(() => {
    console.log('Logging out user, clearing all data and refreshing page');
    clearAllUserData(); // Use comprehensive clearing function
    dispatch({ type: 'LOGOUT' });
    
    // Force a complete page refresh to ensure all cache and memory is cleared
    setTimeout(() => {
      forcePageRefresh('/auth');
    }, 500);
  }, []);// Load persisted state and check authentication on mount
  useEffect(() => {
    const initializeUserSession = async () => {
      const session = getUserSession();
      
      if (session) {
        // User is logged in - CLEAR localStorage to prevent data leakage between users
        console.log('User session found, clearing localStorage and loading fresh data');
        localStorage.removeItem('moneyExchangeState');
        
        // Set user data with fresh initial state
        dispatch({
          type: 'SET_USER_SESSION',
          payload: {
            user: {
              id: session.id,
              email: session.email,
              firstName: session.firstName,
              lastName: session.lastName,
              totalBalance: 0, // Will be updated from server
              joinDate: new Date().toISOString(), // Will be updated from server
            },
            isAuthenticated: true,
          },
        });

        // IMMEDIATELY sync with server instead of using setTimeout
        console.log('Syncing with server for user:', session.email);
        try {
          await syncWithServer();
          console.log('✅ Initial sync completed successfully');
        } catch (error) {
          console.error('❌ Initial sync failed:', error);
          // Fallback: Try to load from localStorage if sync fails
          const savedState = localStorage.getItem('moneyExchangeState');
          if (savedState) {
            try {
              const parsedState = JSON.parse(savedState);
              dispatch({ type: 'LOAD_STATE', payload: parsedState });
            } catch (parseError) {
              console.error('Failed to load fallback state:', parseError);
            }
          }
        }
      } else {
        // No session - only load from localStorage if no authentication is required
        console.log('No user session found, loading from localStorage');
        const savedState = localStorage.getItem('moneyExchangeState');
        if (savedState) {
          try {
            const parsedState = JSON.parse(savedState);
            dispatch({ type: 'LOAD_STATE', payload: parsedState });
          } catch (error) {
            console.error('Failed to load saved state:', error);
            dispatch({ type: 'LOAD_STATE', payload: {} });
          }
        } else {
          dispatch({ type: 'LOAD_STATE', payload: {} });
        }
      }
    };

    initializeUserSession();
  }, [syncWithServer]); // Add syncWithServer dependency

  // Save state to localStorage and server whenever it changes
  useEffect(() => {
    if (state.isLoaded && !state.isSyncing) {
      const stateToSave = {
        user: state.user,
        counters: state.counters,
        transactions: state.transactions,
      };

      // Save to localStorage for immediate persistence
      localStorage.setItem('moneyExchangeState', JSON.stringify(stateToSave));

      // Save to server if authenticated
      if (state.isAuthenticated) {
        saveToServer(stateToSave);
      }
    }
  }, [state, saveToServer]);

  return (
    <MoneyExchangeContext.Provider value={{ state, dispatch, syncWithServer, logout }}>
      {children}
    </MoneyExchangeContext.Provider>
  );
}

// Custom hook to use the context
export function useMoneyExchange() {
  const context = useContext(MoneyExchangeContext);
  if (!context) {
    throw new Error('useMoneyExchange must be used within a MoneyExchangeProvider');
  }
  return context;
}

// Utility functions
export function generateRandomOrder(counterId: number) {
  const counter = COUNTERS[counterId];
  const pair = CURRENCY_PAIRS[Math.floor(Math.random() * CURRENCY_PAIRS.length)];
  
  // Use counter-specific exchange amount limits
  const minAmount = counter.exchangeAmountMin;
  const maxAmount = counter.exchangeAmountMax;
  const amount = Math.floor(Math.random() * (maxAmount - minAmount) + minAmount);
  
  // Enhanced exchange rate generation with more realistic rates
  const baseRates: Record<string, number> = {
    // Major USD pairs
    'USD-EUR': 0.85, 'EUR-USD': 1.18, 'USD-GBP': 0.73, 'GBP-USD': 1.37,
    'USD-JPY': 110, 'JPY-USD': 0.0091, 'USD-CHF': 0.92, 'CHF-USD': 1.09,
    'USD-CAD': 1.25, 'CAD-USD': 0.80, 'USD-AUD': 1.35, 'AUD-USD': 0.74,
    'USD-NZD': 1.42, 'NZD-USD': 0.70,
    
    // Major cross pairs
    'EUR-GBP': 0.86, 'GBP-EUR': 1.16, 'EUR-JPY': 129, 'JPY-EUR': 0.0078,
    'GBP-JPY': 151, 'JPY-GBP': 0.0066, 'EUR-CHF': 1.08, 'CHF-EUR': 0.93,
    'GBP-CHF': 1.27, 'CHF-GBP': 0.79,
    
    // Asian currencies
    'USD-CNY': 6.45, 'CNY-USD': 0.155, 'USD-KRW': 1180, 'KRW-USD': 0.00085,
    'USD-SGD': 1.35, 'SGD-USD': 0.74, 'USD-HKD': 7.80, 'HKD-USD': 0.128,
    'USD-THB': 33.5, 'THB-USD': 0.030, 'USD-INR': 74.5, 'INR-USD': 0.0134,
    
    // Emerging markets
    'USD-BRL': 5.2, 'BRL-USD': 0.19, 'USD-MXN': 20.1, 'MXN-USD': 0.050,
    'USD-ZAR': 14.8, 'ZAR-USD': 0.068, 'USD-RUB': 73.5, 'RUB-USD': 0.0136,
    'USD-TRY': 8.4, 'TRY-USD': 0.119,
    
    // Nordic currencies
    'USD-SEK': 8.6, 'SEK-USD': 0.116, 'USD-NOK': 8.5, 'NOK-USD': 0.118,
    'USD-DKK': 6.4, 'DKK-USD': 0.156,
    
    // Oil currencies
    'USD-SAR': 3.75, 'SAR-USD': 0.267, 'USD-AED': 3.67, 'AED-USD': 0.272,
    
    // Other major currencies
    'EUR-CAD': 1.47, 'CAD-EUR': 0.68, 'EUR-AUD': 1.59, 'AUD-EUR': 0.63,
    'GBP-CAD': 1.71, 'CAD-GBP': 0.58, 'GBP-AUD': 1.85, 'AUD-GBP': 0.54,
    
    // Additional cross rates
    'EUR-CNY': 7.6, 'CNY-EUR': 0.132, 'GBP-CNY': 8.8, 'CNY-GBP': 0.114,
    'JPY-CNY': 0.059, 'CNY-JPY': 17.0,
    
    // More exotic pairs
    'USD-PLN': 3.9, 'PLN-USD': 0.256, 'USD-CZK': 21.8, 'CZK-USD': 0.046,
    'USD-HUF': 300, 'HUF-USD': 0.0033, 'USD-ILS': 3.2, 'ILS-USD': 0.313,
    'USD-PHP': 51.2, 'PHP-USD': 0.0195, 'USD-IDR': 14300, 'IDR-USD': 0.00007,
    'USD-MYR': 4.1, 'MYR-USD': 0.244, 'USD-VND': 23000, 'VND-USD': 0.000043,
    
    // South American pairs
    'USD-CLP': 780, 'CLP-USD': 0.00128, 'USD-COP': 3800, 'COP-USD': 0.00026,
    'USD-PEN': 3.6, 'PEN-USD': 0.278, 'USD-ARS': 98, 'ARS-USD': 0.0102,
    
    // Additional cross pairs
    'CHF-JPY': 119, 'JPY-CHF': 0.0084, 'AUD-NZD': 1.05, 'NZD-AUD': 0.95,
    'CAD-CHF': 0.74, 'CHF-CAD': 1.35,
  };
  
  const rateKey = `${pair.from}-${pair.to}`;
  const baseRate = baseRates[rateKey] || 1;
  const fluctuation = 0.02; // 2% fluctuation
  const rate = baseRate * (1 + (Math.random() - 0.5) * fluctuation);
    return {
    pair,
    amount,
    rate: Math.round(rate * 10000) / 10000,
    expiresAt: Date.now() + 30000, // 30 seconds to complete
  };
}

export function canAccessCounter(counterId: number, counterData: CounterData): boolean {
  return counterData.isActive && counterData.balance >= COUNTERS[counterId].minDeposit;
}

export function getCounterStatus(counterId: number, counterData: CounterData): 'locked' | 'available' | 'active' {
  if (!counterData.isActive) return 'locked';
  if (counterData.balance < COUNTERS[counterId].minDeposit) return 'available';
  return 'active';
}
