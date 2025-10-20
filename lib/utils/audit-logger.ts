import { createClient } from '@/lib/supabase/server'

export interface AuditLog {
  admin_id: string
  action: string
  resource_type: string
  resource_id?: string
  details?: Record<string, any>
  ip_address?: string
}

export async function logAdminAction(log: AuditLog) {
  try {
    const supabase = await createClient()
    
    await supabase
      .from('admin_audit_logs')
      .insert({
        admin_id: log.admin_id,
        action: log.action,
        resource_type: log.resource_type,
        resource_id: log.resource_id,
        details: log.details,
        ip_address: log.ip_address,
        timestamp: new Date().toISOString(),
      })
  } catch (error) {
    // Log to external service in production (Sentry, Datadog, etc.)
    console.error('Failed to log admin action:', error)
  }
}
