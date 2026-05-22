import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, ShieldCheck, QrCode, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MobileLayout from "@/components/layout/MobileLayout";
import { useToast } from "@/hooks/use-toast";

export default function ScanQR() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/scan/:id");
  const { toast } = useToast();
  
  const stationId = params?.id || "";
  const searchParams = new URLSearchParams(window.location.search);
  const stationName = searchParams.get('stationName') || "Charging Station";
  const price = searchParams.get('price') || "18";

  const [pin, setPin] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [isValidating, setIsValidating] = useState(false);

  // Simulate viewfinder animation
  const [scanLinePos, setScanLinePos] = useState(0);

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanLinePos(prev => prev >= 100 ? 0 : prev + 2);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const handleManualEntry = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 6) {
      setPin(val);
    }
    
    if (val.length === 6) {
      validateConnection(val);
    }
  };

  const validateConnection = (code: string) => {
    setIsScanning(false);
    setIsValidating(true);
    
    // Simulate network validation delay
    setTimeout(() => {
      setIsValidating(false);
      if (code === "123456" || code.length === 6) {
        toast({
          title: "Charger Authenticated",
          description: "Connection successful. Preparing session...",
          duration: 2000,
        });
        
        // Redirect to actual session
        setTimeout(() => {
          setLocation(`/session?stationId=${stationId}&stationName=${encodeURIComponent(stationName)}&price=${price}`);
        }, 1000);
      } else {
        toast({
          title: "Invalid Code",
          description: "The charger ID could not be verified.",
          variant: "destructive"
        });
        setIsScanning(true);
        setPin("");
      }
    }, 1500);
  };

  const simulateSuccessfulScan = () => {
    validateConnection("987654");
  };

  return (
    <MobileLayout showNav={false}>
      <div className="min-h-screen bg-black flex flex-col relative text-white">
        
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pt-8">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="bg-black/50 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span className="text-xs font-bold tracking-wider">SECURE LINK</span>
          </div>
        </div>

        {/* Info Banner */}
        <div className="absolute top-24 left-6 right-6 z-20 text-center">
          <h1 className="text-2xl font-bold mb-1 shadow-black drop-shadow-lg">Scan to Charge</h1>
          <p className="text-sm font-medium text-zinc-300 drop-shadow-md">
            {stationName}
          </p>
        </div>

        {/* Camera Viewfinder Area */}
        <div className="flex-1 relative flex items-center justify-center bg-zinc-950 overflow-hidden">
          {/* Simulated Camera Feed Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-black" />
          </div>

          {!isValidating ? (
            <div className="relative z-10 w-[280px] h-[280px] rounded-3xl border-2 border-primary/50 flex items-center justify-center overflow-hidden bg-black/40 backdrop-blur-sm shadow-[0_0_50px_rgba(255,165,0,0.15)]">
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl" />
              
              <QrCode size={100} className="text-zinc-700 opacity-50" />
              
              {/* Scanning Laser */}
              {isScanning && (
                <div 
                  className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_15px_rgba(255,165,0,1)] z-20"
                  style={{ top: `${scanLinePos}%`, transition: 'top 50ms linear' }}
                />
              )}

              {/* Invisible button to fake a successful camera scan */}
              <button 
                className="absolute inset-0 w-full h-full z-30 opacity-0"
                onClick={simulateSuccessfulScan}
              />
            </div>
          ) : (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="w-24 h-24 rounded-full border-4 border-primary border-t-transparent absolute"
                />
                <ShieldCheck size={40} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Authenticating Handshake...</h2>
              <p className="text-zinc-400 text-sm">Verifying dynamic pricing protocol</p>
            </motion.div>
          )}

          <div className="absolute bottom-10 flex gap-2 items-center text-xs font-bold text-zinc-500 uppercase tracking-widest">
            <Camera size={14} /> Ensure well-lit environment
          </div>
        </div>

        {/* Bottom Manual Entry Panel */}
        <div className="bg-zinc-950 rounded-t-[2.5rem] p-8 pb-12 border-t border-white/10 z-20 relative shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
          <div className="w-12 h-1.5 bg-zinc-800 rounded-full absolute top-3 left-1/2 -translate-x-1/2" />
          
          <div className="text-center mb-6 mt-2">
            <h3 className="text-lg font-bold text-white mb-1">Enter Charger ID Manually</h3>
            <p className="text-xs text-zinc-400">Can't scan the QR? Find the 6-digit ID below the screen.</p>
          </div>

          <div className="flex justify-center mb-6">
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={handleManualEntry}
              placeholder="••••••"
              className="w-full max-w-[240px] h-16 text-center text-3xl font-mono tracking-[0.5em] font-bold bg-zinc-900/80 border-white/10 focus-visible:ring-primary rounded-2xl text-white placeholder:text-zinc-700"
              disabled={isValidating}
            />
          </div>

          <div className="flex bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl items-start gap-3">
            <AlertCircle size={20} className="text-orange-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-orange-400 mb-0.5">Physical Connection Required</h4>
              <p className="text-xs text-orange-400/80 leading-relaxed">
                Please make sure the charging cable is firmly plugged into your vehicle before authenticating.
              </p>
            </div>
          </div>
        </div>

      </div>
    </MobileLayout>
  );
}
