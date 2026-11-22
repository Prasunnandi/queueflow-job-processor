import React from 'react';
import { 
  Layers, 
  AlertOctagon, 
  Cpu, 
  Server, 
  Activity, 
  Send, 
  RotateCcw,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'jobs', label: 'Distributed Queue Jobs', icon: Layers, badge: 'Active' },
    { id: 'dlq', label: 'Dead Letter Queue (DLQ)', icon: AlertOctagon, badge: '2 Dead' },
    { id: 'workers', label: 'Worker Pools & P99', icon: Cpu, badge: '16 Workers' }
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand */}
        <div className="h-16 px-6 flex items-center space-x-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold shadow-inner">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
              QueueFlow
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                BullMQ
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">Distributed Job Broker</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 px-3 py-2 uppercase tracking-wider">
            Queue Infrastructure
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30 shadow-sm' 
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                    isActive ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <Activity className="w-4 h-4 text-teal-400" />
          <span>Throughput: 285 ops/sec</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500">
          Redis 7.2 Cluster • Kaggle Queue Benchmark
        </div>
      </div>
    </aside>
  );
}
