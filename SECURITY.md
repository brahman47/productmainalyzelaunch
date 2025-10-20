# Security Documentation

## Overview
This document outlines the security measures implemented in the productmainalyze application.

## Security Features Implemented

### 1. Authentication & Authorization
- ✅ Supabase Auth with Row Level Security (RLS)
- ✅ Server-side authentication checks on all protected routes
- ✅ Admin role verification with database-level policies
- ✅ Session management via Supabase cookies

### 2. Input Validation
- ✅ Zod schema validation on all API inputs
- ✅ File type validation using magic numbers (not just extensions)
- ✅ File size limits enforced (10MB per file)
- ✅ Sanitized user inputs to prevent injection attacks

### 3. Rate Limiting
- ✅ Per-IP rate limiting on all API routes
- ✅ 100 requests per 15 minutes per IP address
- ✅ Prevents DDoS and API abuse

### 4. Security Headers
- ✅ X-Frame-Options: DENY (prevents clickjacking)
- ✅ X-Content-Type-Options: nosniff (prevents MIME sniffing)
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy: restricts camera, microphone, geolocation
- ✅ Strict-Transport-Security (HSTS) enabled

### 5. CORS Configuration
- ✅ CORS restricted to specific origin (not wildcard)
- ✅ Credentials allowed only from trusted origins

### 6. File Upload Security
- ✅ Magic number verification for file types
- ✅ Whitelist of allowed MIME types
- ✅ Files stored in Supabase Storage with RLS
- ✅ User-scoped file access (users can only access their own files)

### 7. Admin Security
- ✅ Audit logging for all admin actions
- ✅ Database table for audit trail
- ✅ IP address logging
- ✅ Timestamp and action details captured

### 8. Database Security
- ✅ Row Level Security (RLS) on all tables
- ✅ Parameterized queries (no SQL injection)
- ✅ Foreign key constraints with CASCADE deletes
- ✅ Indexes for performance

### 9. API Security
- ✅ Authentication required on all sensitive endpoints
- ✅ User ID verification from session (not from request body)
- ✅ Error messages don't leak sensitive info
- ✅ Environment-aware logging (no sensitive data in production)

### 10. Environment Variables
- ✅ All secrets in environment variables
- ✅ `.env.local` in `.gitignore`
- ✅ Validation on startup for required variables
- ✅ Public keys prefixed with `NEXT_PUBLIC_`

## Security Best Practices

### For Developers

1. **Never Commit Secrets**
   - Use `.env.local` for local development only
   - Store production secrets in Vercel environment variables
   - Never commit API keys, passwords, or tokens

2. **Input Validation**
   - Always validate and sanitize user inputs
   - Use Zod schemas for type-safe validation
   - Reject invalid data early

3. **Authentication**
   - Always verify user session server-side
   - Never trust client-provided user IDs
   - Use Supabase server client for sensitive operations

4. **Logging**
   - Use the logger utility (`lib/utils/logger.ts`)
   - Never log passwords, tokens, or PII in production
   - Use appropriate log levels

5. **Error Handling**
   - Don't expose stack traces to clients
   - Log detailed errors server-side only
   - Return generic error messages to users

### For Production Deployment

1. **Environment Setup**
   ```bash
   # Required environment variables
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   GEMINI_API_KEY=your_gemini_key
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

2. **Security Headers**
   - Verify security headers are applied in production
   - Test with [securityheaders.com](https://securityheaders.com)

3. **SSL/TLS**
   - Ensure HTTPS is enforced
   - Enable HSTS
   - Use valid SSL certificates

4. **Monitoring**
   - Set up error tracking (Sentry, Datadog, etc.)
   - Monitor rate limit hits
   - Track failed authentication attempts
   - Review audit logs regularly

5. **Regular Updates**
   - Keep dependencies updated
   - Run `npm audit` regularly
   - Apply security patches promptly

## Supabase Row Level Security Policies

### Profiles Table
- Users can view/update their own profile
- Admins can view all profiles

### Mains Evaluations Table
- Users can view/insert their own evaluations
- Admins can view all evaluations
- Users can delete their own evaluations

### Prelims Sessions Table
- Users can view/insert/update/delete their own sessions
- Admins can view all sessions

### Storage (answer-uploads bucket)
- Users can upload files to their own folder
- Users can view their own files
- Files are organized by user ID

## API Rate Limits

| Endpoint | Rate Limit | Window |
|----------|-----------|---------|
| All API routes | 100 requests | 15 minutes |

## File Upload Restrictions

| Property | Limit |
|----------|-------|
| Max file size | 10 MB |
| Allowed types | JPEG, PNG, PDF |
| Max files per upload | Unlimited (within size limit) |

## Admin Audit Log Events

The following admin actions are logged:
- `VIEW_ALL_USERS` - Admin viewed all users list
- `VIEW_USER_DETAILS` - Admin viewed specific user details
- `UPDATE_USER` - Admin modified user profile
- `DELETE_USER` - Admin deleted user account

Each log entry includes:
- Admin user ID
- Action type
- Resource type and ID
- Timestamp
- IP address
- Additional details (JSON)

## Security Incident Response

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email security concerns to: [YOUR_SECURITY_EMAIL]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Compliance

### Data Protection
- User data is encrypted in transit (HTTPS)
- User data is encrypted at rest (Supabase)
- Users can delete their own data
- Admin actions are audited

### GDPR Considerations
- Users can view their data
- Users can delete their data
- Audit trail for data access
- Clear privacy policy needed (TODO)

## Regular Security Tasks

### Daily
- Monitor error logs
- Check rate limit violations

### Weekly
- Review admin audit logs
- Check for suspicious activity

### Monthly
- Run `npm audit`
- Update dependencies
- Review access logs
- Test backup restoration

### Quarterly
- Security penetration testing
- Rotate API keys
- Review and update security policies
- Security training for team

## Testing Security

### Local Testing
```bash
# Run security audit
npm audit

# Test rate limiting
# Make 101 requests to any API endpoint within 15 minutes

# Test authentication
# Try accessing /api/* without auth token

# Test file upload
# Try uploading non-whitelisted file types
```

### Production Testing
- Use OWASP ZAP or Burp Suite for penetration testing
- Test all authentication flows
- Verify rate limiting is working
- Check security headers
- Test file upload restrictions

## Known Limitations

1. **No Virus Scanning**: Files are not scanned for viruses (consider adding ClamAV or cloud service)
2. **No MFA**: Multi-factor authentication not yet implemented for admin accounts
3. **No IP Whitelisting**: Admin panel accessible from any IP
4. **No DDoS Protection**: Relies on Vercel's infrastructure (consider Cloudflare)
5. **No Content Security Policy**: CSP headers not yet configured

## Roadmap

### Short Term (Next Sprint)
- [ ] Add virus scanning for uploads
- [ ] Implement MFA for admin accounts
- [ ] Add CSP headers
- [ ] Set up Sentry for error tracking

### Medium Term (Next Quarter)
- [ ] IP whitelisting for admin panel
- [ ] Advanced rate limiting (per-user, per-endpoint)
- [ ] Automated security testing in CI/CD
- [ ] GDPR compliance audit

### Long Term
- [ ] SOC 2 compliance
- [ ] Regular third-party security audits
- [ ] Bug bounty program
- [ ] Security awareness training

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/authentication)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)

---

**Last Updated:** October 20, 2025  
**Version:** 1.0  
**Maintained By:** FirebringerLabs
