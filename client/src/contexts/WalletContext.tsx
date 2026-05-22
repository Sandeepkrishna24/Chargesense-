import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: number;
  stationId?: string;
}

interface WalletContextType {
  balance: number;
  transactions: Transaction[];
  addFunds: (amount: number, method: string) => Promise<boolean>;
  payForCharging: (amount: number, stationId: string, stationName: string) => Promise<boolean>;
  getTransactionHistory: () => Transaction[];
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { profile, user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Use the authenticated user's email as the userId for backend persistence
  const userId = profile?.email || user?.email || localStorage.getItem("userEmail") || "demo-user";

  const fetchWallet = async () => {
    try {
      const res = await fetch(`/api/wallet/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
      }
    } catch (err) {
      console.error("Failed to fetch wallet:", err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`/api/wallet/${userId}/transactions`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, [userId]);

  const addFunds = async (amount: number, method: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/wallet/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount, source: method }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to add funds");
      }

      // Optimistically update, then refresh
      setBalance((prev) => prev + amount);
      fetchTransactions();
      return true;
    } catch (error) {
      console.error("Error adding funds:", error);
      return false;
    }
  };

  const payForCharging = async (
    amount: number,
    stationId: string,
    stationName: string
  ): Promise<boolean> => {
    if (balance < amount) return false;

    try {
      const res = await fetch("/api/wallet/deduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount, reason: `Charging at ${stationName}` }),
      });
      
      if (!res.ok) return false;

      setBalance((prev) => prev - amount);
      fetchTransactions();
      return true;
    } catch (error) {
      console.error("Error paying for charging:", error);
      return false;
    }
  };

  const getTransactionHistory = () => transactions;

  return (
    <WalletContext.Provider value={{ 
      balance, 
      transactions, 
      addFunds, 
      payForCharging, 
      getTransactionHistory,
      refreshBalance: fetchWallet
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
