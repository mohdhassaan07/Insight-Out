import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = Redis.fromEnv();

/**
 * Wraps a Ratelimit instance so that Redis connection errors fail-open
 * (allow the request) instead of throwing and causing a 500.
 */
function makeSafeLimiter(limiter: Ratelimit) {
  return {
    limit: async (key: string) => {
      try {
        return await limiter.limit(key);
      } catch (err) {
        console.warn("[RateLimiter] Redis unreachable, failing open:", err);
        return { success: true };
      }
    },
  };
}

export const apiLimiter = makeSafeLimiter(new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1000, "1 m"),
  analytics: true,
}));

export const uploadLimiter = makeSafeLimiter(new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 h"),
}));

export const exportLimiter = makeSafeLimiter(new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
}));

export const passwordUpdateLimiter = makeSafeLimiter(new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(2, "24 h"),
}));

export const chatLimiter = makeSafeLimiter(new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
}));
