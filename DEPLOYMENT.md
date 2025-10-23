# Deployment Guide - Render

This guide will help you deploy Project AP to Render using their Blueprint feature for automatic deployment.

## Prerequisites

- GitHub account with your code pushed
- Render account (free tier works great)

## Step 1: Push to GitHub

Make sure all your code is committed and pushed to GitHub:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Step 2: Deploy to Render

### Using Blueprint (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New" → "Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml` and create both services

### Initial Deployment

The first deployment will create:

- **Backend server** at: `https://project-ap-server.onrender.com`
- **Frontend** at: `https://project-ap-frontend.onrender.com`

_Note: Your actual URLs will be different. Render will assign unique URLs._

## Step 3: Configure Environment Variables

After the initial deployment, you need to set the environment variables so the frontend and backend can communicate:

### Backend (Server) Configuration

1. Go to your **project-ap-server** service in Render
2. Click **"Environment"** in the left sidebar
3. Set the following environment variable:
   - **Key:** `CLIENT_URL`
   - **Value:** Your frontend URL (e.g., `https://project-ap-frontend.onrender.com`)
4. Click **"Save Changes"**

### Frontend Configuration

1. Go to your **project-ap-frontend** service in Render
2. Click **"Environment"** in the left sidebar
3. Set the following environment variable:
   - **Key:** `VITE_SERVER_URL`
   - **Value:** Your backend URL (e.g., `https://project-ap-server.onrender.com`)
4. Click **"Save Changes"**

Both services will automatically redeploy with the new environment variables.

## Step 4: Test Your Deployment

1. Open your frontend URL in multiple browser tabs
2. Join games and test the multiplayer functionality
3. Check that WebSockets are working (you should see connection logs)

## Important Notes

### Free Tier Limitations

- **Spin down after 15 minutes** of inactivity
- **Cold start** takes ~30 seconds when waking up
- Both players need to be on the site to keep it awake during a game

### Upgrading to Paid Tier

To eliminate cold starts:

1. Upgrade to **Starter Plan** ($7/month per service)
2. Your services will stay always-on
3. Better performance and no spin-down delays

## Troubleshooting

### WebSocket Connection Failed

**Problem:** Players can't connect to each other

**Solution:**

1. Check that `VITE_SERVER_URL` is set correctly on frontend
2. Check that `CLIENT_URL` is set correctly on backend
3. Make sure both URLs use `https://` (not `http://`)
4. Verify CORS settings in `server/index.ts`

### Backend Won't Start

**Problem:** Server service shows errors

**Solution:**

1. Check build logs in Render dashboard
2. Verify `npm run server` works locally
3. Check that all dependencies are in `package.json`
4. Make sure `PORT` environment variable is not hardcoded

### Frontend Build Fails

**Problem:** Frontend build errors

**Solution:**

1. Run `npm run build` locally to test
2. Check TypeScript errors with `npm run lint`
3. Verify all environment variables are set
4. Check that `dist` directory is being created

## Custom Domain (Optional)

To use your own domain:

1. In Render dashboard, go to your service
2. Click **"Settings" → "Custom Domain"**
3. Add your domain
4. Update DNS records as instructed
5. Render will automatically provision SSL certificate

Remember to update the environment variables with your custom domain URLs!

## Monitoring

Render provides:

- **Logs**: View real-time logs for debugging
- **Metrics**: Monitor service health and performance
- **Alerts**: Set up notifications for downtime

## Auto-Deploy on Push

Once configured, any push to your `main` branch will automatically:

1. Trigger a new build
2. Run tests (if configured)
3. Deploy to production
4. Maintain zero-downtime deployment

## Cost Estimate

**Free Tier:**

- Backend: Free (with spin-down)
- Frontend: Free (with spin-down)
- Total: **$0/month**

**Starter Tier (Always-On):**

- Backend: $7/month
- Frontend: $7/month
- Total: **$14/month**

## Support

If you encounter issues:

1. Check [Render Docs](https://render.com/docs)
2. View service logs in Render dashboard
3. Check GitHub Actions (if configured)
4. Contact Render support (very responsive)

---

Happy deploying! 🚀
