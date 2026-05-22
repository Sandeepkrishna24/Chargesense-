import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  MapPin,
  Wallet,
  Battery,
  Shield,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileLayout from "@/components/layout/MobileLayout";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: MapPin,
    title: "Smart Location",
    description: "Real-time intelligent charger tracking",
    color: "from-orange-600 to-amber-600",
  },
  {
    icon: Battery,
    title: "Live Status",
    description: "Instant availability and queue monitoring",
    color: "from-orange-500 to-orange-400",
  },
  {
    icon: Wallet,
    title: "Direct Pay",
    description: "Integrated UPI and secure crypto payments",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Shield,
    title: "Pro Verified",
    description: "Certified compatibility for your EV model",
    color: "from-orange-400 to-orange-600",
  },
];

/* ── MICRO COUNTER COMPONENT ── */
function Counter({ value, label }: { value: string, label: string }) {
  const [count, setCount] = useState(0);
  const target = parseInt(value.replace(/\D/g, ''));
  const suffix = value.replace(/\d/g, '');

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const stepTime = Math.abs(Math.floor(duration / target));
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= target) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="flex flex-col items-center">
      <span className="text-xl font-black text-white">{count}{suffix}</span>
      <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest mt-0.5">{label}</span>
    </div>
  );
}

export default function LandingPage() {
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MobileLayout>
      <div className="min-h-screen bg-black text-white overflow-hidden selection:bg-primary/20">
        
        {/* Ambient Background Particles */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmczPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
          
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 20, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-primary/10 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, -30, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] bg-orange-600/5 rounded-full blur-[100px]" 
          />
        </div>

        <div className="relative z-10 px-6 pt-8 pb-6 min-h-screen flex flex-col max-w-md mx-auto space-y-4">
          
          {/* Refined Header */}
          <motion.header
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center p-1.5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-orange-600 opacity-20 group-hover:opacity-40 transition-opacity" />
                <Zap className="w-full h-full text-primary relative z-10 p-0.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-base tracking-tighter uppercase leading-none">
                  Charge<span className="text-zinc-500 font-normal">Sense</span>
                </span>
                <span className="text-[6px] text-zinc-600 font-black tracking-[0.3em] uppercase mt-0.5">
                  Eco Infrastructure
                </span>
              </div>
            </div>
          </motion.header>

          <div className="flex-1 flex flex-col justify-center py-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center space-y-3"
            >
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 shadow-lg mx-auto backdrop-blur-md">
                <div className="w-1 h-1 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(255,165,0,0.8)]" />
                <span className="text-[7px] font-black uppercase tracking-widest text-zinc-400">
                  Network Online
                </span>
              </div>

              <h1 className="text-4xl font-black leading-[0.9] tracking-tighter uppercase">
                Future <span className="text-zinc-800 italic font-medium tracking-normal lowercase">of</span>
                <br />
                <span className="relative inline-block mt-0.5">
                  <span className="bg-gradient-to-r from-primary via-orange-400 to-amber-500 bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
                    Mobility
                  </span>
                </span>
              </h1>

              <p className="text-zinc-500 text-[10px] font-semibold max-w-[200px] mx-auto leading-relaxed">
                Precision power architected for the next generation of electric performance.
              </p>
            </motion.div>

            {/* Premium Glassmorphic Feature Card */}
            <div className="mt-8 relative px-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeature}
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  className="w-full"
                >
                  <div className="relative p-[1px] rounded-[2rem] bg-gradient-to-b from-white/20 via-white/5 to-transparent overflow-hidden shadow-2xl">
                    <div className="relative z-10 p-6 flex flex-col items-center text-center gap-4 bg-zinc-900/40 backdrop-blur-[40px] rounded-[1.95rem] border border-white/5 group">
                      
                      {/* Dynamic accent glow */}
                      <div className={`absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br ${features[currentFeature].color} opacity-[0.08] blur-[40px] group-hover:opacity-[0.12] transition-opacity`} />

                      <div className="relative">
                        <motion.div 
                          layoutId="icon-bg"
                          className={`absolute inset-0 bg-gradient-to-br ${features[currentFeature].color} opacity-30 blur-2xl rounded-full`} 
                        />
                        <div className={`relative w-12 h-12 rounded-xl bg-zinc-900/80 flex items-center justify-center border border-white/10 p-2.5 shadow-xl`}>
                          {(() => {
                            const Icon = features[currentFeature].icon;
                            return <Icon className="w-full h-full text-white" strokeWidth={2.5} />;
                          })()}
                        </div>
                      </div>

                      <div className="space-y-1 relative z-10">
                        <h3 className="text-lg font-black uppercase tracking-tight text-white leading-none">
                          {features[currentFeature].title}
                        </h3>
                        <p className="text-zinc-400 text-[9px] font-bold leading-relaxed tracking-wider max-w-[160px] mx-auto uppercase opacity-80">
                          {features[currentFeature].description}
                        </p>
                      </div>

                      {/* Pagination Dots */}
                      <div className="flex gap-2 z-20 mt-1">
                        {features.map((_, idx) => (
                          <div
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentFeature(idx);
                            }}
                            className={cn(
                              "w-1 h-1 rounded-full transition-all duration-500 cursor-pointer",
                              idx === currentFeature ? "bg-primary w-4 shadow-[0_0_12px_rgba(255,165,0,0.6)]" : "bg-white/10 hover:bg-white/20"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Animated Stats Micro-Grid */}
          <motion.div
            className="grid grid-cols-3 gap-6 py-6 px-2 border-y border-white/5 my-4 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
             <Counter value="65+" label="Models" />
             <Counter value="12k+" label="Stations" />
             <Counter value="24/7" label="Uptime" />
          </motion.div>

          {/* Pulsing Primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="px-2"
          >
            <Link href="/vehicles">
              <div className="relative group">
                {/* Outer Glow Aura */}
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-xl group-hover:bg-primary/40 transition-all duration-500 animate-pulse-slow" />
                
                <Button className="relative w-full h-14 rounded-xl bg-primary hover:bg-orange-600 text-black font-black text-sm shadow-2xl active:scale-[0.98] transition-all group overflow-hidden border-t border-white/20">
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    <Zap className="w-4 h-4 fill-current" />
                    <span className="uppercase tracking-tight">Locate Charger</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                  
                  {/* Internal gloss shine */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Button>
              </div>
            </Link>
          </motion.div>

          <footer className="mt-12 text-center">
            <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.5em] mb-1">
              Engineered by ChargeSense
            </p>
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-zinc-800 to-transparent mx-auto" />
          </footer>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 5s linear infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}} />
    </MobileLayout>
  );
}
