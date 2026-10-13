# DocuPulse AI — Intelligent Document Processing (IDP) Platform

> **Hackathon Challenge Submission**: AI-Powered Intelligent Document Processing, Understanding, Information Extraction, Rule Validation, and Knowledge Discovery.

---

## 🌟 Live Local Links & Quick Access

- **Frontend Application**: [http://localhost:5173/](http://localhost:5173/)
- **Backend API Server**: [http://localhost:5000/](http://localhost:5000/)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 🔑 Instant Reviewer Demo Credentials
You don't need to type anything — simply click the **"1-Click Instant Demo"** button on the landing page or login screen, or use:
- **Email**: `demo@docupulse.ai`
- **Password**: `DocuPulse2026!`

---

## 📌 Problem Statement

Modern enterprises across finance, healthcare, legal, and logistics process thousands of heterogeneous documents weekly (commercial invoices, legal contracts, clinical diagnostic lab reports, and tax forms). Over **80% of critical enterprise data is trapped in unstructured or semi-structured formats** (scanned PDFs, images, free-text notes).

### Key Industry Pain Points:
1. **Severe Operational Latency**: Manual data entry and triage requires 4–7 days per document batch, delaying accounts payable and patient care.
2. **High Error & Discrepancy Rate**: A 15–20% rate of overlooked math calculation errors, invoice mismatches, and missed contract liability caps.
3. **Dark Data Silos**: Inability to perform cross-document queries or search for contractual terms across thousands of archived files.
4. **Lack of Human-in-the-Loop Governance**: Rigid legacy OCR solutions lack contextual confidence scoring and real-time review interfaces.

---

## 💡 Solution Description: DocuPulse AI

**DocuPulse AI** is an enterprise-grade Intelligent Document Processing (IDP) platform powered by **Google Gemini Multimodal AI** combined with an **automated business rule validation engine** and a **Human-in-the-Loop (HITL) Extraction Studio**.

### Core Innovations & Capabilities:
- 🚀 **Multimodal Zero-Shot Understanding**: Processes multi-page PDFs, scans, images (PNG, JPG, WEBP), and text without requiring brittle manual OCR template training.
- 🏷️ **Autonomous Document Classification**: Instantly categorizes documents into domain taxonomies (`INVOICE`, `CONTRACT`, `MEDICAL_RECORD`, `FINANCIAL_REPORT`, `UNSTRUCTURED_NOTE`).
- 📊 **Schema-Driven Structured Extraction**: Extracts normalized key-value fields, itemized multi-row line tables, and named entities with confidence scores.
- 🛡️ **Autonomous Rule Guard & Anomaly Engine**:
  - **Invoices**: Math reconciliation (`Subtotal + Tax = Total Due`), due date sequencing, vendor/customer presence checks.
  - **Contracts / NDAs**: Uncapped liability risk detection, governing law verification, missing termination clauses.
  - **Medical Records**: Diagnostic code extraction, vital sign parsing, clinical abnormality alerts (e.g. elevated blood glucose / HbA1c).
  - **Confidence Thresholds**: Documents with `<75%` confidence automatically flagged as `REVIEW_REQUIRED`.
- ✍️ **Human-in-the-Loop (HITL) Extraction Studio**: Live side-by-side view with editable fields, real-time re-validation, approval workflows, and audit trail.
- 💬 **Cross-Document Knowledge Discovery Copilot**: Interactive semantic Q&A across individual documents or the entire document corpus with citations.
- 📤 **Enterprise Export**: 1-click export to structured JSON and formatted CSV.

---

## 🛠️ Assignment Tech Stack Alignment

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router, Tailwind CSS, Lucide React, Axios |
| **Backend** | Node.js, Express.js, JWT Authentication, bcryptjs, Zod, Multer |
| **Database** | SQLite with Prisma ORM / Zero-config storage layer (swappable to PostgreSQL/Supabase) |
| **Artificial Intelligence** | Google Gemini API (`gemini-2.5-flash` / `gemini-1.5-flash`) with Resilient Fallback Engine |
| **Tools & Testing** | Git, GitHub, RESTful APIs, PowerShell |

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node.js v24)
- **npm**: v9.0.0 or higher

### 2. Clone Repository
```bash
git clone https://github.com/your-username/docupulse-ai.git
cd docupulse-ai
```

### 3. Backend Setup
```bash
cd backend
npm install
```
Configure your environment in `backend/.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=docupulse_super_secret_jwt_key_2026_idp_secure!
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:5173
```
> **Note**: If `GEMINI_API_KEY` is left blank, DocuPulse AI seamlessly activates its built-in Intelligent Heuristic Extraction Engine, allowing complete offline testing and evaluation without any crashes!

Start the backend:
```bash
npm start
# Server runs at http://localhost:5000
```

### 4. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
# Vite runs at http://localhost:5173
```

---

## 📁 Pre-Loaded Test Documents (`sample-documents/`)

Four ready-to-use sample documents are included in the `sample-documents/` folder and pre-configured with 1-click buttons in the **Upload & Ingestion** view:

1. **`Sample_Invoice_ApexCloud.txt`**: Clean commercial invoice ($13,695.00) with line items and Net 30 terms. Passes all math validation checks.
2. **`Sample_Invoice_Discrepancy.txt`**: Invoice with deliberate arithmetic error (`$8,550 + $427.50 != $9,850`) and invalid due date. Triggers automated **Anomaly Detected / REVIEW_REQUIRED** flag.
3. **`Sample_Vendor_NDA_Agreement.txt`**: Mutual NDA between CyberScale and DataSync with Delaware governing law and a $250,000 liability cap.
4. **`Sample_Clinical_Lab_Report.txt`**: Patient diagnostic report with vital signs and metabolic biomarker panel (Fasting Glucose, HbA1c 7.1%). Triggers clinical abnormality alerts.

---

## 🌐 Deployment Instructions

### Frontend (Vercel / Netlify)
1. Push repository to GitHub.
2. In Vercel, import the repo and select root directory as `frontend`.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`, Output Directory: `dist`.
5. Set environment variable: `VITE_API_URL=https://your-backend.onrender.com`.

### Backend (Render / Railway)
1. In Render, create a new **Web Service** connected to your repo.
2. Root Directory: `backend`.
3. Build Command: `npm install`.
4. Start Command: `npm start`.
5. Environment Variables:
   - `NODE_ENV=production`
   - `JWT_SECRET=your_secure_random_key`
   - `GEMINI_API_KEY=your_google_gemini_api_key`
   - `PORT=5000`

---

## 🎥 Demo Video Walkthrough Outline (3–5 Minutes)

1. **Introduction (0:00 - 0:45)**:
   - Problem statement: Unstructured document chaos, transcription bottlenecks, overlooked math discrepancies.
   - Introduce **DocuPulse AI**.
2. **Overview & Ingestion (0:45 - 1:45)**:
   - Showcase KPI dashboard (Avg Confidence, Total Ingested, Anomalies Prevented).
   - Ingest a document using the 1-click sample button or drag-and-drop.
3. **Extraction Studio & HITL Review (1:45 - 3:00)**:
   - Show side-by-side document preview and extracted key-values.
   - Demonstrate the **Rule Guard**: show how arithmetic mismatches and uncapped liability are caught.
   - Perform a Human-in-the-Loop field edit and click **Save Edits & Re-validate**.
4. **Knowledge Discovery Copilot (3:00 - 4:00)**:
   - Open Knowledge Copilot and ask cross-document questions with instant citations.
   - Export extracted results as JSON and CSV.
5. **Conclusion & Tech Stack Recap (4:00 - 4:30)**:
   - Recap: React 19, Node/Express, JWT, SQLite/Prisma, Google Gemini.
