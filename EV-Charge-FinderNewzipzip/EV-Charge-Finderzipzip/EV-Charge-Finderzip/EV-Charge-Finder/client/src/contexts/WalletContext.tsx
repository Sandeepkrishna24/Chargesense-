import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const savedBalance = localStorage.getItem('walletBalance');
    const savedTransactions = localStorage.getItem('walletTransactions');
    
    if (savedBalance) setBalance(parseFloat(savedBalance));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
  }, []);

  useEffect(() => {
    localStorage.setItem('walletBalance', balance.toString());
    localStorage.setItem('walletTransactions', JSON.stringify(transactions));
  }, [balance, transactions]);

  const addFunds = async (amount: number, method: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      type: 'credit',
      amount,
      description: `Added via ${method}`,
      timestamp: Date.now()
    };
    
    setBalance(prev => prev + amount);
    setTransactions(prev => [newTransaction, ...prev]);
    return true;
  };

  const payForCharging = async (amount: number, stationId: string, stationName: string): Promise<boolean> => {
    if (balance < amount) return false;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      type: 'debit',
      amount,
      description: `Charging at ${stationName}`,
      timestamp: Date.now(),
      stationId
    };
    
    setBalance(prev => prev - amount);
    setTransactions(prev => [newTransaction, ...prev]);
    return true;
  };

  const getTransactionHistory = () => transactions;

  return (
    <WalletContext.Provider value={{ balance, transactions, addFunds, payForCharging, getTransactionHistory }}>
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
