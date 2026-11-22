import React from 'react';
import { Bell, Search, Server, Cpu, Activity, RefreshCw } from 'lucide-react';

export default function Navbar({ stats, onRefresh }) {
  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Jobs by ID, Queue, Payload, Worker..."
            className="w-80 bg-slate-800/80 border border-slate-700/60 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded border border-slate-700/40">
          <Server className="w-3.5 h-3.5 text-teal-400" />
          <span>Cluster: US-East-Redis-Primary</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-2.5 py-1 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 font-bold">
            {stats?.jobsProcessing || 1} Processing
          </div>
          <div className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold">
            {stats?.jobsQueued || 1} Queued
          </div>
          <div className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
            {stats?.jobsDeadLetter || 2} DLQ
          </div>
        </div>

        <div className="h-7 w-[1px] bg-slate-800"></div>

        <button 
          onClick={onRefresh}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Refresh Queues"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 pl-2">
          <div className="w-8 h-8 rounded-full bg-teal-600/30 border border-teal-500/50 flex items-center justify-center text-xs font-bold text-teal-300">
            SRE
          </div>
          <div className="text-left text-xs">
            <div className="font-semibold text-slate-200">DevOps Engine</div>
            <div className="text-[10px] text-slate-400">Worker Pool Supervisor</div>
          </div>
        </div>
      </div>
    </header>
  );
}
