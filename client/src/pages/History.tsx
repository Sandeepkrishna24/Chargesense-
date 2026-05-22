import { useQuery } from "@tanstack/react-query";
import { fetchSessions } from "@/lib/api";
import { motion } from "framer-motion";
import { 
  History as HistoryIcon, 
  MapPin, 
  Zap, 
  Clock, 
  ChevronRight, 
  ArrowLeft,
  Calendar,
  CreditCard
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import MobileLayout from "@/components/layout/MobileLayout";
import { useAuth } from "@/contexts/AuthContext";

export default function History() {
  const [, setLocation] = useLocation();
  const { profile } = useAuth();
  const userId = profile?.email || localStorage.getItem('userEmail') || 'demo-user';

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions', userId],
    queryFn: () => fetchSessions(userId)
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (start: number, end?: number) => {
    if (!end) return "Active";
    const mins = Math.round((end - start) / (1000 * 60));
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hrs}h ${remainingMins}m`;
  };

  return (
    <MobileLayout>
      <div className="p-6 min-h-screen bg-black relative overflow-hidden flex flex-col pb-24">
        {/* Background Glow */}
        <div className="absolute top-0 left-0 w-full h-64 bg-emerald-500/10 blur-[100px] pointer-events-none" />

        <header className="relative z-10 flex items-center gap-4 mb-8 pt-10">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-white/5 border border-white/10"
            onClick={() => setLocation("/profile")}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
            <p className="text-zinc-400 text-sm font-medium">Your charging history</p>
          </div>
        </header>

        <div className="flex-1 relative z-10 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-zinc-900 animate-pulse rounded-[2rem]" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6">
                <HistoryIcon size={32} className="text-zinc-700" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Sessions Yet</h3>
              <p className="text-zinc-500 max-w-[200px]">Your completed charging sessions will appear here.</p>
              <Button 
                className="mt-8 bg-primary text-black rounded-xl font-bold"
                onClick={() => setLocation("/recommendations")}
              >
                Find a Station
              </Button>
            </div>
          ) : (
            [...sessions].reverse().slice(0, 30).map((session: any, idx: number) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-5 shadow-xl hover:border-emerald-500/20 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg group-hover:text-emerald-400 transition-colors">{session.stationName}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">
                      <Calendar size={12} />
                      {formatDate(session.endTime || session.startTime)}
                    </div>
                  </div>
                  <div className="text-right text-zinc-100 font-mono font-bold text-lg">
                    ₹{session.cost}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-black/30 p-3 rounded-2xl border border-white/5 text-center">
                    <Zap size={14} className="text-primary mx-auto mb-1" />
                    <div className="text-xs font-bold">{session.kwhUsed.toFixed(1)}</div>
                    <div className="text-[8px] text-zinc-600 uppercase font-black">kWh</div>
                  </div>
                  <div className="bg-black/30 p-3 rounded-2xl border border-white/5 text-center">
                    <Clock size={14} className="text-zinc-400 mx-auto mb-1" />
                    <div className="text-xs font-bold">{calculateDuration(session.startTime, session.endTime)}</div>
                    <div className="text-[8px] text-zinc-600 uppercase font-black">Duration</div>
                  </div>
                  <div className="bg-black/30 p-3 rounded-2xl border border-white/5 text-center">
                    <CreditCard size={14} className="text-blue-400 mx-auto mb-1" />
                    <div className="text-xs font-bold">Wallet</div>
                    <div className="text-[8px] text-zinc-600 uppercase font-black">Paid</div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
