import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import JobQueueDashboard from './pages/JobQueueDashboard';
import DeadLetterInspector from './pages/DeadLetterInspector';
import WorkerPoolAnalytics from './pages/WorkerPoolAnalytics';
import { fetchJobs, fetchQueueStats, retryJob, purgeDlq, dispatchNewJob, fallbackJobs } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState(fallbackJobs);
  const [stats, setStats] = useState({
    totalJobsProcessed: 14820,
    activeWorkersCount: 16,
    throughputPerSecond: 285,
    p95LatencyMs: 240,
    p99LatencyMs: 820,
    jobsQueued: 1,
    jobsProcessing: 1,
    jobsCompleted: 3,
    jobsRetrying: 1,
    jobsDeadLetter: 2
  });

  const loadData = async () => {
    const j = await fetchJobs();
    if (j && j.length) setJobs(j);
    const s = await fetchQueueStats();
    if (s) setStats(s);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDispatch = async (jobPayload) => {
    const created = await dispatchNewJob(jobPayload);
    setJobs(prev => [created, ...prev]);
  };

  const handleRetryJob = async (jobId) => {
    await retryJob(jobId);
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return { ...j, status: 'QUEUED', attempts: 0, errorMessage: null };
      }
      return j;
    }));
  };

  const handlePurgeDlq = async () => {
    await purgeDlq();
    setJobs(prev => prev.filter(j => j.status !== 'DEAD_LETTER'));
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar stats={stats} onRefresh={loadData} />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'jobs' && (
              <JobQueueDashboard 
                jobs={jobs} 
                stats={stats} 
                onDispatch={handleDispatch} 
                onNavigateDlq={() => setActiveTab('dlq')} 
              />
            )}
            {activeTab === 'dlq' && (
              <DeadLetterInspector 
                jobs={jobs} 
                onRetryJob={handleRetryJob} 
                onPurgeDlq={handlePurgeDlq} 
              />
            )}
            {activeTab === 'workers' && (
              <WorkerPoolAnalytics 
                stats={stats} 
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
