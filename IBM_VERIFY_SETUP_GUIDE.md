# IBM Verify Setup Guide for Prospecting Board

This guide will walk you through setting up IBM Security Verify authentication for the Prospecting Board application.

## Prerequisites

- IBM Cloud account (free tier available)
- Admin access to create applications in IBM Verify
- Production domain name (or use localhost for development)

## Step 1: Create IBM Verify Tenant

1. Go to https://www.ibm.com/verify
2. Click "Start free trial" or "Sign in" if you have an account
3. Complete the registration process
4. Note your tenant URL: `https://[your-tenant-name].verify.ibm.com`

## Step 2: Register Application in IBM Verify

1. Log into IBM Verify Admin Console
2. Navigate to **Applications** → **Add Application**
3. Select **Custom Application**
4. Choose **OAuth 2.0 / OpenID Connect**

### Application Configuration

```yaml
Application Name: Prospecting Board
Application Type: Web Application
Description: AI-powered prospecting and research dashboard

Grant Types:
  ✓ Authorization Code
  ✓ Refresh Token
  
Redirect URIs:
  Development:
    - http://localhost:3000/api/v1/auth/callback
    - http://localhost:8000/auth/callback
  
  Production:
    - https://api.your-domain.com/api/v1/auth/callback
    - https://your-domain.com/auth/callback

Scopes:
  ✓ openid (required)
  ✓ profile
  ✓ email

Token Endpoint Authentication Method:
  - client_secret_post

Token Lifetime:
  - Access Token: 3600 seconds (1 hour)
  - Refresh Token: 604800 seconds (7 days)
```

## Step 3: Get Credentials

After creating the application, you'll receive:

1. **Client ID**: A unique identifier for your application
   - Example: `abc123def456ghi789`
   
2. **Client Secret**: A secret key (keep this secure!)
   - Example: `xyz789abc123def456ghi789jkl012`
   
3. **Tenant URL**: Your IBM Verify tenant URL
   - Example: `https://mycompany.verify.ibm.com`

## Step 4: Configure Environment Variables

### For Development (.env)

```bash
IBM_VERIFY_TENANT_URL=https://[your-tenant].verify.ibm.com
IBM_VERIFY_CLIENT_ID=your_client_id_here
IBM_VERIFY_CLIENT_SECRET=your_client_secret_here
IBM_VERIFY_REDIRECT_URI=http://localhost:3000/api/v1/auth/callback
IBM_VERIFY_SCOPE=openid profile email
```

### For Production (.env.production)

```bash
IBM_VERIFY_TENANT_URL=https://[your-tenant].verify.ibm.com
IBM_VERIFY_CLIENT_ID=your_production_client_id
IBM_VERIFY_CLIENT_SECRET=your_production_client_secret
IBM_VERIFY_REDIRECT_URI=https://api.your-domain.com/api/v1/auth/callback
IBM_VERIFY_SCOPE=openid profile email
```

## Step 5: Configure User Access

1. In IBM Verify Admin Console, go to **Access Policies**
2. Create a new policy for Prospecting Board
3. Define who can access the application:
   - All users
   - Specific groups
   - Specific users

### Recommended Access Policy

```yaml
Policy Name: Prospecting Board Access
Description: Controls access to Prospecting Board application

Rules:
  - Allow access for: Sales Team Group
  - Require MFA: Yes (recommended)
  - Session timeout: 8 hours
  - Re-authentication: After 24 hours
```

## Step 6: Enable Multi-Factor Authentication (Recommended)

1. Go to **Security** → **Multi-Factor Authentication**
2. Enable MFA for the application
3. Choose MFA methods:
   - ✓ Email OTP
   - ✓ SMS OTP
   - ✓ Authenticator App (Google Authenticator, Microsoft Authenticator)
   - ✓ FIDO2/WebAuthn

## Step 7: Test Authentication Flow

### Test Endpoints

```bash
# 1. Get authorization URL
curl http://localhost:3000/api/v1/auth/ibm-verify/login

# 2. User will be redirected to IBM Verify login page
# 3. After successful login, user is redirected back with code
# 4. Backend exchanges code for tokens

# 5. Test health check
curl http://localhost:3000/health
```

### Expected Flow

```
User → Frontend → Backend → IBM Verify Login
                              ↓
User ← Frontend ← Backend ← IBM Verify (with code)
                              ↓
                         Exchange code for tokens
                              ↓
                         Store tokens securely
                              ↓
                         Return JWT to frontend
```

## Step 8: Verify Configuration

Run the verification script:

```bash
cd backend
npm run verify-ibm-config
```

Or manually test:

```bash
# Test IBM Verify endpoints
curl "https://[your-tenant].verify.ibm.com/.well-known/openid-configuration"
```

Expected response should include:
- `authorization_endpoint`
- `token_endpoint`
- `userinfo_endpoint`
- `jwks_uri`

## Troubleshooting

### Common Issues

#### 1. "Invalid redirect URI"
**Solution**: Ensure the redirect URI in your .env file exactly matches what's configured in IBM Verify (including http/https, port, and path).

#### 2. "Invalid client credentials"
**Solution**: Double-check your CLIENT_ID and CLIENT_SECRET. Ensure there are no extra spaces or line breaks.

#### 3. "CORS errors"
**Solution**: Add your frontend URL to the allowed origins in IBM Verify application settings.

#### 4. "Token expired"
**Solution**: Implement token refresh logic using the refresh token.

### Debug Mode

Enable debug logging:

```bash
LOG_LEVEL=debug npm run dev
```

Check logs for IBM Verify authentication flow:

```bash
tail -f logs/combined.log | grep "IBM Verify"
```

## Security Best Practices

1. **Never commit credentials to Git**
   - Use .env files (already in .gitignore)
   - Use environment variables in production

2. **Rotate secrets regularly**
   - Change CLIENT_SECRET every 90 days
   - Update in both IBM Verify and your application

3. **Use HTTPS in production**
   - Required for OAuth 2.0 security
   - Get SSL certificate (Let's Encrypt is free)

4. **Enable MFA**
   - Adds extra security layer
   - Protects against password breaches

5. **Monitor authentication logs**
   - Set up alerts for failed login attempts
   - Review access logs regularly

## Production Checklist

- [ ] IBM Verify application created
- [ ] Production redirect URIs configured
- [ ] Client ID and Secret obtained
- [ ] Environment variables set in .env.production
- [ ] Access policies configured
- [ ] MFA enabled
- [ ] SSL certificate installed
- [ ] CORS configured correctly
- [ ] Authentication flow tested
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Monitoring set up

## Support Resources

- **IBM Verify Documentation**: https://docs.verify.ibm.com
- **OAuth 2.0 Spec**: https://oauth.net/2/
- **OpenID Connect**: https://openid.net/connect/

## Next Steps

After completing IBM Verify setup:

1. Set up Microsoft Graph API (see DEPLOYMENT_GUIDE.md)
2. Configure database and Redis
3. Deploy backend to production
4. Deploy frontend to production
5. Test end-to-end authentication flow

---

**Need Help?**

If you encounter issues:
1. Check the troubleshooting section above
2. Review logs in `backend/logs/`
3. Consult IBM Verify documentation
4. Contact your IBM Verify administrator