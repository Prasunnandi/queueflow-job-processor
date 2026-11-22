// QueueFlow API Service

const API_BASE = 'http://localhost:5004';

export const fallbackJobs = [
  {
    id: "JOB-9901",
    queueName: "critical-tasks",
    jobType: "payment-webhooks",
    payloadSummary: "Stripe invoice.payment_succeeded ($4500)",
    priority: "CRITICAL",
    status: "COMPLETED",
    attempts: 1,
    maxRetries: 5,
    durationMs: 142,
    createdAt: "2026-11-22T17:10:00Z",
    completedAt: "2026-11-22T17:10:00.142Z",
    workerId: "worker-pool-01",
    errorMessage: null,
    backoffDelaySec: 0
  },
  {
    id: "JOB-9902",
    queueName: "media-transcode",
    jobType: "video-hls-render",
    payloadSummary: "4K H.265 Transcode segment #14",
    priority: "STANDARD",
    status: "PROCESSING",
    attempts: 1,
    maxRetries: 3,
    durationMs: 4850,
    createdAt: "2026-11-22T17:10:05Z",
    completedAt: null,
    workerId: "worker-pool-03",
    errorMessage: null,
    backoffDelaySec: 0
  },
  {
    id: "JOB-9903",
    queueName: "reporting",
    jobType: "analytics-pdf-export",
    payloadSummary: "Monthly Board Financial Summary PDF",
    priority: "HIGH",
    status: "COMPLETED",
    attempts: 1,
    maxRetries: 3,
    durationMs: 890,
    createdAt: "2026-11-22T17:10:12Z",
    completedAt: "2026-11-22T17:10:12.890Z",
    workerId: "worker-pool-02",
    errorMessage: null,
    backoffDelaySec: 0
  },
  {
    id: "JOB-9904",
    queueName: "notifications",
    jobType: "sms-otp-dispatch",
    payloadSummary: "Twilio Auth OTP Gateway +1-415-555",
    priority: "CRITICAL",
    status: "DEAD_LETTER",
    attempts: 5,
    maxRetries: 5,
    durationMs: 0,
    createdAt: "2026-11-22T17:08:00Z",
    completedAt: "2026-11-22T17:09:40Z",
    workerId: "worker-pool-04",
    errorMessage: "HTTP 504 Gateway Timeout upstream provider",
    backoffDelaySec: 64
  },
  {
    id: "JOB-9905",
    queueName: "data-sync",
    jobType: "crm-sync-hubspot",
    payloadSummary: "Sync 1500 accounts to HubSpot API",
    priority: "STANDARD",
    status: "FAILED_RETRYING",
    attempts: 2,
    maxRetries: 4,
    durationMs: 310,
    createdAt: "2026-11-22T17:10:20Z",
    completedAt: null,
    workerId: "worker-pool-01",
    errorMessage: "Rate limit 429 Too Many Requests; Exponential backoff 16s",
    backoffDelaySec: 16
  },
  {
    id: "JOB-9906",
    queueName: "search-indexing",
    jobType: "elastic-bulk-index",
    payloadSummary: "Bulk reindex 50k SKU search vectors",
    priority: "LOW",
    status: "QUEUED",
    attempts: 0,
    maxRetries: 3,
    durationMs: 0,
    createdAt: "2026-11-22T17:10:25Z",
    completedAt: null,
    workerId: null,
    errorMessage: null,
    backoffDelaySec: 0
  },
  {
    id: "JOB-9907",
    queueName: "emails",
    jobType: "transactional-receipt",
    payloadSummary: "Sendgrid Order #8801 confirmation",
    priority: "HIGH",
    status: "COMPLETED",
    attempts: 1,
    maxRetries: 3,
    durationMs: 95,
    createdAt: "2026-11-22T17:10:28Z",
    completedAt: "2026-11-22T17:10:28.095Z",
    workerId: "worker-pool-02",
    errorMessage: null,
    backoffDelaySec: 0
  },
  {
    id: "JOB-9908",
    queueName: "webhooks",
    jobType: "partner-event-dispatch",
    payloadSummary: "Partner Event: order.fulfilled webhook",
    priority: "HIGH",
    status: "DEAD_LETTER",
    attempts: 5,
    maxRetries: 5,
    durationMs: 0,
    createdAt: "2026-11-22T17:05:00Z",
    completedAt: "2026-11-22T17:07:30Z",
    workerId: "worker-pool-03",
    errorMessage: "ECONNREFUSED partner endpoint unreachable after 5 attempts",
    backoffDelaySec: 128
  }
];

export async function fetchJobs() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/jobs`);
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (e) {
    return fallbackJobs;
  }
}

export async function fetchQueueStats() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/queues/stats`);
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (e) {
    return {
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
    };
  }
}

export async function retryJob(jobId) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/jobs/${jobId}/retry`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Retry error');
    return await res.json();
  } catch (e) {
    return { success: true };
  }
}

export async function purgeDlq() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/queues/dlq/purge`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Purge error');
    return await res.json();
  } catch (e) {
    return { success: true };
  }
}

export async function dispatchNewJob(jobData) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });
    if (!res.ok) throw new Error('Dispatch error');
    return await res.json();
  } catch (e) {
    return {
      id: `JOB-${Math.floor(1000 + Math.random() * 8999)}`,
      ...jobData,
      status: 'QUEUED',
      attempts: 0,
      durationMs: 0,
      createdAt: new Date().toISOString()
    };
  }
}
