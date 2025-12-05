# Deploying Forex24 to Vercel

## Step 1: Install Vercel CLI (if not already installed)
```bash
npm install -g vercel
```

## Step 2: Login to Vercel
```bash
vercel login
```

## Step 3: Deploy to Vercel
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No** (for first deployment)
- Project name? **forex24** (or your preferred name)
- Directory? **./** (current directory)
- Override settings? **No**

## Step 4: Set Environment Variables on Vercel

After deployment, go to your Vercel dashboard:
1. Go to your project settings
2. Click on "Environment Variables"
3. Add the following variables:

### Required Environment Variables:

```
MONGODB_URI=mongodb+srv://personalkrishna17_db_user:Forex24@cluster0.f79pbvq.mongodb.net/forex24?retryWrites=true&w=majority
```

```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-forex24-2024
```

```
BASE_URL=https://your-project-name.vercel.app
```
(Replace with your actual Vercel deployment URL)

```
NODE_ENV=production
```

## Step 5: Redeploy

After adding environment variables, redeploy:
```bash
vercel --prod
```

Or trigger a new deployment from the Vercel dashboard.

## Important Notes:

1. **Email Verification**: Update the BASE_URL to your Vercel domain after first deployment
2. **MongoDB**: Make sure your MongoDB Atlas allows connections from Vercel's IPs (or allow all IPs: 0.0.0.0/0)
3. **SMTP**: The email service should work, but verify the SMTP settings work from Vercel's servers
4. **Static Files**: All HTML files will be served through the Express server

## Troubleshooting:

- If you get errors, check Vercel function logs in the dashboard
- Make sure all environment variables are set correctly
- Verify MongoDB connection is allowed from Vercel's IP addresses

