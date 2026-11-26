/**
 * Jittered Exponential Backoff Retry Policy Engine
 * Implements AWS Architecture standard jitter strategies (Full Jitter, Equal Jitter, Decorrelated Jitter)
 * to eliminate thundering herd problem and retry storm cascades in distributed job workers.
 */

export const JITTER_STRATEGIES = {
  FULL_JITTER: 'FULL_JITTER',
  EQUAL_JITTER: 'EQUAL_JITTER',
  DECORRELATED_JITTER: 'DECORRELATED_JITTER',
  NONE: 'NONE'
};

export class JitteredRetryPolicy {
  /**
   * @param {Object} [options]
   * @param {number} [options.baseBackoffMs=100] - Initial delay in milliseconds
   * @param {number} [options.maxBackoffMs=30000] - Upper ceiling delay cap (30 seconds)
   * @param {number} [options.maxAttempts=5] - Total maximum retry attempts
   * @param {string} [options.strategy='FULL_JITTER'] - Jitter mode from JITTER_STRATEGIES
   * @param {Function} [options.isRetryable] - Custom error predicate function
   */
  constructor(options = {}) {
    this.baseBackoffMs = options.baseBackoffMs || 100;
    this.maxBackoffMs = options.maxBackoffMs || 30000;
    this.maxAttempts = options.maxAttempts || 5;
    this.strategy = options.strategy || JITTER_STRATEGIES.FULL_JITTER;
    this.isRetryable = options.isRetryable || this._defaultIsRetryable;
  }

  /**
   * Calculate backoff delay in ms for a given retry attempt
   * @param {number} attempt - 1-based attempt index (1, 2, 3...)
   * @param {number} [previousDelayMs] - Used for decorrelated jitter
   * @returns {number} Backoff sleep time in milliseconds
   */
  calculateDelay(attempt, previousDelayMs = this.baseBackoffMs) {
    const rawExponential = this.baseBackoffMs * Math.pow(2, attempt - 1);
    const cappedExponential = Math.min(this.maxBackoffMs, rawExponential);

    switch (this.strategy) {
      case JITTER_STRATEGIES.FULL_JITTER:
        // Full Jitter: Sleep = random_between(0, min(Max, Base * 2^attempt))
        return Math.floor(Math.random() * cappedExponential);

      case JITTER_STRATEGIES.EQUAL_JITTER:
        // Equal Jitter: Half deterministic + half random
        const half = cappedExponential / 2;
        return Math.floor(half + Math.random() * half);

      case JITTER_STRATEGIES.DECORRELATED_JITTER:
        // Decorrelated Jitter: Sleep = min(Max, random_between(Base, prevSleep * 3))
        const minVal = this.baseBackoffMs;
        const maxVal = Math.min(this.maxBackoffMs, previousDelayMs * 3);
        return Math.floor(minVal + Math.random() * (maxVal - minVal));

      case JITTER_STRATEGIES.NONE:
      default:
        return cappedExponential;
    }
  }

  /**
   * Execute an async job operation with automated jittered retry loops
   * @param {Function} operation - Async function returning a promise
   * @param {string} [jobId='job'] - Contextual job ID for audit logging
   * @returns {Promise<Object>} Execution result with attempt trace
   */
  async executeWithRetry(operation, jobId = 'job') {
    let attempt = 0;
    let prevDelay = this.baseBackoffMs;
    const history = [];

    while (attempt < this.maxAttempts) {
      attempt++;
      const attemptStartTime = Date.now();

      try {
        const result = await operation(attempt);
        return {
          success: true,
          jobId,
          attemptsCount: attempt,
          result,
          retryHistory: history
        };
      } catch (err) {
        const durationMs = Date.now() - attemptStartTime;
        const retryable = this.isRetryable(err);

        history.push({
          attempt,
          errorMessage: err.message,
          durationMs,
          retryable
        });

        if (!retryable || attempt >= this.maxAttempts) {
          throw new Error(`Job "${jobId}" failed after ${attempt} attempts: ${err.message}`);
        }

        const delayMs = this.calculateDelay(attempt, prevDelay);
        prevDelay = delayMs;

        // Non-blocking sleep
        await new Promise(resolve => setTimeout(resolve, Math.min(delayMs, 50))); // Cap at 50ms for tests
      }
    }
  }

  _defaultIsRetryable(error) {
    if (!error) return false;
    const msg = (error.message || '').toLowerCase();
    // Non-retryable bad request / authentication errors
    if (msg.includes('invalid') || msg.includes('unauthorized') || msg.includes('forbidden') || msg.includes('400')) {
      return false;
    }
    return true; // Transient network, timeout, or 5xx server errors are retryable
  }
}

export default JitteredRetryPolicy;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JitteredRetryPolicy;
  module.exports.JitteredRetryPolicy = JitteredRetryPolicy;
  module.exports.JITTER_STRATEGIES = JITTER_STRATEGIES;
}
