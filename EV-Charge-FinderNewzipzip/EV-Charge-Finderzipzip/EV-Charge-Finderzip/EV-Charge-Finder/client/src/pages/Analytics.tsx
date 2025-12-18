import { useState, useEffect } from "react";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Calendar, Zap, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import MobileLayout from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";

interface SessionData {
  id: string;
  date: string;
  kwh: number;
  cost: number;
  location: string;
  duration_mins: number;
}

export default function Analytics() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [history, setHistory] = useState<SessionData[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('chargingHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Aggregate data for chart
  const chartData = history.reduce((acc: any[], session) => {
    const date = new Date(session.date);
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const existing = acc.find(item => item.day === day);
    
    if (existing) {
      existing.kwh += session.kwh;
    } else {
      acc.push({ day, kwh: session.kwh });
    }
    return acc;
  }, []);

  const totalKwh = history.reduce((sum, item) => sum + item.kwh, 0);
  const totalCost = history.reduce((sum, item) => sum + item.cost, 0);

  const isEmpty = history.length === 0;

  return (
    <MobileLayout>
      <div className="p-6 space-y-8 min-h-screen">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Charging Stats</h1>
          <div className="text-sm text-zinc-500">History</div>
        </header>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 mb-2">
              <Zap size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold">No charging data yet</h3>
              <p className="text-zinc-500 text-sm mt-1 max-w-[250px]">
                Start your first charging session to see analytics and history here.
              </p>
            </div>
            <Link href="/home">
              <Button className="mt-4">Find a Charger</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Hero Chart */}
            <div className="h-64 w-full -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} onMouseMove={(state: any) => {
                  if (state.isTooltipActive) {
                    setActiveIndex(state.activeTooltipIndex);
                  } else {
                    setActiveIndex(null);
                  }
                }}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#666', fontSize: 12 }} 
                    dy={10}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="kwh" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === activeIndex ? '#00ff9d' : '#333'} 
                        className="transition-all duration-300"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-zinc-900/50 border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider mb-2">
                  <Zap size={14} /> Total Energy
                </div>
                <div className="text-3xl font-mono font-bold text-white">
                  {totalKwh.toFixed(1)}<span className="text-lg text-zinc-500">kWh</span>
                </div>
              </Card>
              
              <Card className="p-4 bg-zinc-900/50 border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider mb-2">
                  <TrendingUp size={14} /> Cost
                </div>
                <div className="text-3xl font-mono font-bold text-white">
                  ₹{totalCost.toFixed(0)}
                </div>
              </Card>
            </div>

            {/* History List */}
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-primary" /> Recent Sessions
              </h3>
              <div className="space-y-3">
                {history.slice().reverse().map((session, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold">
                         <Zap size={16} />
                       </div>
                       <div>
                         <div className="font-medium text-white">{session.location}</div>
                         <div className="text-xs text-zinc-500">{new Date(session.date).toLocaleDateString()} • {session.duration_mins} mins</div>
                       </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-primary">₹{session.cost}</div>
                      <div className="text-xs text-zinc-500">{session.kwh} kWh</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </MobileLayout>
  );
}
