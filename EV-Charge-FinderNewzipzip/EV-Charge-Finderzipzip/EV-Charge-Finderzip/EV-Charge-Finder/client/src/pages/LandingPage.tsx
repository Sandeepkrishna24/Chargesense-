import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, MapPin, Wallet, Battery, Shield, Clock, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: MapPin,
    title: "Smart Location",
    description: "Find nearest compatible chargers based on your vehicle and location",
    color: "from-orange-500 to-amber-500"
  },
  {
    icon: Battery,
    title: "Real-time Availability",
    description: "Live status updates and queue times for all charging stations",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Wallet,
    title: "Seamless Payments",
    description: "Pay directly from your wallet with UPI integration",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Shield,
    title: "Vehicle Compatibility",
    description: "Only see chargers that work with your specific EV model",
    color: "from-purple-500 to-pink-500"
  }
];

const stats = [
  { value: "95+", label: "EVs Supported" },
  { value: "8+", label: "Stations" },
  { value: "24/7", label: "Availability" },
  { value: "₹8", label: "Avg Cost/Unit" }
];

export default function LandingPage() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-t from-orange-500/10 to-transparent rounded-full blur-3xl" />
      </motion.div>

      <div className="relative z-10 px-6 py-8 min-h-screen flex flex-col">
        <motion.header 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-xl tracking-tight">ChargeSense</span>
          </div>
        </motion.header>

        <div className="flex-1 flex flex-col justify-center py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-8"
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary">Intelligent EV Charging</span>
            </motion.div>
            
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Charge Smarter,
              <br />
              <span className="bg-gradient-to-r from-primary via-orange-400 to-amber-500 bg-clip-text text-transparent">
                Drive Further
              </span>
            </h1>
            
            <p className="text-zinc-400 text-sm max-w-xs mx-auto">
              Find the perfect charging station for your EV. Real-time availability, smart recommendations, seamless payments.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-4 gap-3 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {stats.map((stat, idx) => (
              <motion.div 
                key={stat.label}
                className="text-center p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 + idx * 0.1 }}
              >
                <div className="text-lg font-bold text-primary">{stat.value}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="relative h-48 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature}
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <div className="h-full rounded-3xl bg-zinc-900/80 border border-zinc-800 p-6 flex flex-col justify-between overflow-hidden relative">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${features[currentFeature].color} opacity-20 blur-3xl`} />
                  
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${features[currentFeature].color} flex items-center justify-center mb-4`}>
                      {(() => {
                        const Icon = features[currentFeature].icon;
                        return <Icon className="w-6 h-6 text-white" />;
                      })()}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{features[currentFeature].title}</h3>
                    <p className="text-zinc-400 text-sm">{features[currentFeature].description}</p>
                  </div>

                  <div className="flex gap-1.5 mt-4">
                    {features.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentFeature(idx)}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          idx === currentFeature ? 'w-6 bg-primary' : 'w-1.5 bg-zinc-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <Link href="/vehicles">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="w-full h-16 rounded-3xl bg-gradient-to-r from-primary via-orange-500 to-amber-500 hover:from-primary/95 hover:via-orange-500/95 hover:to-amber-500/95 text-black font-bold text-lg group shadow-[0_0_40px_-10px_rgba(255,128,0,0.3)] hover:shadow-[0_0_50px_-5px_rgba(255,128,0,0.4)] transition-all">
                  <Zap className="w-6 h-6 mr-2" />
                  Get Started Now
                  <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
            
            <div className="flex gap-3">
              <Link href="/wallet" className="flex-1">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" className="w-full h-12 rounded-2xl border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 text-white font-semibold transition-all">
                    <Wallet className="w-4 h-4 mr-2 text-primary" />
                    Wallet
                  </Button>
                </motion.div>
              </Link>
              <Link href="/map" className="flex-1">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" className="w-full h-12 rounded-2xl border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 text-white font-semibold transition-all">
                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                    Map
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.footer 
          className="text-center py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          <p className="text-xs text-zinc-600">
            Powered by ChargeSense • Made for Indian EVs
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
