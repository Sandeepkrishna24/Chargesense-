import { Link, useLocation } from "wouter";
import { Home, Zap, Car, Wallet, User, Map as MapIcon, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

interface MobileLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export default function MobileLayout({
  children,
  showNav = true,
}: MobileLayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { icon: Home,   label: "Home",    path: "/home" },
    { icon: Car,    label: "Vehicle", path: "/my-vehicle" },
    { icon: MapIcon,label: "Map",     path: "/map" },
    { icon: Wallet, label: "Wallet",  path: "/wallet" },
    { icon: User,   label: "Profile", path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-black flex justify-center text-foreground">
      {/* APP CONTAINER */}
      <div className="w-full max-w-md h-screen flex flex-col bg-background border-x border-zinc-900/40 relative">

        {/* MAIN CONTENT (SCROLLABLE) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-20">
          {children}
        </main>
      </div>

      {/* BOTTOM NAVIGATION — PORTAL */}
      {showNav &&
        createPortal(
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-[9999]">
            {/* Glass bar */}
            <div className="mx-3 mb-3 bg-zinc-900/80 backdrop-blur-2xl border border-white/8 rounded-3xl px-2 py-2 flex justify-between items-center shadow-[0_-4px_30px_rgba(0,0,0,0.4)]">
              {navItems.map((item) => {
                const isActive = location === item.path;

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="relative flex-1 flex flex-col items-center gap-0.5 group"
                  >
                    {/* Active pill background */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-primary/10 rounded-2xl"
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      />
                    )}

                    {/* Icon */}
                    <div className="relative z-10 p-2 rounded-xl transition-all duration-300">
                      {isActive ? (
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <item.icon
                            size={22}
                            strokeWidth={2.5}
                            className="text-primary drop-shadow-[0_0_8px_rgba(255,165,0,0.8)]"
                          />
                        </motion.div>
                      ) : (
                        <item.icon
                          size={22}
                          strokeWidth={1.8}
                          className="text-zinc-500 group-hover:text-zinc-300 transition-colors duration-200"
                        />
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className={cn(
                        "relative z-10 text-[9px] font-bold tracking-wide transition-colors duration-200",
                        isActive ? "text-primary" : "text-zinc-600 group-hover:text-zinc-400"
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>,
          document.body
        )}
    </div>
  );
}
