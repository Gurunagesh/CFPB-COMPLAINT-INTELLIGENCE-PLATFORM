# CFPB Consumer Complaint Intelligence Platform — Frontend

A production-grade, enterprise Next.js (App Router, TypeScript, Tailwind CSS) inference and control interface for the CFPB Consumer Complaint Machine Learning Intelligence Platform.

This web application connects to the pre-deployed FastAPI backend on Render:
`https://cfpb-complaint-intelligence-platform.onrender.com`

---

## 1. Prerequisites (Installing Node.js & npm)

If Node.js and npm are not yet installed on your Windows workstation, install Node.js LTS (v20 or v22 recommended):

### Option A: Windows Package Manager (PowerShell as Administrator)
```powershell
winget install OpenJS.NodeJS.LTS
```
*After installation completes, close and reopen your terminal or VS Code to refresh your `PATH` environment variable.*

### Option B: Official MSI Installer
Download and run the LTS installer from:
[https://nodejs.org/en/download](https://nodejs.org/en/download)

### Verify Installation:
```powershell
node -v
npm -v
```
You should see output similar to `v20.x.x` (or `v22.x.x`) and `10.x.x`.

---

## 2. Local Setup & Configuration

Navigate into the `frontend` folder from your repository root:

```powershell
cd d:\GURU_PROJECTS\ML-FINTECH&BANK\frontend
```

### Step 2.1: Install Dependencies
```powershell
npm install
```

### Step 2.2: Configure Local Environment Variable
Copy `.env.example` to `.env.local` (which is git-ignored):

```powershell
cp .env.example .env.local
```

Open `.env.local` and choose your backend target:
- **To test against your live Render backend directly**:
  ```ini
  NEXT_PUBLIC_API_BASE_URL=https://cfpb-complaint-intelligence-platform.onrender.com
  ```
- **To test against a local FastAPI instance** running on port 8000:
  ```ini
  NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
  ```

---

## 3. Running & Verifying the Application

### Step 3.1: Run TypeScript Type Check
```powershell
npm run type-check
```
*Ensures zero type mismatches with backend schemas.*

### Step 3.2: Run ESLint
```powershell
npm run lint
```
*Verifies Next.js code standards and clean syntax.*

### Step 3.3: Launch Development Server
```powershell
npm run dev
```
Open your browser to: [http://localhost:3000](http://localhost:3000)

### Step 3.4: Production Build Validation
```powershell
npm run build
```
*Verifies that the complete production bundle compiles with zero static errors.*

---

## 4. Feature Tour & Verification Checklist

1. **System Overview (`/`)**:
   - Live API health & readiness indicators.
   - Project 1 and Project 2 real-time model status badges.
   - Dual-model pipeline execution summary.
2. **Product Classification (`/product-classification`)**:
   - Enter complaint narrative (min 10, max 20,000 characters) and company.
   - Or click any **Demonstration Preset** button to load synthetic complaint test data.
   - Click **Classify Product** to inspect predicted product, confidence meter, and top-k probability chart.
   - Notice the governance notice: *"Statistical inference; not verified ground truth."*
3. **Triage Latency Intelligence (`/triage-intelligence`)**:
   - Enter intake date & time (or click *Set Current Time*), narrative, and company.
   - Click **Estimate Triage Latency** to receive estimated turnaround in days, hours, and operational risk band.
   - Prominent experimental notice: *"Experimental / Not Production Approved. Prediction is informational and must not be used as an autonomous operational decision."*
4. **Combined Analysis (`/combined-analysis`)**:
   - Unified intake submitting to `/api/v1/combined/predict`.
   - Renders side-by-side analytical cards for Product Classification and Triage Intelligence.
5. **System & Models (`/system`)**:
   - Live telemetry querying `/health`, `/ready`, and `/models`.
   - Displays real artifact versions, model algorithms, test performance metrics, and governance flags.

---

## 5. Deploying to Vercel

The application is architected specifically for zero-friction Vercel deployment:

### Step 5.1: Push Frontend to GitHub
Ensure all frontend code is committed:
```powershell
git add frontend
git commit -m "feat: complete production Next.js frontend for CFPB intelligence platform"
git push origin main
```

### Step 5.2: Create Project in Vercel
1. Log in to [vercel.com](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Import your GitHub repository (`ML-FINTECH&BANK` or your repo name).
4. In **Project Settings**:
   - **Root Directory**: Click *Edit* and select `frontend`.
   - **Framework Preset**: *Next.js* (auto-detected).
5. In **Environment Variables**, add:
   - **Key**: `NEXT_PUBLIC_API_BASE_URL`
   - **Value**: `https://cfpb-complaint-intelligence-platform.onrender.com`
6. Click **Deploy**. Vercel will build and publish your site to a URL like:
   `https://cfpb-complaint-intelligence.vercel.app`

---

## 6. Configuring Render Backend CORS for Production

Your backend in `Src/api/config.py` enforces an allowed origins whitelist via the `ALLOWED_ORIGINS` environment variable:

```python
allowed_origins: str = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
)
```

To allow requests from your live Vercel frontend:

1. Open your [Render Dashboard](https://dashboard.render.com).
2. Select your `cfpb-complaint-intelligence-platform` Web Service.
3. Navigate to the **Environment** tab.
4. Locate or add `ALLOWED_ORIGINS` and append your Vercel production domain:
   ```text
   http://localhost:3000,http://127.0.0.1:3000,https://YOUR-VERCEL-DOMAIN.vercel.app
   ```
5. Click **Save Changes**. Render will trigger a quick redeploy/restart.
6. Your live Vercel frontend is now fully authorized to make direct browser requests to your FastAPI backend!
