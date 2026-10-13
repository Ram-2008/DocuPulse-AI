# Deployment Guide — DocuPulse AI

This guide walks you through deploying **DocuPulse AI** to production:
- **Frontend**: [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/)
- **Backend**: [Render](https://render.com/) or [Railway](https://railway.app/)
- **Database**: SQLite (built-in persistent disk) or [Supabase](https://supabase.com/) / [Neon](https://neon.tech/)

---

## 1. Deploying the Backend (Render)

1. Sign in to [Render](https://dashboard.render.com/).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. Fill in the deployment details:
   - **Name**: `docupulse-ai-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `<generate-a-strong-secret-key>`
   - `JWT_EXPIRES_IN`: `7d`
   - `GEMINI_API_KEY`: `<your-google-gemini-api-key>`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`
6. Click **Create Web Service**.
7. Copy your backend URL (e.g. `https://docupulse-ai-backend.onrender.com`).

---

## 2. Deploying the Frontend (Vercel)

1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New...** > **Project**.
3. Import your GitHub repository.
4. Configure Project:
   - **Root Directory**: Click edit and select `frontend`.
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   - `VITE_API_URL`: `https://docupulse-ai-backend.onrender.com`
6. Under `frontend/vite.config.js`, verify production proxy or API base URL.
7. Click **Deploy**.

---

## 3. Verifying the Deployment

1. Visit your frontend URL on Vercel.
2. Click **1-Click Instant Demo Login**.
3. Verify that the pre-seeded documents appear on the dashboard.
4. Try uploading a sample invoice or contract from the **Upload** page.
5. Inspect the Extraction Studio and verify Gemini responses!
