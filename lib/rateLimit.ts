/**
 * Simple in-memory rate limiter for API routes
 * For production, consider using Redis or a service like Upstash
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Rate limiter function
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 15 * 60 * 1000, maxRequests: 100 }
): RateLimitResult {
  const now = Date.now()
  const key = identifier
  
  // Initialize or get existing entry
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 0,
      resetTime: now + config.windowMs
    }
  }
  
  // Increment request count
  store[key].count++
  
  const remaining = Math.max(0, config.maxRequests - store[key].count)
  const success = store[key].count <= config.maxRequests
  
  return {
    success,
    limit: config.maxRequests,
    remaining,
    reset: store[key].resetTime
  }
}

/**
 * Get client identifier from request
 * Uses IP address or user ID if authenticated
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`
  }
  
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  return `ip:${ip}`
}

/**
 * Rate limit configurations for different API routes
 */
export const rateLimitConfigs = {
  // Generous limits for question generation (expensive operation)
  generateQuestions: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 20 // 20 question generations per 15 minutes
  },
  
  // Moderate limits for evaluation (very expensive operation)
  evaluateAnswer: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10 // 10 evaluations per 15 minutes
  },
  
  // Higher limits for explanations (less expensive)
  explainAnswer: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50 // 50 explanations per 15 minutes
  },
  
  // Moderate limits for file uploads
  upload: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 30 // 30 uploads per 15 minutes
  },
  
  // Standard limits for general API routes
  default: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100 // 100 requests per 15 minutes
  }
} as const
