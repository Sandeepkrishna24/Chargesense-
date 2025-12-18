import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Wallet as WalletIcon, Plus, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2, Loader2, IndianRupee, Smartphone, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/layout/MobileLayout";

const quickAmounts = [100, 200, 500, 1000];

const upiApps = [
  { 
    id: 'gpay', 
    name: 'Google Pay', 
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    icon: '🅰️'
  },
  { 
    id: 'phonepe', 
    name: 'PhonePe', 
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    icon: '📱'
  },
  { 
    id: 'paytm', 
    name: 'Paytm', 
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30',
    icon: '₹'
  },
  { 
    id: 'upi', 
    name: 'Other UPI', 
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    icon: '🔗'
  }
];

export default function WalletPage() {
  const { balance, transactions, addFunds } = useWallet();
  const { toast } = useToast();
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedUpi, setSelectedUpi] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSent, setPaymentSent] = useState(false);

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
      setTimeout(() => {
        const success = addFunds(numAmount, upiApp?.name || 'UPI');
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
    <MobileLayout showNav={false}>
      <div className="min-h-screen bg-black p-4">
        <header className="flex items-center gap-4 mb-6">
          <Link href="/home">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="text-white" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Wallet</h1>
        </header>

        <motion.div 
          className="relative rounded-3xl overflow-hidden mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-orange-500 to-amber-600" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
          
          <div className="relative p-6">
            <div className="flex items-center gap-2 text-black/70 mb-2">
              <WalletIcon size={18} />
              <span className="text-sm font-medium">Available Balance</span>
            </div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-black">₹{balance.toFixed(2)}</span>
            </div>
            
            <Button 
              onClick={() => setShowAddFunds(true)}
              className="w-full bg-black/20 hover:bg-black/30 text-black border-0 backdrop-blur-sm font-bold transition-all hover:shadow-lg"
            >
              <Plus size={18} className="mr-2" />
              Add Money
            </Button>
          </div>
        </motion.div>

        <AnimatePresence>
          {showAddFunds && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                <h3 className="font-bold text-lg">Request Payment</h3>
                
                {paymentSent && (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <p className="text-xs text-green-400 text-center">
                      <span className="inline-block animate-spin mr-2">✓</span>
                      Payment request sent. Awaiting approval...
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-xs text-zinc-500 mb-2 block">Enter Amount</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <Input 
                      type="number"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10 h-12 text-xl font-bold bg-zinc-800 border-zinc-700"
                      disabled={paymentSent}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  {quickAmounts.map(amt => (
                    <motion.button
                      key={amt}
                      onClick={() => setAmount(amt.toString())}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                        amount === amt.toString() 
                          ? 'bg-primary text-black shadow-lg shadow-primary/50' 
                          : 'bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700/60 border border-zinc-700/50'
                      }`}
                    >
                      ₹{amt}
                    </motion.button>
                  ))}
                </div>

                <div>
                  <label className="text-xs text-zinc-500 mb-3 block font-medium">Select UPI App to Approve</label>
                  <div className="grid grid-cols-2 gap-3">
                    {upiApps.map(app => (
                      <motion.button
                        key={app.id}
                        onClick={() => setSelectedUpi(app.id)}
                        disabled={paymentSent}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          selectedUpi === app.id 
                            ? `${app.borderColor} ${app.bgColor} ring-2 ring-offset-2 ring-offset-zinc-900 ring-${app.color.split(' ')[0].split('-')[1]}-500` 
                            : `border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600 hover:bg-zinc-800/50`
                        } ${paymentSent ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.color} mb-2 flex items-center justify-center text-xl`}>
                          {app.icon}
                        </div>
                        <span className="text-xs font-semibold text-white block truncate">{app.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-zinc-700"
                    onClick={() => {
                      setShowAddFunds(false);
                      setPaymentSent(false);
                    }}
                    disabled={paymentSent}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleAddFunds}
                    disabled={isProcessing || paymentSent}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : paymentSent ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Waiting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Request ₹{amount || '0'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Clock size={18} className="text-zinc-400" />
            Transaction History
          </h3>

          {transactions.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <WalletIcon size={40} className="mx-auto mb-3 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm mt-1">Add money to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((txn, idx) => (
                <motion.div
                  key={txn.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    txn.type === 'credit' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {txn.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{txn.description}</p>
                    <p className="text-xs text-zinc-500">{formatDate(txn.timestamp)}</p>
                  </div>
                  <div className={`font-bold ${txn.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
