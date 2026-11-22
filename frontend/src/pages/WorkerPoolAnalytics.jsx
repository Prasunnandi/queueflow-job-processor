import React from 'react';
import { 
  Cpu, 
  Server, 
  Activity, 
  CheckCircle2, 
  BarChart3, 
  Layers 
} from 'lucide-react';

export default function WorkerPoolAnalytics({ stats }) {
  const workerNodes = [
    { id: 'worker-pool-01', concurrency: 8, activeTasks: 3, memoryUsage: '142 MB', status: 'HEALTHY' },
    { id: 'worker-pool-02', concurrency: 8, activeTasks: 4, memoryUsage: '188 MB', status: 'HEALTHY' },
    { id: 'worker-pool-03', concurrency: 12, activeTasks: 7, memoryUsage: '412 MB', status: 'HEAVY_LOAD' },
    { id: 'worker-pool-04', concurrency: 8, activeTasks: 2, memoryUsage: '126 MB', status: 'HEALTHY' }
  ];

  const queueDistribution = [
    { name: 'critical-tasks', count: 1840, share: 42, color: 'bg-rose-500' },
    { name: 'media-transcode', count: 420, share: 24, color: 'bg-teal-500' },
    { name: 'notifications', count: 1250, share: 18, color: 'bg-blue-500' },
    { name: 'reporting', count: 320, share: 16, color: 'bg-amber-500' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-teal-400" />
          Worker Pool Concurrency & Performance Analytics
        </h2>
        <p className="text-xs text-slate-400">
          Cluster nodes, thread pool allocation, and queue execution telemetry.
        </p>
      </div>

      {/* Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-teal-400" />
            Active Worker Thread Pools
          </h3>

          <div className="space-y-3">
            {workerNodes.map(w => (
              <div key={w.id} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <div className="text-white font-bold">{w.id}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Concurrency: {w.concurrency} threads • Active: {w.activeTasks}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-teal-400 font-bold">{w.memoryUsage}</div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    w.status === 'HEALTHY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {w.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" />
            Queue Throughput Distribution
          </h3>

          <div className="space-y-4 pt-1">
            {queueDistribution.map(q => (
              <div key={q.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium font-mono">{q.name}</span>
                  <span className="text-slate-200 font-mono font-bold">{q.count.toLocaleString()} ops ({q.share}%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className={`h-full ${q.color} rounded-full`} style={{ width: `${q.share}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
