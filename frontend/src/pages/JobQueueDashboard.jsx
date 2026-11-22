import React, { useState } from 'react';
import { 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  AlertOctagon, 
  Cpu, 
  Server, 
  Play, 
  RotateCcw,
  Zap,
  Plus
} from 'lucide-react';

export default function JobQueueDashboard({ jobs, stats, onDispatch, onNavigateDlq }) {
  const [selectedQueue, setSelectedQueue] = useState('ALL');
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [newJobPayload, setNewJobPayload] = useState({
    queueName: 'critical-tasks',
    jobType: 'webhook-delivery',
    payloadSummary: 'Webhook event: user.subscribed ($120/yr)',
    priority: 'HIGH',
    maxRetries: 3
  });

  const filteredJobs = selectedQueue === 'ALL' 
    ? jobs 
    : jobs.filter(j => j.queueName.toLowerCase() === selectedQueue.toLowerCase());

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
            COMPLETED
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30 animate-pulse">
            <Play className="w-3 h-3 mr-1 text-teal-400" />
            PROCESSING
          </span>
        );
      case 'FAILED_RETRYING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <RotateCcw className="w-3 h-3 mr-1 text-amber-400" />
            RETRYING
          </span>
        );
      case 'DEAD_LETTER':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <AlertOctagon className="w-3 h-3 mr-1 text-rose-400" />
            DEAD LETTER
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-slate-800 text-slate-300 border border-slate-700">
            <Clock className="w-3 h-3 mr-1 text-slate-400" />
            QUEUED
          </span>
        );
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">P0 CRITICAL</span>;
      case 'HIGH':
        return <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">P1 HIGH</span>;
      case 'STANDARD':
        return <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">P2 STANDARD</span>;
      default:
        return <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">P3 LOW</span>;
    }
  };

  const handleCreateJob = (e) => {
    e.preventDefault();
    onDispatch(newJobPayload);
    setShowDispatchModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-400" />
            Distributed Job Queue & Worker Concurrency Hub
          </h2>
          <p className="text-xs text-slate-400">
            Real-time BullMQ task queues, priority scheduling, concurrency pools, and retry state machine.
          </p>
        </div>

        <button
          onClick={() => setShowDispatchModal(true)}
          className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-lg shadow-teal-950/50"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch New Task</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-mono text-slate-400">Total Processed (24h)</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">14,820</div>
          <div className="text-[11px] text-teal-400 mt-1 flex items-center gap-1">
            <Zap className="w-3 h-3" /> 285 tasks/sec throughput
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-mono text-slate-400">Active Concurrency Workers</div>
          <div className="text-2xl font-bold text-teal-400 font-mono mt-1">16 Workers</div>
          <div className="text-[11px] text-slate-400 mt-1">Across 4 cluster nodes</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-mono text-slate-400">P95 / P99 Latency</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">240ms / 820ms</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> SLA compliant (&lt;1s)
          </div>
        </div>

        <div 
          onClick={onNavigateDlq}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 cursor-pointer hover:border-rose-500/50 transition-colors"
        >
          <div className="text-xs font-mono text-slate-400">Dead Letter Queue (DLQ)</div>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-1">{stats?.jobsDeadLetter || 2} Jobs</div>
          <div className="text-[11px] text-rose-400/90 mt-1 flex items-center gap-1">
            <AlertOctagon className="w-3 h-3" /> Click to Inspect & Replay
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-teal-400" />
            Live Distributed Job Stream
          </h3>

          {/* Queue Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-slate-400">Filter Queue:</span>
            <select
              value={selectedQueue}
              onChange={(e) => setSelectedQueue(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
            >
              <option value="ALL">All Queues</option>
              <option value="critical-tasks">critical-tasks</option>
              <option value="media-transcode">media-transcode</option>
              <option value="reporting">reporting</option>
              <option value="notifications">notifications</option>
              <option value="data-sync">data-sync</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 font-mono text-[11px] text-slate-400 uppercase">
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">Queue</th>
                <th className="py-3 px-4">Task Payload</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Attempts</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4 text-right">Worker ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredJobs.map((j) => (
                <tr key={j.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{j.id}</td>
                  <td className="py-3 px-4 text-teal-300 font-semibold">{j.queueName}</td>
                  <td className="py-3 px-4 text-slate-300 font-sans max-w-xs truncate">
                    {j.payloadSummary}
                  </td>
                  <td className="py-3 px-4">{getPriorityBadge(j.priority)}</td>
                  <td className="py-3 px-4">{getStatusBadge(j.status)}</td>
                  <td className="py-3 px-4 text-slate-300">
                    {j.attempts} / {j.maxRetries}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {j.durationMs > 0 ? `${j.durationMs}ms` : j.backoffDelaySec > 0 ? `backoff ${j.backoffDelaySec}s` : '—'}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">
                    {j.workerId || 'pool-pending'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-400" />
              Dispatch Job to Cluster Queue
            </h3>

            <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Queue Name</label>
                <select
                  value={newJobPayload.queueName}
                  onChange={(e) => setNewJobPayload({ ...newJobPayload, queueName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                >
                  <option value="critical-tasks">critical-tasks</option>
                  <option value="media-transcode">media-transcode</option>
                  <option value="reporting">reporting</option>
                  <option value="data-sync">data-sync</option>
                  <option value="webhooks">webhooks</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Job Type Identifier</label>
                <input
                  type="text"
                  value={newJobPayload.jobType}
                  onChange={(e) => setNewJobPayload({ ...newJobPayload, jobType: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Payload Summary</label>
                <input
                  type="text"
                  value={newJobPayload.payloadSummary}
                  onChange={(e) => setNewJobPayload({ ...newJobPayload, payloadSummary: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Priority</label>
                  <select
                    value={newJobPayload.priority}
                    onChange={(e) => setNewJobPayload({ ...newJobPayload, priority: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  >
                    <option value="CRITICAL">CRITICAL (P0)</option>
                    <option value="HIGH">HIGH (P1)</option>
                    <option value="STANDARD">STANDARD (P2)</option>
                    <option value="LOW">LOW (P3)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Max Retries</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newJobPayload.maxRetries}
                    onChange={(e) => setNewJobPayload({ ...newJobPayload, maxRetries: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold"
                >
                  Dispatch Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
