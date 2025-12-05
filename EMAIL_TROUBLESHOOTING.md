# Email Troubleshooting Guide

## Issue: Not Receiving Verification Emails

### Step 1: Check Vercel Environment Variables

Make sure these are set in your Vercel dashboard:
- `BASE_URL` - Should be your custom domain (e.g., `https://forex24.vip`)
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Your JWT secret

### Step 2: Verify SMTP Settings

The email is sent from: `support@forex24.vip`
SMTP Server: `smtpout.secureserver.net` (GoDaddy)

**Check in Vercel Logs:**
1. Go to your Vercel project dashboard
2. Click on "Deployments"
3. Click on the latest deployment
4. Click on "Functions" tab
5. Check the logs for email errors

Look for messages like:
- "Email sent successfully!" ✅
- "Email send error:" ❌

### Step 3: Test SMTP Connection

The SMTP credentials are:
- Host: `smtpout.secureserver.net`
- Port: `465`
- Username: `support@forex24.vip`
- Password: `Forex24@5668`

**Common Issues:**

1. **GoDaddy SMTP might be blocked by Vercel**
   - Some hosting providers block SMTP from serverless functions
   - Solution: Use a service like SendGrid, Mailgun, or Resend

2. **BASE_URL not set correctly**
   - Make sure BASE_URL in Vercel matches your custom domain
   - Should be: `https://yourdomain.com` (with https, no trailing slash)

3. **Email going to spam**
   - Check spam/junk folder
   - Verify email domain SPF/DKIM records

### Step 4: Check Vercel Function Logs

In Vercel dashboard → Your Project → Functions → View Logs

You should see:
```
Attempting to send verification email to: user@example.com
Using base URL: https://yourdomain.com
Verification URL: https://yourdomain.com/api/auth/verify-email?token=...
Email sent successfully! Message ID: ...
```

If you see errors, they will be logged there.

### Alternative: Use Email Service Provider

If GoDaddy SMTP doesn't work on Vercel, consider using:
- **Resend** (recommended for Vercel)
- **SendGrid**
- **Mailgun**
- **AWS SES**

Would you like me to update the code to use Resend or another service?

