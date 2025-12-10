/**
 * Simple in-memory rate limiter for Vercel serverless functions
 *
 * Note: This uses in-memory storage, so limits reset when the function cold starts.
 * For production with high traffic, consider using Redis or Upstash.
 */

const rateLimitStore = new Map();

/**
 * Clean up old entries every 5 minutes
 */
function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now - value.windowStart > value.windowMs * 2) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup periodically
setInterval(cleanupOldEntries, 5 * 60 * 1000);

/**
 * Rate limit configuration
 * @typedef {Object} RateLimitConfig
 * @property {number} windowMs - Time window in milliseconds
 * @property {number} maxRequests - Maximum requests per window
 * @property {string} [message] - Custom error message
 */

/**
 * Default configurations for different endpoints
 */
export const RATE_LIMITS = {
  programGenerate: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,      // 5 requests per minute
    message: 'Too many program generation requests. Please wait a minute.'
  },
  assessment: {
    windowMs: 60 * 1000,
    maxRequests: 10,
    message: 'Too many assessment requests. Please wait a minute.'
  },
  deleteAccount: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Too many delete account attempts. Please try again later.'
  },
  default: {
    windowMs: 60 * 1000,
    maxRequests: 30,
    message: 'Too many requests. Please slow down.'
  }
};

/**
 * Get client identifier from request
 * Uses IP address or user ID if available
 */
function getClientId(req) {
  // Try to get user ID from request body
  const userId = req.body?.userId;
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? forwarded.split(',')[0].trim()
    : req.socket?.remoteAddress || 'unknown';

  return `ip:${ip}`;
}

/**
 * Check if request should be rate limited
 *
 * @param {Object} req - Request object
 * @param {string} endpoint - Endpoint identifier for rate limit config
 * @returns {{ limited: boolean, remaining: number, resetAt: number }}
 */
export function checkRateLimit(req, endpoint = 'default') {
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS.default;
  const clientId = getClientId(req);
  const key = `${endpoint}:${clientId}`;
  const now = Date.now();

  let record = rateLimitStore.get(key);

  // Create new record if doesn't exist or window expired
  if (!record || (now - record.windowStart) > config.windowMs) {
    record = {
      windowStart: now,
      windowMs: config.windowMs,
      count: 0
    };
  }

  record.count++;
  rateLimitStore.set(key, record);

  const remaining = Math.max(0, config.maxRequests - record.count);
  const resetAt = record.windowStart + config.windowMs;

  return {
    limited: record.count > config.maxRequests,
    remaining,
    resetAt,
    message: config.message
  };
}

/**
 * Rate limit middleware for Vercel serverless functions
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} endpoint - Endpoint identifier
 * @returns {boolean} - True if request was rate limited (response already sent)
 */
export function rateLimitMiddleware(req, res, endpoint = 'default') {
  const result = checkRateLimit(req, endpoint);

  // Set rate limit headers
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000));

  if (result.limited) {
    res.setHeader('Retry-After', Math.ceil((result.resetAt - Date.now()) / 1000));
    res.status(429).json({
      error: 'Too Many Requests',
      message: result.message,
      retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000)
    });
    return true; // Request was rate limited
  }

  return false; // Request can proceed
}

export default {
  checkRateLimit,
  rateLimitMiddleware,
  RATE_LIMITS
};
