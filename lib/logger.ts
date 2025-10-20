/**
 * Production-safe logger utility
 * In production, only errors are logged to avoid leaking sensitive information
 * In development, all logs are shown for debugging
 */

type LogLevel = 'log' | 'error' | 'warn' | 'info'

class Logger {
  private isProduction = process.env.NODE_ENV === 'production'

  log(...args: any[]) {
    if (!this.isProduction) {
      console.log(...args)
    }
  }

  error(...args: any[]) {
    // Always log errors, but sanitize in production
    if (this.isProduction) {
      // In production, log without sensitive details
      console.error('[Error]', args[0]) // Only log first argument (error message)
    } else {
      console.error(...args)
    }
  }

  warn(...args: any[]) {
    if (!this.isProduction) {
      console.warn(...args)
    }
  }

  info(...args: any[]) {
    if (!this.isProduction) {
      console.info(...args)
    }
  }

  // Special method for audit logging (always logs, securely)
  audit(action: string, userId?: string, metadata?: Record<string, any>) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      action,
      userId: userId || 'unknown',
      metadata: metadata || {},
    }
    
    // In production, this should go to a monitoring service (Sentry, Datadog, etc.)
    // For now, we'll use console.error which is typically captured by hosting platforms
    console.error('[AUDIT]', JSON.stringify(logEntry))
  }
}

export const logger = new Logger()
