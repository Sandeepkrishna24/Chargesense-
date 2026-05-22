import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Settings,
  LogOut,
  ChevronRight,
  Car,
  Shield,
  AlertCircle,
  Wallet,
  Pencil,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/layout/MobileLayout";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { signOut, user, profile } = useAuth();
  const { toast } = useToast();

  const [vehicleId, setVehicleId] = useState("v1");
  const [notifications, setNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  useEffect(() => {
    setVehicleId(localStorage.getItem("selectedVehicleId") || "v1");

    const stored = localStorage.getItem("notificationsEnabled") === "true";

    if ("Notification" in window && Notification.permission === "granted") {
      setNotifications(stored);
    } else {
      setNotifications(false);
    }
  }, [user]);

  const { data: vehicleData, isLoading: vehicleLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const res = await fetch('/api/vehicles');
      if (!res.ok) throw new Error('Failed to fetch vehicles');
      return res.json();
    }
  });

  const currentVehicle = useMemo(() => {
    if (!vehicleData) return null;
    return vehicleData.find((v: any) => v.id === vehicleId) || vehicleData[0];
  }, [vehicleData, vehicleId]);

  const handleNotificationToggle = async (checked: boolean) => {
    setNotificationError(null);

    if (!checked) {
      setNotifications(false);
      localStorage.setItem("notificationsEnabled", "false");
      return;
    }

    if (!("Notification" in window)) {
      setNotifications(false);
      setNotificationError("Browser does not support notifications.");
      return;
    }

    if (Notification.permission === "granted") {
      setNotifications(true);
      localStorage.setItem("notificationsEnabled", "true");
      toast({ title: "Notifications Enabled" });
      return;
    }

    if (Notification.permission === "denied") {
      setNotifications(false);
      localStorage.setItem("notificationsEnabled", "false");
      setNotificationError("Enable notifications in browser settings.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotifications(true);
        localStorage.setItem("notificationsEnabled", "true");

        new Notification("ChargeSense", {
          body: "Charging alerts enabled ⚡",
        });

        toast({ title: "Notifications Enabled" });
      } else {
        setNotifications(false);
        localStorage.setItem("notificationsEnabled", "false");
      }
    } catch {
      setNotifications(false);
      setNotificationError("Failed to enable notifications.");
    }
  };

  const handleLogout = async () => {
    await signOut();
    setLocation("/");
  };

  const displayName = profile?.name || "User";
  const displayEmail = profile?.email || user?.email || "No email provided";
  const displayInitial = displayName[0]?.toUpperCase() || "U";

  return (
    <MobileLayout>
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col pb-24">
        {/* Background Visuals */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmczPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20 pointer-events-none" />
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-10%] w-[70vw] h-[70vw] bg-gradient-to-tl from-cyan-600/10 to-transparent rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <header className="relative z-10 pt-8 px-6 pb-6">
          <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-lg">My Profile</h1>
          <p className="text-zinc-500 font-medium text-sm mt-1">
            Manage your account and settings
          </p>
        </header>

        <div className="px-6 flex-1 relative z-10 overflow-y-auto no-scrollbar space-y-6">
          {/* Profile Card */}
          <button
            onClick={() => setLocation("/edit-profile")}
            className="w-full flex items-center gap-4 p-5 bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] hover:border-primary/40 transition-all group shadow-2xl relative overflow-hidden"
          >
            {/* Subtle highlight */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-orange-600/20 flex items-center justify-center border-2 border-primary/30 group-hover:border-primary transition-all shadow-[0_0_20px_rgba(255,165,0,0.15)] overflow-hidden shrink-0">
              {profile?.photoUrl ? (
                <img src={profile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-primary drop-shadow-md">
                  {displayInitial}
                </span>
              )}
            </div>
            <div className="flex-1 text-left overflow-hidden relative z-10">
              <h2 className="text-xl font-bold truncate tracking-tight text-white group-hover:text-primary transition-colors">{displayName}</h2>
              <p className="text-zinc-500 text-sm truncate">{displayEmail}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-black/40 border border-white/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all">
              <Pencil size={16} className="text-zinc-400 group-hover:text-primary transition-colors" />
            </div>
          </button>

          <div className="space-y-3">
            {/* Wallet & Payments */}
            <button
              onClick={() => setLocation("/wallet")}
              className="w-full p-4 bg-black/40 backdrop-blur-md border border-white/5 rounded-3xl flex justify-between items-center hover:bg-white/5 hover:border-white/10 transition-all shadow-lg group relative overflow-hidden"
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 group-hover:shadow-[0_0_15px_rgba(255,165,0,0.2)] transition-all">
                  <Wallet size={20} className="text-primary" />
                </div>
                <span className="font-bold text-lg tracking-tight text-white group-hover:text-primary transition-colors">Wallet & Payments</span>
              </div>
              <ChevronRight className="text-zinc-600 group-hover:text-primary transition-all group-hover:translate-x-1 relative z-10" />
            </button>

            {/* Charging History */}
            <button
              onClick={() => setLocation("/history")}
              className="w-full p-4 bg-black/40 backdrop-blur-md border border-white/5 rounded-3xl flex justify-between items-center hover:bg-white/5 hover:border-white/10 transition-all shadow-lg group relative overflow-hidden"
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all">
                  <Clock size={20} className="text-emerald-400" />
                </div>
                <span className="font-bold text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors">Charging History</span>
              </div>
              <ChevronRight className="text-zinc-600 group-hover:text-emerald-400 transition-all group-hover:translate-x-1 relative z-10" />
            </button>
          </div>

          {/* Vehicle Section */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3 px-2">
              Current Vehicle
            </h3>
            <div className="p-4 bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-3xl flex justify-between items-center shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-black/60 flex items-center justify-center border border-white/10 shadow-inner group-hover:border-primary/30 transition-colors">
                  <Car size={20} className="text-zinc-400 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  {vehicleLoading ? (
                    <>
                      <div className="h-5 w-24 bg-zinc-800 animate-pulse rounded mb-1.5"></div>
                      <div className="h-3 w-16 bg-zinc-800 animate-pulse rounded"></div>
                    </>
                  ) : (
                    <>
                      <div className="font-bold text-lg tracking-tight text-white">{currentVehicle?.name || "Select Vehicle"}</div>
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                        {currentVehicle?.type || "Unknown"}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="font-bold text-primary hover:text-orange-400 hover:bg-orange-500/10 rounded-xl px-4 transition-all"
                onClick={() => setLocation("/vehicles")}
              >
                Change
              </Button>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3 px-2 pt-2">
              Preferences
            </h3>

            <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden shadow-lg">
              <div className="flex justify-between items-center p-5 border-b border-white/5 hover:bg-white/5 transition-colors">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5">
                    <Settings size={18} className="text-zinc-400" />
                  </div>
                  <div>
                    <div className="font-bold tracking-tight text-white text-sm">Push Notifications</div>
                    <div className="text-[11px] font-medium text-zinc-500 mt-0.5">
                      Real-time station updates
                    </div>
                  </div>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={handleNotificationToggle}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              {/* Privacy & Data */}
              <div className="flex justify-between items-center p-5 opacity-50 cursor-not-allowed">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5">
                    <Shield size={18} className="text-zinc-500" />
                  </div>
                  <span className="font-bold tracking-tight text-white text-sm">Privacy & Data</span>
                </div>
                <ChevronRight size={18} className="text-zinc-700" />
              </div>
            </div>

            {notificationError && (
              <div className="flex gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mt-4 max-w-sm">
                <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-red-400 leading-relaxed">{notificationError}</p>
              </div>
            )}
          </div>

          <div className="pt-6 pb-4">
            <Button
              className="w-full h-14 rounded-2xl font-bold tracking-widest uppercase text-xs bg-black text-red-400 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-all shadow-lg gap-2"
              onClick={handleLogout}
            >
              <LogOut size={16} /> Sign Out
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
