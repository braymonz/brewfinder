// Sliding window rate limiter for API requests
// Allows max N requests per second with immediate dispatch when capacity is available

type QueuedRequest<T> = {
	execute: () => Promise<T>;
	resolve: (value: T) => void;
	reject: (error: unknown) => void;
};

class RateLimiter {
	private readonly queue: QueuedRequest<unknown>[] = [];
	private readonly requestTimestamps: number[] = []; // Track when requests were dispatched
	private readonly maxRequestsPerSecond: number;
	private readonly windowMs = 1000;
	private processing = false;

	constructor(maxRequestsPerSecond: number) {
		this.maxRequestsPerSecond = maxRequestsPerSecond;
	}

	async execute<T>(fn: () => Promise<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			this.queue.push({
				execute: fn,
				resolve: resolve as (value: unknown) => void,
				reject,
			});
			this.processQueue();
		});
	}

	private async processQueue() {
		if (this.processing) return;

		this.processing = true;

		while (this.queue.length > 0) {
			// Clean up old timestamps (outside the 1-second window)
			const now = Date.now();
			while (
				this.requestTimestamps.length > 0 &&
				this.requestTimestamps[0] <= now - this.windowMs
			) {
				this.requestTimestamps.shift();
			}

			// Check if we have capacity
			if (this.requestTimestamps.length >= this.maxRequestsPerSecond) {
				// Wait until the oldest request falls outside the window
				const oldestTimestamp = this.requestTimestamps[0];
				const waitTime = Math.max(1, oldestTimestamp + this.windowMs - now);
				await this.sleep(waitTime);
				continue; // Re-check after waking up
			}

			// We have capacity, dispatch immediately
			const request = this.queue.shift();
			if (!request) continue;

			this.requestTimestamps.push(Date.now());
			this.executeRequest(request);
		}

		this.processing = false;
	}

	private async executeRequest(request: QueuedRequest<unknown>) {
		try {
			const result = await request.execute();
			request.resolve(result);
		} catch (error) {
			request.reject(error);
		}
	}

	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

// Singleton instance - max 2 requests per second for macosicons
export const macosIconsRateLimiter = new RateLimiter(2);
