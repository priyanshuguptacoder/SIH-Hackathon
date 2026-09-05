# SIH Hackathon - Backend Deployment Guide

## 1. Overview

This document outlines the deployment process for the **SIH-Hackathon Backend**. The backend is a modular monolith built with **Node.js, Express.js, and MongoDB**. 

**Team Responsibility Structure:**
- **Frontend** (`client/`): Deployed and managed separately by the Frontend Owner on Vercel.
- **Backend** (`server/`): Deployed and managed strictly by the Backend Owner.
- **AI/RAG** (AI/RAG specific logic): Handled entirely by Person 3.

**Example Production Flow:**
```text
Vercel Frontend (Frontend Owner)
       ↓
Production Backend (Backend Owner)
       ↓
MongoDB Atlas
```

*(Separately: Person 3 manages the AI/RAG services, prompts, and vector deployments).*

---

## 2. Backend Structure

The backend implementation lives in the `server/` directory:

```text
server/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/      # Verification and seeding scripts
│   ├── services/
│   ├── utils/
│   └── index.js      # Application entry point
├── tests/
├── package.json
└── .env.example
```

---

## 3. Prerequisites

To deploy and run the backend, the target environment must support:
*   **Node.js** (v18+ recommended)
*   **npm**
*   **MongoDB** (MongoDB Atlas recommended for production)
*   **Git**

---

## 4. Local Setup

If testing the deployment configuration locally before pushing to production, run the following:

```bash
git clone https://github.com/priyanshuguptacoder/SIH-Hackathon.git
cd SIH-Hackathon/server
npm ci
```

Configure your environment variables in `.env` based on `server/.env.example`.

---

## 5. Environment Variables

The backend relies on strict environment variable validation. Ensure the following are configured in your production environment:

### Required Backend Variables

| Variable | Purpose |
| :--- | :--- |
| `PORT` | The port the Express application will listen on. Usually provided dynamically by the hosting platform. |
| `MONGODB_URI` | The connection string for your MongoDB Atlas production database. |
| `JWT_SECRET` | A secure, long random string used to sign authentication tokens. |
| `CLIENT_URL` | The exact URL of the deployed Vercel frontend (e.g., `https://frontend.vercel.app`). Used to secure CORS. |

### AI/RAG Variables
AI and RAG features require additional configurations (e.g., `GEMINI_API_KEY`). **Person 3** will provide or configure these variables on the deployment platform. Do not remove or alter AI variables if found in the environment dashboard.

---

## 6. MongoDB Setup

The backend requires a standard connection to MongoDB. 

*   Set the `MONGODB_URI` environment variable.
*   Ensure the database cluster accepts network connections from your backend deployment platform (allowlist IP ranges if necessary).

**Seeding Scripts:**
The repository provides practical seeding tools under `server/src/scripts/`:
*   `node src/scripts/seed.js` — Seeds basic Approvals, Regulatory Rules, and Compliance Rules.
*   `node src/scripts/createAdmin.js` — Utility script to generate a root Admin user.
*   `node src/scripts/seedChunks.js` — Script owned by Person 3 to seed AI/RAG document chunks.

---

## 7. Authentication

The backend utilizes strict stateless JWT Authentication.
*   **Tokens:** Sent as `Authorization: Bearer <token>`.
*   **Roles:** The system enforces dual roles (`Industry` and `Admin`). Certain operations strictly check `req.user.role` or match `req.user.id` against industry profiles.
*   **Secrets:** Never expose your `JWT_SECRET`. If it is compromised, it must be rotated immediately in your environment variables.

---

## 8. CORS / Frontend Connection

To protect the API in production, the backend configures CORS dynamically.

```text
Vercel Frontend
      ↓
Backend CORS (Validates against CLIENT_URL)
      ↓
API Endpoints
```

**CRITICAL:** 
*   Ensure `CLIENT_URL=<actual Vercel frontend origin>` is configured in your backend environment variables.
*   **Do NOT use `origin: "*"` as a quick fix.** Doing so compromises the security of the authenticated endpoints. The CORS middleware is strictly designed to fall back to `localhost` for development, and whitelist `CLIENT_URL` for production.

---

## 9. PORT / Production Startup

The `package.json` standardizes the startup script:

```bash
npm start
```
*(Which runs `node src/index.js`)*

Inside `index.js`, the server dynamically binds using:
```javascript
const PORT = process.env.PORT || 5000;
```
Always let your hosting platform (Render, Railway, Heroku, etc.) define the `PORT` environment variable automatically. Do not hard-code a port.

---

## 10. Deployment Platform

The Express architecture is container/PaaS agnostic. It can be successfully deployed on:
*   **Render / Railway / Heroku** (Recommended for ease of Node.js deployments)
*   **VPS** (DigitalOcean / AWS EC2 via PM2 or Docker)

*Note: Serverless environments (like AWS Lambda or Vercel Serverless Functions) are NOT recommended for this backend without significant refactoring due to how standard Express routes and local file uploads operate.*

---

## 11. Production Deployment Steps

