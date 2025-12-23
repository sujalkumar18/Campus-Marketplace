# Deploying CampusRent Backend to Render

This guide helps you deploy your Express backend to Render's free tier so your mobile app can access it publicly.

## Step 1: Prepare Your Backend

1. Make sure you have a `server/index.ts` file that starts your Express server
2. Your server should listen on a port (default is 5000)
3. Ensure all API routes are working locally first

## Step 2: Create Render Account

1. Go to https://render.com
2. Sign up (you can use GitHub for easy login)
3. Verify your email

## Step 3: Set Up Environment Variables (Optional)

If your backend needs environment variables (like database URLs), Render lets you set them during deployment.

For now, your app uses in-memory storage, so you might not need this.

## Step 4: Deploy to Render

### Option A: Deploy from GitHub (Recommended)

1. Push your code to GitHub
2. In Render dashboard, click **New** → **Web Service**
3. Select your GitHub repository
4. Configure:
   - **Name:** `campusrent-api` (or any name)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run dev` (or `npx tsx server/index.ts`)
   - **Plan:** Free tier

5. Click **Create Web Service**
6. Wait for deployment (2-5 minutes)
7. Your URL will be something like: `https://campusrent-api.onrender.com`

### Option B: Deploy from Git URL

If your repo is public, you can paste the Git URL directly in Render.

### Option C: Manual Deployment

Contact Render support or use their CLI tool.

## Step 5: Update Mobile App

Once deployment is complete and you have your Render URL:

1. Open `mobile/lib/queryClient.ts`
2. Change:
```typescript
const BASE_URL = 'http://YOUR_REPLIT_URL:5000';
```

To:
```typescript
const BASE_URL = 'https://your-render-url.onrender.com';
```

For example:
```typescript
const BASE_URL = 'https://campusrent-api.onrender.com';
```

## Step 6: Test the Connection

1. Rebuild the mobile app:
```bash
cd mobile
npm install --legacy-peer-deps
```

2. Start the app:
```bash
npm start
```

3. Test if listings load - if they do, your backend connection works!

## Important Notes

### Free Tier Limitations

- **Spinning Down:** Free tier apps spin down after 15 minutes of inactivity
  - First request after spin-down takes 30 seconds
  - Solution: Keep your app active or upgrade to paid tier
  
- **Storage:** Data resets when app restarts (because we use in-memory storage)
  - Solution: Upgrade to a real database (PostgreSQL, MongoDB) in the future

- **No SSL Certificate:** Free tier uses HTTPS but may have issues on some phones
  - Solution: If you get SSL errors, upgrade or use custom domain

### Make Backend Persistent

Your current backend uses in-memory storage. To make it persistent:

1. **Option 1:** Add PostgreSQL to Render
   - Render offers free PostgreSQL databases
   - Update your backend to connect to PostgreSQL

2. **Option 2:** Use a different database service
   - Neon (free PostgreSQL)
   - MongoDB Atlas (free tier)

### Environment Variables on Render

If you add a database, you'll need environment variables:

1. In Render dashboard, go to **Environment** tab
2. Add variables like:
   ```
   DATABASE_URL=your_database_connection_string
   NODE_ENV=production
   ```

## Testing Deployment

Check if your backend is working:

```bash
curl https://your-render-url.onrender.com/api/listings
```

You should get a JSON response with listings.

## Troubleshooting

### 503 Service Unavailable
- App is spinning up, wait 30 seconds
- Check logs in Render dashboard

### CORS Errors
Your Express server should have CORS enabled. Add to `server/index.ts`:
```typescript
import cors from 'cors';
app.use(cors());
```

### Connection Timeout
- Check your firewall settings
- Make sure the port matches (Render assigns ports dynamically)
- Check that your start command is correct

### Database Connection Failed
- Verify database URL in environment variables
- Make sure database is running

## Next Steps

1. Deploy your backend to Render
2. Get the deployment URL
3. Update `mobile/lib/queryClient.ts` with that URL
4. Rebuild the mobile app and test
5. Share the APK with your students!

For questions, check Render documentation: https://docs.render.com
