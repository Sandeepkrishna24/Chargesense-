import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { User, Settings, LogOut, ChevronRight, Car, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/layout/MobileLayout";
import { MOCK_VEHICLES } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const [vehicleId, setVehicleId] = useState<string>('v1');
  const [notifications, setNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState({ name: '', email: '' });

  useEffect(() => {
    const vId = localStorage.getItem('selectedVehicleId') || 'v1';
    setVehicleId(vId);

    const name = localStorage.getItem('userName') || user?.user_metadata?.name || '';
    const email = localStorage.getItem('userEmail') || user?.email || '';
    setUserProfile({ name, email });

    // Check if notifications are already enabled
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotifications(true);
    }
  }, [user]);

  const currentVehicle = MOCK_VEHICLES.find(v => v.id === vehicleId);

  const handleNotificationToggle = async (checked: boolean) => {
    if (!checked) {
      setNotifications(false);
      setNotificationError(null);
      localStorage.setItem('notificationsEnabled', 'false');
      return;
    }

    // Request notification permission
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotifications(true);
        setNotificationError(null);
        localStorage.setItem('notificationsEnabled', 'true');
        toast({
          title: "Notifications Enabled",
          description: "You'll receive real-time updates on charging stations.",
        });
      } else if (Notification.permission === 'denied') {
        setNotifications(false);
        setNotificationError('Notification permission denied. Please enable it in your browser settings.');
        localStorage.setItem('notificationsEnabled', 'false');
        toast({
          variant: "destructive",
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings.",
        });
      } else {
        // Request permission
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            setNotifications(true);
            setNotificationError(null);
            localStorage.setItem('notificationsEnabled', 'true');
            // Send a test notification
            new Notification('ChargeSense', {
              body: 'Real-time charging station updates enabled!',
              icon: '⚡',
            });
            toast({
              title: "Notifications Enabled",
              description: "You'll receive real-time updates on charging stations.",
            });
          } else {
            setNotifications(false);
            setNotificationError('Notification permission denied.');
            localStorage.setItem('notificationsEnabled', 'false');
          }
        } catch (error) {
          setNotifications(false);
          setNotificationError('Failed to enable notifications.');
          localStorage.setItem('notificationsEnabled', 'false');
        }
      }
    } else {
      setNotificationError('Your browser does not support notifications.');
      localStorage.setItem('notificationsEnabled', 'false');
    }
  };

  const handleLogout = async () => {
    await signOut();
    setLocation('/');
  };

  const displayName = userProfile.name || "User";
  const displayEmail = userProfile.email || "No email provided";
  const displayInitial = (userProfile.name || userProfile.email || "U").charAt(0).toUpperCase();

  return (
    <MobileLayout>
      <div className="p-6 space-y-8">
        <header>
          <h1 className="text-2xl font-bold mb-1">My Profile</h1>
          <p className="text-zinc-500 text-sm">Manage your account and settings</p>
        </header>

        <div className="flex items-center gap-4 p-4 glass-card">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-primary">
            <span className="text-2xl font-bold text-primary">{displayInitial}</span>
          </div>
          <div className="overflow-hidden">
            <h2 className="text-lg font-bold truncate">{displayName}</h2>
            <p className="text-zinc-400 text-sm truncate">{displayEmail}</p>
          </div>
        </div>

        <div>
          <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-3">Current Vehicle</h3>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                <Car size={18} className="text-zinc-400" />
              </div>
              <div>
                <div className="font-bold">{currentVehicle?.name || "Unknown Vehicle"}</div>
                <div className="text-xs text-zinc-500 capitalize">{currentVehicle?.type}</div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setLocation('/vehicles')} className="text-primary hover:text-primary hover:bg-primary/10">
              Change
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-3">Preferences</h3>
          <div className="space-y-1">
            <div className="flex items-center justify-between p-4 border-b border-zinc-900">
              <div className="flex items-center gap-3">
                <Settings size={18} className="text-zinc-500" />
                <div className="flex flex-col gap-1">
                  <span>Push Notifications</span>
                  <span className="text-xs text-zinc-500">Real-time station updates</span>
                </div>
              </div>
              <Switch checked={notifications} onCheckedChange={handleNotificationToggle} />
            </div>
            {notificationError && (
              <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-800/30 rounded-lg mx-3 my-2">
                <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-300">{notificationError}</p>
              </div>
            )}
            <div className="flex items-center justify-between p-4 border-b border-zinc-900">
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-zinc-500" />
                <span>Privacy & Data</span>
              </div>
              <ChevronRight size={18} className="text-zinc-700" />
            </div>
          </div>
        </div>

        <Button 
          variant="destructive" 
          className="w-full h-14 px-4 text-base font-medium"
          onClick={handleLogout}
        >
          <LogOut size={18} className="mr-2" /> Sign Out
        </Button>

      </div>
    </MobileLayout>
  );
}
