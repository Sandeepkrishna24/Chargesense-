import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Wallet as WalletIcon, Plus, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2, Loader2, IndianRupee, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/layout/MobileLayout";

const quickAmounts = [100, 200, 500, 1000];

const GPayIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
    <circle cx="12" cy="12" r="10" fill="white" opacity="0.2"/>
    <text x="12" y="14" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="Arial">G</text>
  </svg>
);

const PhonepeIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
    <path d="M8 2h8l3 4v14H5V6l3-4z"/>
    <path d="M12 11v6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

const PaytmIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
    <circle cx="12" cy="12" r="10"/>
    <text x="12" y="15" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="bold" fontFamily="Arial">P</text>
  </svg>
);

const UPIIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
  </svg>
);

const upiApps = [
  { 
    id: 'gpay', 
    name: 'Google Pay', 
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/40',
    icon: GPayIcon
  },
  { 
    id: 'phonepe', 
    name: 'PhonePe', 
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/40',
    icon: PhonepeIcon
  },
  { 
    id: 'paytm', 
    name: 'Paytm', 
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/40',
    icon: PaytmIcon
  },
  { 
    id: 'upi', 
    name: 'Other UPI', 
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/40',
    icon: UPIIcon
  }
];

export default function WalletPage() {
  const { balance, transactions, addFunds } = useWallet();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedUpi, setSelectedUpi] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSent, setPaymentSent] = useState(false);

  const handleBack = () => {
    // Try to go back; if it doesn't work, go to home
    try {
      const result = window.history.back();
      // If back didn't work, fallback to home after a short delay
      setTimeout(() => {
        if (window.location.pathname === '/wallet') {
          setLocation("/home");
        }
      }, 100);
    } catch (e) {
      setLocation("/home");
    }
  };

  const handleAddFunds = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast({ variant: "destructive", title: "Invalid amount", description: "Please enter a valid amount" });
      return;
    }
    if (!selectedUpi) {
      toast({ variant: "destructive", title: "Select payment app", description: "Please select a UPI app" });
      return;
    }

    setIsProcessing(true);
    const upiApp = upiApps.find(u => u.id === selectedUpi);
    
    // Simulate sending payment request
    setTimeout(() => {
      setPaymentSent(true);
      setIsProcessing(false);
      toast({ 
        title: "Payment Request Sent!", 
        description: `₹${numAmount} request sent to your ${upiApp?.name}. Please approve in your ${upiApp?.name} app.` 
      });
      
      // Auto-process after 2 seconds
      setTimeout(async () => {
        const success = await addFunds(numAmount, upiApp?.name || 'UPI');
        if (success) {
          setPaymentSent(false);
          setShowAddFunds(false);
          setAmount('');
          setSelectedUpi('');
          toast({ title: "Success!", description: `₹${numAmount} added to wallet` });
        }
      }, 2000);
    }, 1500);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <MobileLayout>
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col pb-24">
        {/* Background Visuals */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmczPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20 pointer-events-none" />
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[70vw] h-[70vw] bg-gradient-to-tl from-orange-600/10 to-transparent rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <header className="relative z-10 pt-10 px-6 pb-4 flex items-center justify-between">
          <motion.button
            onClick={handleBack}
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-xl"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-zinc-300">Secure</span>
          </div>
        </header>

        <div className="px-6 flex-1 relative z-10 overflow-y-auto no-scrollbar">
          {/* Main Wallet Card */}
          <motion.div 
            className="relative rounded-[2.5rem] overflow-hidden mb-6 shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-orange-500 to-amber-600" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20 mix-blend-overlay" />
            
            {/* Glossy highlight */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />

            <div className="relative p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-black/80 font-bold uppercase tracking-widest text-[10px]">
                  <WalletIcon size={16} /> EV Wallet Balance
                </div>
                <div className="px-3 py-1 bg-black/10 rounded-full border border-black/10 text-[10px] font-bold text-black uppercase tracking-wider">
                  Active
                </div>
              </div>
              
              <div className="mb-8 flex items-end gap-1">
                <span className="text-2xl font-black text-black/80">₹</span>
                <span className="text-5xl font-black text-black tracking-tighter mix-blend-plus-darker">
                  {balance.toFixed(2)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  onClick={() => setShowAddFunds(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-black text-white border-0 font-bold p-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(0,0,0,0.3)] transition-all"
                >
                  <Plus size={18} className="text-primary" /> Add Money
                </motion.button>
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3.5 flex flex-col justify-center overflow-hidden border border-white/20">
                  <div className="text-[9px] font-bold text-black/70 uppercase tracking-widest mb-0.5">Last Added</div>
                  <div className="text-sm font-black text-black truncate">
                    {transactions.find(t => t.type === 'credit')?.amount ? `+₹${transactions.find(t => t.type === 'credit')?.amount}` : '--'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {showAddFunds && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <div className="p-6 rounded-[2rem] bg-zinc-900/60 backdrop-blur-xl border border-white/5 shadow-2xl relative">
                  
                  {/* Flowy background detail */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none" />

                  <h3 className="font-bold text-lg mb-4 text-white">Add Funds</h3>
                  
                  {paymentSent && (
                    <div className="mb-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Loader2 size={16} className="text-emerald-400 animate-spin" />
                      </div>
                      <p className="text-xs font-bold text-emerald-400">
                        Payment request sent. Awaiting approval...
                      </p>
                    </div>
                  )}

                  <div className="mb-6 relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                    <Input 
                      type="number"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-12 h-16 text-3xl font-black bg-black/40 border-white/10 rounded-2xl focus-visible:ring-primary/50 focus-visible:bg-black/80 text-white placeholder:text-zinc-500 transition-all shadow-inner"
                      disabled={paymentSent}
                    />
                  </div>

                  <div className="flex gap-2 mb-6">
                    {quickAmounts.map(amt => (
                      <motion.button
                        key={amt}
                        onClick={() => setAmount(amt.toString())}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-1 py-3.5 rounded-2xl text-[13px] font-bold transition-all border ${
                          amount === amt.toString() 
                            ? 'bg-primary text-black border-transparent shadow-[0_0_15px_rgba(255,165,0,0.3)]' 
                            : 'bg-black/40 text-zinc-400 border-white/5 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        +₹{amt}
                      </motion.button>
                    ))}
                  </div>

                  <div className="mb-6">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block">Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      {upiApps.map(app => {
                        const IconComponent = app.icon;
                        const isSelected = selectedUpi === app.id;
                        return (
                          <motion.button
                            key={app.id}
                            onClick={() => setSelectedUpi(app.id)}
                            disabled={paymentSent}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                              isSelected 
                                ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(249,115,22,0.2)]" 
                                : "border-white/5 bg-black/40 hover:border-white/10 hover:bg-white/5"
                            } ${paymentSent ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${app.color} flex items-center justify-center shadow-lg`}>
                              <IconComponent />
                            </div>
                            <span className="text-xs font-bold text-white tracking-wide">{app.name}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6 mt-4 border-t border-white/5">
                    <Button 
                      className="flex-1 h-12 rounded-2xl border-white/10 bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                      onClick={() => {
                        setShowAddFunds(false);
                        setPaymentSent(false);
                        setAmount('');
                      }}
                      disabled={paymentSent}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-[2] h-12 rounded-2xl font-bold gap-2 text-sm shadow-[0_0_20px_rgba(255,165,0,0.2)]"
                      onClick={handleAddFunds}
                      disabled={isProcessing || paymentSent || !amount || !selectedUpi}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : paymentSent ? (
                        <>Waiting...</>
                      ) : (
                        <>Pay ₹{amount || '0'}</>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="h-4" />

          <div className="mb-10">
            <h3 className="font-bold text-sm mb-4 uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Clock size={16} /> Recent Activity
            </h3>

            {transactions.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 bg-zinc-900/30 rounded-3xl border border-white/5 backdrop-blur-sm">
                <WalletIcon size={32} className="mx-auto mb-3 opacity-30" />
                <p className="font-bold text-white mb-1">No Activity</p>
                <p className="text-xs">Your charging history will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((txn, idx) => {
                  const isCredit = txn.type === 'credit';
                  return (
                    <motion.div
                      key={txn.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${
                        isCredit 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-zinc-800 text-white border-white/10'
                      }`}>
                        {isCredit ? <ArrowDownLeft size={20} strokeWidth={3} /> : <Zap size={20} className="text-orange-400 fill-orange-400/20" />}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-sm text-white truncate mb-0.5">{txn.description}</p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 flex items-center gap-1.5">
                          {formatDate(txn.timestamp)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`font-black text-base ${isCredit ? 'text-emerald-400' : 'text-white'}`}>
                          {isCredit ? '+' : '-'}₹{txn.amount.toFixed(2)}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
