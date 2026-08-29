# 🏭 Industrial Approval & Compliance Management Platform
### Smart India Hackathon (SIH) Project

An intelligent, MERN-based platform designed to streamline industrial approvals, regulatory compliance, document management, and access to government support services.

This repository contains the blueprints and the implementation for our SIH Hackathon project. Our platform follows a **hybrid architecture** that combines a deterministic rules engine with an AI-powered RAG layer.

---

## 1. What Problem Are We Solving?

Starting and operating an industrial unit requires navigating a complex labyrinth of approvals, licenses, NOCs, registrations, inspections, and recurring filings. The requirements vary drastically based on:
- Industry/sector (e.g., Textiles vs. Electronics)
- State, district, and exact project location
- Investment amount and production capacity
- Number of employees
- Environmental characteristics (water usage, wastewater generation, hazardous waste)
- Project stage (Pre-establishment vs. Pre-operation vs. Expansion)

Entrepreneurs struggle to answer fundamental questions:
> "Which approvals apply to my project?"  
> "Why do I need this specific approval?"  
> "What documents are required?"  
> "What is the current status of my application?"  
> "What compliance obligations are due next month?"

**Our solution** is an intelligent regulatory workspace that transforms regulatory ambiguity into a clear, actionable, and explainable **personalized industrial regulatory roadmap**.

---

## 2. Product Vision & Value Proposition

**Industry Profile → Regulatory Analysis → Applicable Approvals → Document Verification → Application Tracking → Continuous Compliance → Government Scheme Discovery → AI Assistance**

We provide an end-to-end intelligent compliance workspace without hallucinating legal facts. The core principle is that **the LLM is NOT the source of truth for regulatory applicability.** Deterministic rules and authoritative documents are the source of truth; the LLM acts purely as an assistant for explanation and summarization.

---

## 3. Core Features & User Journey

### A. Industry Profile Wizard
Users start by creating a comprehensive project profile. This profile acts as the central input for the entire platform.
- **Fields collected:** Company name, sector, state, district, investment scale, employees, manufacturing activity, environmental impact (wastewater/hazardous waste), and project stage.

### B. Approval Discovery (Rules Engine)
When the user clicks "Analyze My Project", the system runs the profile through a deterministic **Rules Engine**.
- The Rules Engine evaluates conditions (using operators like `eq`, `gt`, `lt`, `AND`, `OR`).
- It outputs exactly which approvals are required and the deterministic reason why (e.g., "Required because your project is in the Textile sector and generates wastewater").

### C. Application Tracking & Workflow
The platform tracks the state machine of each approval:
`NOT_STARTED` ➔ `DOCUMENTS_PREPARED` ➔ `SUBMITTED` ➔ `UNDER_REVIEW` ➔ `INSPECTION` ➔ `APPROVED` ➔ `REJECTED`
Users can upload required documents (PAN, GST, Site Plan, Effluent Treatment Plan) directly to the platform, and the system keeps track of SLA timelines and inspections.

### D. Continuous Compliance Dashboard
Securing an approval is only the beginning. The platform generates recurring compliance obligations (monthly/yearly) post-approval.
- The dashboard displays a **Compliance Score** (e.g., 87%).
- Users can view completed, upcoming, and overdue tasks in a calendar view.

### E. RAG: Regulatory Knowledge System (AI Assistant)
An AI Assistant is available to answer regulatory questions using **Retrieval-Augmented Generation (RAG)**.
- Official government documents are ingested, cleaned, chunked by legal section, and embedded into a Vector Database.
- When a user asks a question, the system retrieves the most relevant regulatory chunks and asks the LLM to explain the regulation based *only* on those chunks.
- **Hallucination Protection:** The system cites the exact source (e.g., "Maharashtra Pollution Control Board Notification 2023, Page 4"). If no source is found, the AI refuses to answer.

### F. Document Intelligence
Users upload documents, and the system securely stores them while utilizing OCR and text extraction to pull metadata (e.g., Company Name, License Number, Expiry Date). The system flags discrepancies for manual review.

---

## 4. System Architecture

The platform follows a **Modular Monolith** architecture, ensuring ease of deployment while keeping module boundaries strict for the Rules Engine, AI abstraction, and core business logic.

