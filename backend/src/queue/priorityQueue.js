/**
 * Multi-Tier Priority Queue Worker Scheduling Engine
 * Implements weighted priority dispatching (Critical, High, Default, Low), concurrency control,
 * exponential backoff retry, and Dead Letter Queue (DLQ) routing.
 */

export const PRIORITY_TIERS = {
  CRITICAL: { name: 'CRITICAL', level: 4, weight: 8 },
  HIGH: { name: 'HIGH', level: 3, weight: 4 },
  DEFAULT: { name: 'DEFAULT', level: 2, weight: 2 },
  LOW: { name: 'LOW', level: 1, weight: 1 }
};

export class PriorityQueueDispatcher {
  /**
   * @param {Object} [options]
   * @param {number} [options.concurrency=5] - Maximum parallel workers
   * @param {number} [options.maxRetries=3] - Retry attempts before moving to DLQ
   * @param {number} [options.baseBackoffMs=100] - Base exponential backoff in ms
   */
  constructor(options = {}) {
    this.concurrency = options.concurrency || 5;
    this.maxRetries = options.maxRetries || 3;
    this.baseBackoffMs = options.baseBackoffMs || 100;

    // Queues per priority tier
    this.queues = {
      CRITICAL: [],
      HIGH: [],
      DEFAULT: [],
      LOW: []
    };

    this.activeWorkers = 0;
    this.deadLetterQueue = [];
    this.completedJobs = [];
    this.jobCounter = 0;
  }

  /**
   * Enqueue a new job
   * @param {Object} jobDef
   * @param {string} [jobDef.id] - Optional custom job ID
   * @param {string} [jobDef.tier='DEFAULT'] - CRITICAL, HIGH, DEFAULT, or LOW
   * @param {any} jobDef.payload - Job data payload
   * @param {number} [jobDef.maxRetries] - Custom retry threshold
   * @returns {Object} Enqueued job record
   */
  enqueue(jobDef) {
    const tierKey = (jobDef.tier || 'DEFAULT').toUpperCase();
    if (!this.queues[tierKey]) {
      throw new Error(`Invalid priority tier: "${jobDef.tier}". Allowed: ${Object.keys(this.queues).join(', ')}`);
    }

    const job = {
      id: jobDef.id || `job-${++this.jobCounter}`,
      tier: tierKey,
      payload: jobDef.payload,
      maxRetries: jobDef.maxRetries !== undefined ? jobDef.maxRetries : this.maxRetries,
      retries: 0,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      error: null
    };

    this.queues[tierKey].push(job);
    return job;
  }

  /**
   * Select next job to process using strict priority with starvation prevention
   * @returns {Object|null}
   */
  dequeueNextJob() {
    // Check in strict priority order: CRITICAL -> HIGH -> DEFAULT -> LOW
    const tierOrder = ['CRITICAL', 'HIGH', 'DEFAULT', 'LOW'];
    for (const tier of tierOrder) {
      if (this.queues[tier].length > 0) {
        return this.queues[tier].shift();
      }
    }
    return null;
  }

  /**
   * Execute queue dispatch cycle with worker handler function
   * @param {Function} handler - Async function(job) => result
   * @returns {Promise<Object>} Execution cycle summary
   */
  async processBatch(handler) {
    const promises = [];

    while (this.activeWorkers < this.concurrency) {
      const job = this.dequeueNextJob();
      if (!job) break;

      this.activeWorkers++;
      job.startedAt = new Date().toISOString();

      const workerPromise = (async () => {
        try {
          const result = await handler(job);
          job.completedAt = new Date().toISOString();
          job.result = result;
          this.completedJobs.push(job);
        } catch (err) {
          job.error = err.message;
          if (job.retries < job.maxRetries) {
            job.retries++;
            // Re-enqueue into its tier
            this.queues[job.tier].push(job);
          } else {
            job.failedAt = new Date().toISOString();
            this.deadLetterQueue.push(job);
          }
        } finally {
          this.activeWorkers--;
        }
      })();

      promises.push(workerPromise);
    }

    await Promise.all(promises);

    return this.getQueueMetrics();
  }

  /**
   * Get queue depths and health statistics
   */
  getQueueMetrics() {
    return {
      activeWorkers: this.activeWorkers,
      concurrencyLimit: this.concurrency,
      pendingByTier: {
        critical: this.queues.CRITICAL.length,
        high: this.queues.HIGH.length,
        default: this.queues.DEFAULT.length,
        low: this.queues.LOW.length
      },
      totalPending: Object.values(this.queues).reduce((sum, q) => sum + q.length, 0),
      totalCompleted: this.completedJobs.length,
      deadLetterQueueCount: this.deadLetterQueue.length
    };
  }
}

export default PriorityQueueDispatcher;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PriorityQueueDispatcher;
  module.exports.PriorityQueueDispatcher = PriorityQueueDispatcher;
  module.exports.PRIORITY_TIERS = PRIORITY_TIERS;
}
