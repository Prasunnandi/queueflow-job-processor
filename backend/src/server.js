import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { initialJobs, initialQueueStats } from './data.js';

const app = express();
const PORT = process.env.PORT || 5004;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

let jobs = [...initialJobs];
let stats = { ...initialQueueStats };

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'QueueFlow Distributed Task Queue & Worker Engine',
    version: '1.0.0'
  });
});

// Queue Metrics Summary
app.get('/api/v1/queues/stats', (req, res) => {
  const queued = jobs.filter(j => j.status === 'QUEUED').length;
  const processing = jobs.filter(j => j.status === 'PROCESSING').length;
  const completed = jobs.filter(j => j.status === 'COMPLETED').length;
  const retrying = jobs.filter(j => j.status === 'FAILED_RETRYING').length;
  const deadLetter = jobs.filter(j => j.status === 'DEAD_LETTER').length;

  res.json({
    ...stats,
    activeQueuesCount: 7,
    jobsQueued: queued,
    jobsProcessing: processing,
    jobsCompleted: completed,
    jobsRetrying: retrying,
    jobsDeadLetter: deadLetter
  });
});

// List all jobs (filter optional by queue or status)
app.get('/api/v1/jobs', (req, res) => {
  const { queue, status } = req.query;
  let filtered = [...jobs];
  if (queue) {
    filtered = filtered.filter(j => j.queueName.toLowerCase() === queue.toLowerCase());
  }
  if (status) {
    filtered = filtered.filter(j => j.status.toUpperCase() === status.toUpperCase());
  }
  res.json(filtered);
});

// Dispatch new job
app.post('/api/v1/jobs', (req, res) => {
  const { queueName, jobType, payloadSummary, priority, maxRetries } = req.body;
  const newJob = {
    id: `JOB-${Math.floor(1000 + Math.random() * 8999)}`,
    queueName: queueName || 'default-queue',
    jobType: jobType || 'generic-worker-task',
    payloadSummary: payloadSummary || 'Standard async background job',
    priority: priority || 'STANDARD',
    status: 'QUEUED',
    attempts: 0,
    maxRetries: Number(maxRetries) || 3,
    durationMs: 0,
    createdAt: new Date().toISOString(),
    completedAt: null,
    workerId: null,
    errorMessage: null,
    backoffDelaySec: 0
  };

  jobs.unshift(newJob);
  res.status(201).json(newJob);
});

// Retry / Replay job from Dead Letter Queue (DLQ)
app.post('/api/v1/jobs/:id/retry', (req, res) => {
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  job.status = 'QUEUED';
  job.attempts = 0;
  job.errorMessage = null;
  job.backoffDelaySec = 0;

  res.json({ message: `Job ${job.id} replayed into queue '${job.queueName}'`, job });
});

// Purge Dead Letter Queue
app.delete('/api/v1/queues/dlq/purge', (req, res) => {
  const countBefore = jobs.filter(j => j.status === 'DEAD_LETTER').length;
  jobs = jobs.filter(j => j.status !== 'DEAD_LETTER');
  res.json({ message: `Purged ${countBefore} dead-letter tasks.` });
});

app.listen(PORT, () => {
  console.log(`QueueFlow backend listening on port http://localhost:${PORT}`);
});
