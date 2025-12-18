import { Link, useLocation } from "wouter";
import { Home, Map as MapIcon, Zap, Car, Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export default function MobileLayout({ children, showNav = true }: MobileLayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Car, label: "Vehicle", path: "/my-vehicle" },
    { icon: Zap, label: "Find", path: "/recommendations" },
    { icon: Wallet, label: "Wallet", path: "/wallet" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center bg-zinc-950">
      <div className="w-full max-w-md h-screen relative flex flex-col bg-background shadow-2xl overflow-hidden border-x border-zinc-900">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-24">
          {children}
        </main>

        {/* Bottom Navigation */}
        {showNav && (
          <nav className="absolute bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-xl border-t border-white/5 px-6 flex justify-between items-center z-50">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path} className="flex flex-col items-center gap-1 group w-14 sm:w-16">
                  <div className={cn(
                    "p-2 rounded-full transition-all duration-300",
                    isActive ? "bg-primary/10 text-primary" : "text-zinc-500 group-hover:text-zinc-300"
                  )}>
                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium transition-colors",
                    isActive ? "text-primary" : "text-zinc-600"
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