```text
[ SYSTEM ARCHITECTURE ]
       React SPA (Frontend)
           | (REST API)
    Node/Express Server (Backend)
      /    |     \
   Auth  Rules  AI/RAG
     \     |     /
    MongoDB Atlas (Document & Vector Store)
```

### Module Breakdown
- **Frontend:** React, Tailwind CSS, React Router (Responsible for UX, state, forms).
- **Backend:** Node.js, Express.js (Responsible for auth, business logic, workflow).
- **Database:** MongoDB Atlas (handles user data, rules, applications, and Vector embeddings for RAG).
- **Rules Engine:** Responsible for applicability logic.
- **AI/RAG:** Swappable AI Provider Abstraction (e.g., Gemini, Grok) responsible for text generation and embeddings.

---

## 5. Team Structure & Module Ownership

The project is designed to be built concurrently by a 5-person team without merge conflicts:

1. **Frontend Lead:** Overall UX/UI, routing, state management, API consumption, React components.
2. **Backend Core:** Server setup, database connection, authentication (JWT), routing structure, core models.
3. **Rules + Approval Intelligence:** Designing and implementing the deterministic rules engine, regulatory structured data, rule versioning.
4. **Workflow + Compliance:** Application state machines, post-approval tracking, renewals, SLA tracking, notifications.
5. **AI + RAG + Document Intelligence:** AI provider abstraction, RAG pipeline (Ingestion, Chunking, Embedding), MongoDB Vector Search integration, PDF parsing/OCR.

---

## 6. How the RAG Pipeline Works (Deep Dive)

1. **Upload:** Admin uploads Official Government Documents (PDFs).
2. **Processing:** The system extracts text and performs "Section-aware Chunking" (preserving legal section boundaries).
3. **Embeddings:** Text chunks are embedded and stored in MongoDB Vector Search with metadata (state, authority, effective date).
4. **Retrieval:** When a user asks a question, the system filters by the user's profile metadata and performs a vector search.
5. **Generation:** The top relevant chunks are passed to the LLM to generate a grounded, accurate response with a verifiable source citation.

---

## 7. Getting Started for Developers

### Prerequisites
- Node.js (v18+)
- MongoDB running locally (`mongodb://127.0.0.1:27017`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone git@github.com:priyanshuguptacoder/SIH-Hackathon.git
   cd SIH-Hackathon
   ```

2. **Install server dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies:**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up server environment variables:**

   Create `server/.env` (copy from `.env.example`):
   ```
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/sih-db
   JWT_SECRET=jwt_secret_sih_hackathon_2026
   SEED_SECRET=sih_seed_secret_2026_changeme
   ADMIN_NAME=Admin Authority
   ADMIN_EMAIL=admin@gmail.com
   ADMIN_PASSWORD=Admin@123
   ```

   Create `client/.env`:
   ```
   VITE_API_URL=http://localhost:5000
   ```

5. **Seed the database (approval types, rules, schemes):**
   ```bash
   cd server
   node src/scripts/seed.js
   ```

6. **Create the Admin account** *(run once — skips automatically if admin already exists):*
   ```bash
   cd server
   node src/scripts/createAdmin.js
   ```

7. **Start the servers** (two terminals):
   ```bash
   # Terminal 1 — Backend
   cd server
   npm run dev

   # Terminal 2 — Frontend
   cd client
   npm run dev
   ```

8. **Open the app:** `http://localhost:5173`

---

### Login Credentials

| Role | Email | Password | Lands on |
|------|-------|----------|----------|
| **Admin (Authority)** | `admin@gmail.com` | `Admin@123` | `/admin/dashboard` |
| **Industry** | Register at `/register` | your password | `/dashboard` |

> Both roles use the same `/login` page. The role stored in the database determines where you are redirected after login.

---

### After Deployment

To create the Admin account on a deployed server (where you cannot run local scripts):

```bash
curl -X POST https://your-api-url.com/admin/seed-admin \
  -H "x-seed-secret: sih_seed_secret_2026_changeme"
```

Set `SEED_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` as environment variables on your hosting platform before calling this endpoint.

---

## 8. License & Acknowledgements
This project is built for the Smart India Hackathon. It is licensed under the MIT License.
