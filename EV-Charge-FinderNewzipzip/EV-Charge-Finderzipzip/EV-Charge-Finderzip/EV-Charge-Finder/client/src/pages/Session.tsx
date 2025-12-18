import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { BatteryCharging, Zap, Clock, Leaf, ArrowLeft, Wallet, CheckCircle2, Loader2, AlertCircle, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileLayout from "@/components/layout/MobileLayout";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";

export default function Session() {
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState(0);
  const [kwh, setKwh] = useState(0);
  const [cost, setCost] = useState(0);
  const [time, setTime] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  
  const { balance, payForCharging } = useWallet();
  const { toast } = useToast();

  const stationName = localStorage.getItem('currentStation') || 'Charging Station';
  const stationId = localStorage.getItem('currentStationId') || 'unknown';
  
  const handleBack = () => {
    setLocation("/recommendations");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) return 100;
        return p + 0.5;
      });
      setKwh(k => k + 0.1);
      setCost(c => c + 1.5);
      setTime(t => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleStopCharging = () => {
    setShowPayment(true);
  };

  const handlePayment = async () => {
    const finalCost = Math.ceil(cost);
    
    if (balance < finalCost) {
      toast({ 
        variant: "destructive", 
        title: "Insufficient Balance", 
        description: `You need ₹${finalCost} but only have ₹${balance.toFixed(0)}. Please add funds.` 
      });
      return;
    }

    setIsProcessing(true);
    const success = await payForCharging(finalCost, stationId, stationName);
    setIsProcessing(false);

    if (success) {
      setPaymentComplete(true);
      toast({ title: "Payment Successful!", description: `₹${finalCost} paid for charging` });
      
      setTimeout(() => {
        setLocation('/my-vehicle');
      }, 2000);
    }
  };

  const handleSkipPayment = () => {
    toast({ title: "Session Ended", description: "Pay at the station counter" });
    setLocation('/my-vehicle');
  };

  const handleNavigate = () => {
    const stationLat = localStorage.getItem('currentStationLat') || '13.0827';
    const stationLng = localStorage.getItem('currentStationLng') || '80.2707';
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${stationLat},${stationLng}`;
    window.open(mapsUrl, '_blank');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <MobileLayout>
      <div className="h-screen bg-black flex flex-col p-6 relative overflow-hidden">
        
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-50">
          <Link href="/recommendations">
            <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
              <ArrowLeft />
            </Button>
          </Link>
        </div>

        {/* Background Pulse (Orange) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-pulse pointer-events-none" />

        <header className="relative z-10 text-center mb-8 pt-4 mt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider animate-pulse border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary" /> CHARGING ACTIVE
          </div>
          <h1 className="mt-4 text-xl font-bold">Ather Grid - Phoenix</h1>
          <p className="text-zinc-500 text-sm">DC Fast Charger • 50kW</p>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
          {/* Central Charging Ring */}
          <div className="relative w-64 h-64 flex items-center justify-center mb-12">
             {/* SVG Ring Background */}
             <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="4" />
               <circle 
                 cx="50" cy="50" r="45" 
                 fill="none" 
                 stroke="#ff8000" /* Orange Hardcoded for SVG */
                 strokeWidth="4"
                 strokeDasharray="283"
                 strokeDashoffset={283 - (283 * progress) / 100}
                 strokeLinecap="round"
                 className="transition-all duration-1000 ease-linear"
               />
             </svg>
             
             <div className="text-center">
               <div className="text-6xl font-mono font-bold text-white tracking-tighter">
                 {Math.floor(progress)}<span className="text-2xl text-zinc-500">%</span>
               </div>
               <div className="text-primary font-bold mt-1 animate-pulse">
                 +24 kW
               </div>
             </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6 w-full max-w-sm">
            <div className="text-center space-y-1">
              <div className="flex justify-center text-zinc-500"><Zap size={20} /></div>
              <div className="text-2xl font-mono font-bold">{kwh.toFixed(1)}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">kWh Added</div>
            </div>
            <div className="text-center space-y-1 border-x border-zinc-800">
              <div className="flex justify-center text-zinc-500"><Clock size={20} /></div>
              <div className="text-2xl font-mono font-bold">{formatTime(time)}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Duration</div>
            </div>
            <div className="text-center space-y-1">
              <div className="flex justify-center text-zinc-500">₹</div>
              <div className="text-2xl font-mono font-bold">{cost.toFixed(0)}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Cost</div>
            </div>
          </div>
        </div>

        {/* Action Slider */}
        <div className="mt-auto relative z-10 space-y-4">
           <div className="glass-card p-4 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-green-900/20 flex items-center justify-center text-green-500">
                 <Leaf size={20} />
               </div>
               <div>
                 <div className="font-bold">{(kwh * 0.4).toFixed(2)} kg</div>
                 <div className="text-xs text-zinc-500">CO₂ Saved</div>
               </div>
             </div>
             <div className="flex items-center gap-2 text-zinc-400">
               <Wallet size={16} />
               <span className="text-sm font-medium">₹{balance.toFixed(0)}</span>
             </div>
           </div>

           <div className="grid grid-cols-2 gap-3">
             <Button 
               variant="outline"
               className="h-12 text-base font-bold rounded-xl border-orange-500/50 hover:bg-orange-500/10"
               onClick={handleNavigate}
             >
               <MapPin size={18} className="mr-2" />
               Navigate
             </Button>
             <Button 
               variant="destructive" 
               className="h-12 text-base font-bold rounded-xl"
               onClick={handleStopCharging}
             >
               Stop Charging
             </Button>
           </div>
        </div>

        <AnimatePresence>
          {showPayment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end justify-center p-4"
            >
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="w-full max-w-md bg-zinc-900 rounded-3xl p-6 space-y-6 border border-zinc-800"
              >
                {paymentComplete ? (
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
                    <p className="text-zinc-400">Redirecting to home...</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div />
                      <h3 className="text-xl font-bold">Complete Payment</h3>
                      <button 
                        onClick={handleSkipPayment}
                        className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
                      >
                        <X size={20} className="text-zinc-400" />
                      </button>
                    </div>
                    <p className="text-zinc-400 text-sm text-center mb-4">Pay from your ChargeSense wallet</p>

                    <div className="bg-zinc-800/50 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Energy Used</span>
                        <span className="font-medium">{kwh.toFixed(2)} kWh</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Duration</span>
                        <span className="font-medium">{Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Station</span>
                        <span className="font-medium truncate max-w-[150px]">{stationName}</span>
                      </div>
                      <div className="border-t border-zinc-700 pt-3 flex justify-between">
                        <span className="font-bold">Total Amount</span>
                        <span className="font-bold text-primary text-xl">₹{Math.ceil(cost)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/30 border border-zinc-700">
                      <div className="flex items-center gap-2">
                        <Wallet className="text-primary" size={20} />
                        <span className="text-sm">Wallet Balance</span>
                      </div>
                      <span className={`font-bold ${balance >= Math.ceil(cost) ? 'text-green-500' : 'text-red-500'}`}>
                        ₹{balance.toFixed(0)}
                      </span>
                    </div>

                    {balance < Math.ceil(cost) && (
                      <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl">
                        <AlertCircle size={16} />
                        <span>Insufficient balance. Add ₹{Math.ceil(cost) - balance} more.</span>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        className="flex-1 border-zinc-700"
                        onClick={handleSkipPayment}
                      >
                        Pay at Counter
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={handlePayment}
                        disabled={isProcessing || balance < Math.ceil(cost)}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          `Pay ₹${Math.ceil(cost)}`
                        )}
                      </Button>
                    </div>

                    <Link href="/wallet" className="block">
                      <Button variant="ghost" className="w-full text-primary hover:text-primary/80">
                        <Wallet className="w-4 h-4 mr-2" />
                        Add Money to Wallet
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </MobileLayout>
  );
}