1.  Pull the latest `main` branch.
2.  Connect your hosting platform to the repository and set the root directory to `server/`.
3.  Configure the Build/Install command: `npm ci`
4.  Configure the Start command: `npm start`
5.  Configure production environment variables (`MONGODB_URI`, `JWT_SECRET`).
6.  Deploy the backend.
7.  Verify the root health endpoint (`GET /`).
8.  Provide the production backend URL to the Frontend Owner.
9.  Once the frontend is deployed, retrieve the frontend URL and add it to the backend environment variables as `CLIENT_URL`.
10. Restart/Redeploy the backend to enforce the new CORS rule.
11. Test the complete flow (Registration, Industry Creation, Document Upload).

---

## 12. Health Check

The backend handles requests at the root endpoint to serve as a basic liveliness probe:

**Endpoint:** `GET /`

A successful response (HTTP 200/404 handling depending on explicit root route setup) or active console logs upon startup (`🚀 Server running at...`) indicates the Node instance is healthy and the port has successfully bound.

---

## 13. API Overview

The following core modules are exposed and supported for the frontend:

*   `/auth` - Registration, login, and token validation.
*   `/industries` - Industry profile management and role validation.
*   `/approvals` - Approval roadmap evaluation and retrieval.
*   `/applications` - Application state machine (Submitted, Review, Inspection, Approved).
*   `/documents` - Secure file upload, storage, and retrieval.
*   `/compliance` - Recurring compliance item management.
*   `/schemes` - Government scheme matching.
*   `/notifications` - Platform alert system.
*   `/inspections` - Scheduling and status reporting for regulatory inspections.
*   `/admin` - Administrative overrides, rule configuration, and audit logs.

*(Note: The `/ai` routes exist but their deployment and logic are strictly managed by Person 3).*

---

## 14. File Upload / Storage

**⚠️ CRITICAL DEPLOYMENT LIMITATION ⚠️**

The backend implementation for `POST /documents/upload` utilizes `multer.diskStorage`. Files are saved locally to the `../../uploads` directory on the server's filesystem.

If deploying to a platform with an **ephemeral filesystem** (e.g., standard Render web services, standard Heroku dynos), **user-uploaded documents will be permanently lost whenever the server restarts or deploys.**

For an SIH prototype, this may be acceptable for demonstration. However, for true persistence, the deployment environment MUST provide an attached persistent disk/volume. (Do NOT redesign the code to use S3 yourself; stick to the existing implementation and provision standard attached storage).

---

## 15. Seed / Admin Setup

To log into the Admin Dashboard for the first time on production, you must seed an admin user:

1.  Ensure your backend is connected to the production MongoDB instance.
2.  Execute the admin creation script locally or via your deployment console:
    ```bash
    node src/scripts/createAdmin.js
    ```
3.  Review the script to ensure you understand the credentials it generates.

---

## 16. Production Security Checklist

- [ ] Strong, randomized `JWT_SECRET` configured.
- [ ] Production `MONGODB_URI` securely stored.
- [ ] No `.env` files accidentally committed to GitHub.
- [ ] `CLIENT_URL` explicitly set to the final Vercel frontend origin.
- [ ] No manual `origin: "*"` overrides added to `server/src/index.js`.
- [ ] Hosting platform defines the `PORT`.
- [ ] Application E2E tested against production MongoDB.

---

## 17. Testing Before Deployment

You can thoroughly verify the backend functionality before deploying by using the provided comprehensive scripts.

```bash
cd server
npm ci
npm test                          # Runs 60/60 Jest unit tests
node src/scripts/e2e-verify.js    # Runs 41/41 End-to-End Atlas checks
```
Ensure all 41 E2E tests pass cleanly before handing the backend off.

---

## 18. Frontend Handoff

Once your deployment finishes, **provide the following to the Frontend Owner**:

1.  **Backend Production URL** (e.g., `https://sih-backend.onrender.com`)

The frontend owner will configure the Vercel application using this URL. 

Once the frontend deployment is complete, the frontend owner will give you their production URL. You must then:
1.  Add their URL to your `CLIENT_URL` environment variable.
2.  Restart/redeploy your backend instance to apply the CORS protection.

---

## 19. AI/RAG Handoff

### AI/RAG Deployment
AI/RAG is deployed separately by Person 3.

The backend deployment owner must not modify the AI/RAG implementation as part of ordinary backend deployment. Coordinate strictly at the API/integration boundary. Person 3 will configure `GEMINI_API_KEY` and handle vector/chunk seeding dynamically.

---

## 20. Troubleshooting

*   **MongoDB connection failure:** Double check `MONGODB_URI` and ensure your deployment platform's IP is allowlisted in the Atlas Network Access panel.
*   **CORS error:** Ensure `CLIENT_URL` matches the frontend's origin exactly (no trailing slash). Restart the backend if it was recently updated.
*   **Invalid JWT / authentication failure:** Check if the `JWT_SECRET` changed during deployment, causing older tokens to invalidate. Clear local storage on the frontend.
*   **Backend not starting:** Verify the platform runs `npm ci` before `npm start`, and ensure `package.json` paths are correct.
*   **Incorrect PORT:** Remove any hardcoded `.env` PORT settings in production. Allow the platform to inject `process.env.PORT`.
*   **Upload persistence issue:** If previously uploaded files disappear after a redeployment, your platform uses ephemeral storage. Provision a persistent disk volume.
