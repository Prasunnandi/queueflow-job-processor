import React from 'react';
import { 
  AlertOctagon, 
  RotateCcw, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Clock, 
  FileCode,
  Zap
} from 'lucide-react';

export default function DeadLetterInspector({ jobs, onRetryJob, onPurgeDlq }) {
  const dlqJobs = jobs.filter(j => j.status === 'DEAD_LETTER');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            Dead Letter Queue (DLQ) Inspector & Replay Hub
          </h2>
          <p className="text-xs text-slate-400">
            Audit exhausted tasks, analyze upstream exception stack traces, and execute non-destructive replays.
          </p>
        </div>

        {dlqJobs.length > 0 && (
          <button
            onClick={onPurgeDlq}
            className="px-3.5 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center space-x-1.5"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Purge DLQ Storage</span>
          </button>
        )}
      </div>

      {dlqJobs.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Dead Letter Queue is Empty</h3>
          <p className="text-xs text-slate-400 mt-1">All cluster worker jobs are executing within healthy retry thresholds.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dlqJobs.map((job) => (
            <div 
              key={job.id}
              className="bg-slate-900 border border-rose-500/30 rounded-xl p-5 shadow-sm space-y-4 bg-gradient-to-b from-slate-900 to-rose-950/10"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    {job.id}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Queue: {job.queueName}
                  </span>
                  <h3 className="text-sm font-bold text-white">{job.jobType}</h3>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono text-slate-400">
                    Exhausted: <strong className="text-rose-400">{job.attempts} of {job.maxRetries} Retries</strong>
                  </span>

                  <button
                    onClick={() => onRetryJob(job.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition-all flex items-center space-x-1.5 shadow"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Replay to Active Queue</span>
                  </button>
                </div>
              </div>

              {/* Task Details & Error Trace */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Payload Summary</span>
                  <span className="text-white font-sans">{job.payloadSummary}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Failed Worker Node</span>
                  <span className="text-slate-300">{job.workerId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Max Backoff Delay</span>
                  <span className="text-amber-400 font-bold">{job.backoffDelaySec}s exponential delay</span>
                </div>
              </div>

              {/* Stack Trace Box */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 font-mono text-xs text-rose-300 flex items-start space-x-2">
                <FileCode className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase mb-0.5">Exception Message</span>
                  <code>{job.errorMessage}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
