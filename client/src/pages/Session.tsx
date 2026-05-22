import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BatteryCharging, Zap, Clock, Leaf, ArrowLeft, Wallet, 
  CheckCircle2, Loader2, AlertCircle, X, MapPin 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileLayout from "@/components/layout/MobileLayout";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import { startChargingSession, endChargingSession, fetchActiveSession } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export default function Session() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { balance, refreshBalance } = useWallet();
  const queryClient = useQueryClient();
  
  const searchParams = new URLSearchParams(window.location.search);
  const stationId = searchParams.get('stationId') || 'unknown';
  const stationName = searchParams.get('stationName') || 'Charging Station';
  const price_per_unit = Number(searchParams.get('price') || 15);
  
  const [progress, setProgress] = useState(0);
  const [kwh, setKwh] = useState(0);
  const [cost, setCost] = useState(0);
  const [time, setTime] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Frozen snapshot of kwh/cost taken at the moment user clicks "Stop Charging"
  // These stay fixed in the payment modal — they never change after stopping.
  const [frozenKwh, setFrozenKwh] = useState(0);
  const [frozenCost, setFrozenCost] = useState(0);

  const { profile } = useAuth();
  const userId = profile?.email || localStorage.getItem('userEmail') || 'demo-user';

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    const savedId = localStorage.getItem('currentChargingSessionId');
    const savedStation = localStorage.getItem('currentChargingStationId');
    if (savedId && savedStation === stationId) return savedId;
    return null;
  });

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('currentChargingSessionId', currentSessionId);
      localStorage.setItem('currentChargingStationId', stationId);
    } else {
      localStorage.removeItem('currentChargingSessionId');
      localStorage.removeItem('currentChargingStationId');
    }
  }, [currentSessionId, stationId]);

  const { data: activeSession, isSuccess: sessionLoaded } = useQuery({
    queryKey: ['activeSession', userId],
    queryFn: () => fetchActiveSession(userId)
  });

  useEffect(() => {
    if (activeSession && activeSession.id) {
      if (activeSession.stationId === stationId) {
        setCurrentSessionId(activeSession.id);
      } else {
        console.warn("Active session station mismatch:", activeSession.stationId, stationId);
      }
    }
  }, [activeSession, stationId]);

  const startMutation = useMutation({
    mutationFn: (data: any) => startChargingSession(data),
    onSuccess: (data) => {
      if (data && data.id) {
        setCurrentSessionId(data.id);
        queryClient.invalidateQueries({ queryKey: ['activeSession', userId] });
      }
    }
  });

  const endMutation = useMutation({
    mutationFn: (data: any) => endChargingSession(data),
    onSuccess: () => {
      setCurrentSessionId(null);
      localStorage.removeItem('currentChargingSessionId');
      queryClient.invalidateQueries({ queryKey: ['activeSession', userId] });
    }
  });

  // --- FIX: use a ref so the setInterval callback always reads the LATEST stopped state
  //     Without this, the closure captures isStopped=false forever (stale closure bug)
  //     causing the timer to keep running even after Stop is clicked.
  const isStoppedRef = useRef(false);

  useEffect(() => {
    if (sessionLoaded && !activeSession && !currentSessionId && !startMutation.isPending) {
      startMutation.mutate({
        userId,
        stationId,
        stationName,
        vehicleId: localStorage.getItem('selectedVehicleId') || 'v1'
      });
    }

    const interval = setInterval(() => {
      // Read from ref — always gets the CURRENT value, not the stale initial value
      if (!isStoppedRef.current) {
        setProgress(p => (p >= 100 ? 100 : p + 0.1));
        setKwh(k => k + 0.05);
        setTime(t => t + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update displayed cost while charging is running
  useEffect(() => {
    setCost(kwh * price_per_unit);
  }, [kwh, price_per_unit]);

  const handleStopCharging = () => {
    // 1. Stop the interval immediately by flipping the ref
    isStoppedRef.current = true;

    // 2. Capture the EXACT values RIGHT NOW before any re-renders
    //    These become the fixed amounts shown in the payment modal
    const snapKwh = parseFloat(kwh.toFixed(2));
    const snapCost = Math.ceil(snapKwh * price_per_unit);
    setFrozenKwh(snapKwh);
    setFrozenCost(snapCost);

    // 3. Show the payment sheet
    setShowPayment(true);
  };

  const handlePayment = async () => {
    // Always pay the FROZEN amount — never the live `cost` state which might have changed
    const finalCost = frozenCost;
    
    if (balance < finalCost) {
      toast({ 
        variant: "destructive", 
        title: "Insufficient Balance", 
        description: `Please add ₹${finalCost - Math.floor(balance)} or more to your wallet.` 
      });
      return;
    }

    setIsProcessing(true);
    try {
      const sessionToBill = currentSessionId || activeSession?.id;
      if (!sessionToBill) throw new Error("No active session found to bill.");

      const result = await endMutation.mutateAsync({
        sessionId: sessionToBill,
        userId,
        kwhUsed: frozenKwh,
        cost: finalCost
      });

      if (result && result.id) {
        setPaymentComplete(true);
        refreshBalance();
        toast({ title: "Session Completed", description: `₹${finalCost} deducted from wallet` });
        setTimeout(() => setLocation('/history'), 2000);
      }
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "Payment Failed", 
        description: err.message || "Could not complete the transaction." 
      });
      // If payment failed, allow the user to try again — DON'T resume the charging ticker
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <MobileLayout>
      <div className="h-screen bg-black flex flex-col p-6 relative overflow-hidden pb-24">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-pulse pointer-events-none" />

        <header className="relative z-10 text-center mt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest animate-pulse border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" /> CHARGING ACTIVE
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">{stationName}</h1>
          <p className="text-zinc-500 text-sm mt-1">₹{price_per_unit}/unit • {activeSession ? "Resumed Session" : "Live Simulation"}</p>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
          <div className="relative w-72 h-72 flex items-center justify-center mb-12">
             <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
               <motion.circle 
                 cx="50" cy="50" r="46" 
                 fill="none" 
                 stroke="#ff8000"
                 strokeWidth="4"
                 strokeDasharray="289"
                 initial={{ strokeDashoffset: 289 }}
                 animate={{ strokeDashoffset: 289 - (289 * progress) / 100 }}
                 strokeLinecap="round"
               />
             </svg>
             
             <div className="text-center group">
               <div className="text-7xl font-mono font-bold text-white tracking-tighter group-hover:text-primary transition-colors">
                 {Math.floor(progress)}<span className="text-2xl text-zinc-500">%</span>
               </div>
               <div className="text-emerald-400 font-bold mt-2 text-sm flex items-center gap-1 justify-center">
                 <Zap size={14} fill="currentColor" /> +{(price_per_unit > 15 ? 50 : 22)} kW
               </div>
             </div>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full px-2">
            <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-4 rounded-[2rem] text-center">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1">Energy</span>
              <span className="text-xl font-mono font-bold">{kwh.toFixed(2)}</span>
              <span className="text-[9px] text-zinc-500 block">kWh</span>
            </div>
            <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-4 rounded-[2rem] text-center">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1">Time</span>
              <span className="text-xl font-mono font-bold">{formatTime(time)}</span>
              <span className="text-[9px] text-zinc-500 block">Mins</span>
            </div>
            <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-4 rounded-[2rem] text-center border-primary/20 bg-primary/5">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Cost</span>
              <span className="text-xl font-mono font-bold text-white">₹{cost.toFixed(0)}</span>
              <span className="text-[9px] text-zinc-500 block">INR</span>
            </div>
          </div>
        </div>

        <div className="mt-auto relative z-10 space-y-4">
           <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 p-5 rounded-3xl flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                 <Leaf size={24} />
               </div>
               <div>
                 <div className="font-bold">{(kwh * 0.442).toFixed(2)} kg</div>
                 <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">CO₂ Saved</div>
               </div>
             </div>
             <div className="text-right">
               <div className="text-xs text-zinc-500 mb-1 font-bold">WALLET</div>
               <div className="font-mono font-bold">₹{balance.toFixed(0)}</div>
             </div>
           </div>

           <Button 
             variant="destructive" 
             className="w-full h-16 text-lg font-bold rounded-[2rem] shadow-[0_0_30px_rgba(239,68,68,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all"
             onClick={handleStopCharging}
           >
             Stop Charging Session
           </Button>
        </div>

        <AnimatePresence>
          {showPayment && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[10000] flex items-end justify-center"
              onClick={() => !isProcessing && !paymentComplete && setShowPayment(false)}
            >
              <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                className="w-full max-w-md bg-zinc-950 rounded-t-[3rem] p-8 border-t border-white/10 space-y-8 pb-12"
                onClick={e => e.stopPropagation()}
              >
                <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto" />
                
                {paymentComplete ? (
                  <div className="text-center py-10">
                    <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
                    <h3 className="text-3xl font-bold mb-2">Success!</h3>
                    <p className="text-zinc-500">Transaction completed. Viewing history...</p>
                  </div>
                ) : (
                  <>
                    <header className="text-center">
                      <h3 className="text-2xl font-bold">Complete Payment</h3>
                      <p className="text-zinc-500 mt-2">Deducting from ChargeSense Wallet</p>
                    </header>

                    <div className="bg-white/5 rounded-3xl p-6 space-y-4 border border-white/5">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-500 font-bold uppercase tracking-wider">Total Energy</span>
                        {/* Show the FROZEN kWh — never the live running value */}
                        <span className="font-mono font-bold text-lg">{frozenKwh.toFixed(2)} kWh</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/5 pt-4">
                        <span className="text-zinc-500 font-bold uppercase tracking-wider">Final Cost</span>
                        {/* Show the FROZEN cost — never the live running value */}
                        <span className="font-mono text-3xl font-bold text-primary">₹{frozenCost}</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full h-16 rounded-2xl bg-white text-black font-bold text-lg hover:bg-zinc-200"
                      onClick={handlePayment}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing Transaction..." : `Pay ₹${frozenCost} Now`}
                    </Button>

                    <Button variant="ghost" className="w-full text-zinc-500" onClick={() => setShowPayment(false)} disabled={isProcessing}>
                      Go Back
                    </Button>
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
