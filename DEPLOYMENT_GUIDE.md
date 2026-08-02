# Production Deployment Guide - Beereddy Agency ERP Version 1.0.0

This guide provides step-by-step instructions for deploying **Beereddy Agency ERP** to production cloud platforms.

---

## 🌐 Environment Variables Checklist

Ensure the following environment variables are set in your production hosting environment:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/beereddy_erp?retryWrites=true&w=majority
JWT_SECRET=beereddy_agency_super_secret_production_jwt_key_2026
EMAIL_USER=vvishnuvardhanreddy653@gmail.com
EMAIL_PASS=<app_password>
```

---

## 1. Deploying Frontend to Vercel

1. Install Vercel CLI or connect GitHub repository:
   ```bash
   npm i -g vercel
   vercel
   ```
2. The project contains `vercel.json` pre-configured for SPA fallback routing and security headers.

---

## 2. Deploying Backend to Render.com

1. Create a **New Web Service** on Render.com.
2. Select your repository and specify:
   - **Environment**: Node
   - **Build Command**: `npm install --prefix backend`
   - **Start Command**: `npm start --prefix backend`
3. Add environment variables in Render Dashboard (`MONGO_URI`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`).
4. Render automatically utilizes the included `render.yaml` specification.

---

## 3. Containerized Deployment with Docker

Build and run using the included production `Dockerfile`:

```bash
# Build Docker Image
docker build -t beereddy-erp:1.0.0 .

# Run Container
docker run -d -p 5000:5000 --env-file ./backend/.env --name beereddy-erp beereddy-erp:1.0.0
```

---

## 4. Mobile Android Release APK (`beereddy_mobile_release.apk`)

To compile a fresh Flutter Android Release APK:

```bash
cd mobile
flutter clean
flutter pub get
flutter build apk --release --no-tree-shake-icons
```
The compiled APK is placed at `mobile/build/app/outputs/flutter-apk/app-release.apk` (approx. 22 MB).
