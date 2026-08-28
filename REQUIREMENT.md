# REQUIREMENT.md: Industrial Approval & Compliance Management Platform

## 1. Executive Summary
We are building a Smart India Hackathon (SIH) prototype for an **Industrial Approval & Compliance Management Platform**.
**Who uses it:** Industry users (business owners, compliance officers) who want to set up and operate factories, and administrators who manage regulatory data.
**What problem it solves:** It streamlines the complex, opaque, and fragmented process of industrial approvals, continuous compliance, and government scheme discovery.
**Why it matters:** Setting up an industry is currently a high-friction process requiring navigation of multiple government departments, obscure legal texts, and disconnected timelines. Simplifying this journey accelerates economic growth and reduces compliance anxiety.
**What makes it different:** Existing single-window portals often just provide a place to submit applications. Our platform is an intelligent layer that actively helps the user understand *what* applies, *why* it applies (using deterministic rules), *what* documents are needed, and *how* to stay compliant, backed by a RAG-powered AI assistant that grounds its answers in verified official sources.

## 2. Problem Definition
The industrial regulatory landscape is not just "too much paperwork". It is a multifaceted problem:
- **Fragmented Approvals:** A single factory might need clearance from the pollution board, fire department, labor department, and local municipality.
- **Industry & Location Specificity:** Requirements vary drastically based on the exact sector (e.g., textiles vs. electronics) and location (state, district, or specific zones).
- **Dynamic Thresholds:** Approvals depend on quantitative metrics like investment amount, number of employees, or water consumption.
- **Project Stage:** Pre-establishment requires different approvals than pre-operation or expansion.
- **Environmental Conditions:** Generating hazardous waste or wastewater triggers specific stringent requirements.
- **Application Tracking:** Businesses struggle to track multiple applications across disconnected departmental portals.
- **Recurring Compliance & Renewals:** Securing an approval is only the beginning. Ongoing filings, audits, and renewals are easily missed, leading to penalties.
- **Government Schemes:** Thousands of incentive schemes exist, but matching a project's exact profile to eligibility criteria is difficult.
- **Legal Ambiguity:** Regulatory notifications are dense, legalistic, and change frequently, making it difficult for a layperson to comprehend their obligations.

## 3. Product Vision
The platform is envisioned as an intelligent regulatory workspace.
- **Primary User:** The Industry User, who creates a project profile, receives a tailored approval roadmap, tracks applications, and manages ongoing compliance.
- **Secondary/Admin User:** The system administrator who curates the deterministic rules, uploads verified regulatory documents, and monitors system health.
- **Main Value Proposition:** Transforming regulatory ambiguity into a clear, actionable, and explainable roadmap.
- **Core Workflow:** Profile Creation -> Rule-based Applicability Analysis -> Document Management -> Application Tracking -> Continuous Compliance.
- **Trust Model:** The system explicitly separates deterministic rule-based outputs, AI-generated explanations, and official source citations. The AI is a helper, not the decision-maker.
- **Scope of MVP:** A demonstratable prototype focusing on 1 strong sector, 1-2 states, ~15-20 curated rules, and ~10-20 authoritative documents to prove depth over fake breadth.

## 4. ACTUAL WEBSITE REQUIREMENTS
The website must provide a complete, professional user experience.

### Landing
- **Purpose:** Explain the platform and start the user journey.
- **User:** Unauthenticated visitors.
- **Inputs:** None.
- **UI Components:** Hero section, Problem statement, "How it works" steps, Benefits, Call-to-Action (CTA), Trust/Source messaging.
- **Actions:** Click "Start Project" (redirects to Login/Register).
- **API Interaction:** None.
- **Expected Output:** Static informational page.

### Login
- **Purpose:** Authenticate existing users.
- **User:** Unauthenticated visitors.
- **Inputs:** Email, Password.
- **UI Components:** Form fields, Submit button, "Forgot Password" link, "Register" link.
- **Actions:** Submit credentials.
- **API Interaction:** `POST /auth/login`
- **Expected Output:** JWT Token, redirect to Dashboard.
- **Error State:** "Invalid credentials".

### Register
- **Purpose:** Onboard new users.
- **User:** Unauthenticated visitors.
- **Inputs:** Name, Email, Password, Confirm Password.
- **UI Components:** Form fields, Submit button, "Login" link.
- **Actions:** Submit registration.
- **API Interaction:** `POST /auth/register`
- **Expected Output:** Account created, JWT Token, redirect to Industry Profile Wizard.
- **Error State:** "Email already exists", "Passwords do not match".

### Dashboard
- **Purpose:** Central hub for authenticated industry users.
- **User:** Industry User.
- **Inputs:** None (driven by API data).
- **UI Components:** Project summary card, Approval Progress circular chart, Application status list, Compliance Score widget, Upcoming Deadlines timeline, Potential Schemes widget, Floating AI Assistant button.
- **Actions:** Click into specific modules (Approvals, Compliance, etc.).
- **API Interaction:** `GET /industries/me`, `GET /applications`, `GET /compliance`.
- **Expected Output:** Rendered widgets.
- **Empty State:** "No projects found. Create your first industry profile."
- **Loading State:** Skeleton loaders for widgets.

### Industry Profile Wizard
- **Purpose:** Collect relevant information to determine regulatory applicability.
- **User:** Industry User.
- **Inputs:** 
  - Business: Company name, sector.
  - Location: State, district, project location, pincode.
  - Scale: Investment, employees, production capacity.
  - Activity: Manufacturing activity, processes.
  - Environment: Water usage, wastewater generation, hazardous waste.
  - Project Stage: Pre-establishment, construction, pre-operation, operational, expansion.
- **UI Components:** Multi-step form, progress bar, tooltips for complex fields.
- **Actions:** Next, Previous, Submit.
- **API Interaction:** `POST /industries` or `PUT /industries/:id`
- **Expected Output:** Profile saved, prompt to "Analyze My Project".

### Project Analysis
- **Purpose:** Run the rules engine against the profile.
- **User:** Industry User.
- **Inputs:** Industry ID.
- **UI Components:** Progress indicator showing "Analyzing Sector...", "Checking State Rules...", "Evaluating Environmental Impact...".
- **Actions:** Automatic upon clicking "Analyze".
- **API Interaction:** `POST /approvals/analyze`
- **Expected Output:** Redirect to Approval Roadmap.
- **Loading State:** Animated analysis steps.

### Approval Roadmap
- **Purpose:** Display the tailored list of required approvals.
- **User:** Industry User.
- **Inputs:** Output of Project Analysis.
- **UI Components:** Categorized list (e.g., Pre-establishment, Environmental), Status badges (Required, Possibly Applicable), Dependencies graph or list.
- **Actions:** Click an approval to view details.
- **API Interaction:** `GET /approvals/roadmap/:industryId`
- **Expected Output:** List of matching rules and their corresponding approvals.

### Approval Details
- **Purpose:** Show exactly why an approval is needed and what to do next.
- **User:** Industry User.
- **Inputs:** Approval ID, Industry ID.
- **UI Components:** 
  - Header: Approval Name, Authority.
  - Reason Block: "Why does this apply?" (Deterministic rule output).
  - Documents Checklist: Required documents.
  - Status Timeline: Not Started -> Applied -> Approved.
  - Official Link.
- **Actions:** Upload Document, Mark as Applied.
- **API Interaction:** `GET /approvals/:id`, `GET /documents?approvalId=:id`.
- **Expected Output:** Detailed view.

### Document Management
- **Purpose:** Central repository for uploaded files.
- **User:** Industry User.
- **Inputs:** Files (PDF, JPG).
- **UI Components:** Drag-and-drop upload zone, List of uploaded documents with extraction status, tags.
- **Actions:** Upload, Delete, View, Trigger Extraction.
- **API Interaction:** `POST /documents/upload`, `GET /documents`.
- **Expected Output:** Saved file metadata, trigger async extraction.

### Application Tracking
- **Purpose:** Monitor the state of submitted applications.
- **User:** Industry User.
- **Inputs:** Status updates (manual for prototype).
- **UI Components:** Kanban board or timeline view (Submitted, Under Review, Inspection, Approved).
- **Actions:** Update status.
- **API Interaction:** `PUT /applications/:id/status`.

### Compliance Dashboard
- **Purpose:** Track post-approval obligations.
- **User:** Industry User.
- **Inputs:** None (data fetched).
- **UI Components:** Compliance Score, List of items sorted by due date, filter by status (Upcoming, Due, Overdue, Completed).
- **Actions:** View item, Mark as Completed.
- **API Interaction:** `GET /compliance`.

### Compliance Detail
- **Purpose:** Specifics of a recurring obligation.
- **User:** Industry User.
- **Inputs:** Compliance ID.
- **UI Components:** Requirement text, Due date, Recurrence (e.g., Monthly), Related Approval, Source.
- **Actions:** Upload proof, Mark Completed.
- **API Interaction:** `GET /compliance/:id`, `PUT /compliance/:id`.

### Renewals
- **Purpose:** Track expiring approvals.
- **User:** Industry User.
- **UI Components:** List of approvals nearing expiry.

### Inspection/SLA
- **Purpose:** Track government SLA deadlines and inspection dates.
- **User:** Industry User.
- **UI Components:** Table with Expected Completion Date, Current Status, SLA Warning badges.

### Government Schemes
- **Purpose:** Display matched incentive schemes.
- **User:** Industry User.
- **UI Components:** Cards showing Scheme Name, Potential Eligibility, Benefits. Note disclaimer: "Potentially eligible based on available criteria."
- **API Interaction:** `GET /schemes/matched/:industryId`.

### AI Assistant
- **Purpose:** Context-aware chat for regulatory questions.
- **User:** Industry User.
- **Inputs:** Natural language query.
- **UI Components:** Chat window (floating or dedicated page), Message bubbles, Source citation links.
- **Actions:** Send message.
- **API Interaction:** `POST /ai/chat`.
- **Expected Output:** AI response with structured citations.
- **Loading State:** "AI is typing..." / "Searching regulatory sources..."

### Notifications
- **Purpose:** Alerts for deadlines, status changes.
- **UI Components:** Dropdown list, unread badge.

### Admin Dashboard
- **Purpose:** System overview for admins.
- **User:** Admin User.
- **UI Components:** Metrics on active users, total applications, system health.

### Admin Rules
- **Purpose:** Manage the deterministic rules engine.
- **User:** Admin User.
- **UI Components:** JSON editor or visual rule builder.

### Admin Regulations
- **Purpose:** Upload official PDFs for RAG.
- **User:** Admin User.
- **UI Components:** File upload, Metadata form (Effective Date, Authority, Version).
- **Actions:** Upload, Ingest, Chunk.
- **API Interaction:** `POST /admin/regulations`.

### Admin Schemes
- **Purpose:** Manage scheme eligibility criteria.
- **User:** Admin User.

### Admin Documents/Sources
- **Purpose:** Manage the regulatory knowledge base.
- **User:** Admin User.

## 5. COMPLETE USER JOURNEY
Let's walk through a concrete example.
**User Profile:** ABC Textiles Pvt Ltd, Maharashtra, Pune, ₹20 Crore Investment, 100 Employees, Dyeing Activity, Generates Wastewater, Pre-establishment Stage.

1. **Landing:** User visits the site, reads the value prop, and clicks "Start Project".
2. **Register:** User creates an account.
3. **Create Industry Profile:** User fills the multi-step wizard with the details above.
4. **Validation:** System ensures required fields (e.g., sector, state, investment) are present.
5. **Analyze:** User clicks "Analyze My Project".
6. **Rule Evaluation:** Backend rules engine evaluates the profile. It sees `sector === 'Textiles' AND generatesWastewater === true` -> triggers "Consent to Establish (Pollution)".
7. **Approval Roadmap:** User sees a list of ~11 applicable requirements, prioritized by dependencies.
8. **Approval Detail:** User clicks "Consent to Establish".
9. **Reason Displayed:** "Required because your project is in the Textile sector and generates wastewater."
10. **Document Checklist:** User sees they need a "Site Plan" and "Water Balance Diagram".
11. **Upload Document:** User uploads the "Site Plan" PDF.
12. **Extraction:** (Mocked/Basic) System extracts the project name from the PDF to verify it matches the profile.
13. **Validation:** System marks document as "Ready".
14. **Application:** User clicks "Mark as Applied" (mocking the submission to a gov portal).
15. **Status Tracking:** Application moves to "Submitted".
16. **Inspection:** User updates status to "Inspection Scheduled".
17. **Approval:** User marks as "Approved" and enters the approval date.
18. **Compliance:** System automatically generates a recurring compliance item: "Submit Monthly Water Quality Report".
19. **Renewal:** System schedules a renewal alert for 3 years later.
20. **AI Question:** User asks the AI Assistant: "What are the specific parameters for textile wastewater in Maharashtra?"
21. **Source Citation:** The RAG system searches uploaded regulations, the LLM generates a response, and provides a citation: "Maharashtra Pollution Control Board Notification 2023, Page 4, Section 2."

## 6. CORE ARCHITECTURE
**Primary Architecture: Modular Monolith**
- **Frontend:** React, Tailwind CSS, React Router.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB Atlas (with Vector Search).

**Why a Modular Monolith?**
For a 4-5 person hackathon team, a modular monolith minimizes operational overhead, avoids network latency between services, simplifies deployment, and keeps cognitive load low. 
We are explicitly NOT using microservices, Kafka, or Kubernetes because:
- The system does not have massive independent scaling requirements on day one.
- Distributed infrastructure adds points of failure and complexity that detract from building the core product value.
- A well-structured monolith with clear module boundaries (Auth, Industries, Approvals, AI, etc.) can be easily refactored into microservices later if needed.

## 7. FIVE-PERSON TEAM OWNERSHIP
To ensure parallel development and avoid conflicts, the team is divided as follows:

### Person 1 — Frontend
- **Responsibilities:** Overall UX/UI, routing, state management, API consumption.
- **Owned modules:** React application, Tailwind configuration, Dashboard, Forms, Approval UI, Compliance UI, Document UI, AI Chat UI.
- **Dependencies:** Needs API contracts (`API.md`) from Backend.
- **Outputs to others:** A functional interface to demo backend features.

### Person 2 — Backend Core
- **Responsibilities:** Server setup, database connection, authentication, API orchestration.
- **Owned modules:** Node.js/Express scaffolding, MongoDB models (`users`, `industries`), JWT Auth, routing structure, error handling middleware.
- **Dependencies:** Needs schema definitions from Team.
- **Outputs to others:** Secured endpoints, database access layers.

### Person 3 — Rules + Approval Intelligence
- **Responsibilities:** Designing and implementing the deterministic rules engine.
- **Owned modules:** Rules evaluation logic, matching algorithms, rule versioning, regulatory structured data models (`approvals`, `rules`).
- **Dependencies:** Needs Industry Profile data structure from Person 2.
- **Outputs to others:** The core `analyze` API that returns the Approval Roadmap and reasons.

### Person 4 — Compliance + Workflow
- **Responsibilities:** Application state machines and post-approval tracking.
- **Owned modules:** Application workflow (states: submitted, approved), Compliance generation (recurring tasks), Renewals, SLA tracking, Notifications, Inspections.
- **Dependencies:** Needs Approval data from Person 3.
- **Outputs to others:** APIs for tracking status and viewing compliance scores.

### Person 5 — AI + RAG + Document Intelligence
- **Responsibilities:** The entire unstructured data and AI layer.
- **Owned modules:** AI provider abstraction, RAG pipeline (Ingestion, Chunking, Embedding), MongoDB Vector Search integration, PDF parsing/OCR, Document entity extraction, AI Assistant logic.
- **Dependencies:** Needs regulatory PDFs from Admin, Document upload endpoints from Person 2.
- **Outputs to others:** Intelligent endpoints for Chat and Document Validation.

**Four-Person Fallback:** If only 4 members are available, Person 4 and Person 5 are combined. This person will handle Workflow, Compliance, and the AI/RAG layer, utilizing high-level abstractions to save time.

## 8. MODULE DEPENDENCY MAP
**Core Workflow Dependencies:**
```text
Industry Profile (Owned by Person 2)
      ↓
Rules Engine (Owned by Person 3)
      ↓
Approval Roadmap (Owned by Person 3)
      ↓
Document Requirements (Owned by Person 3)
      ↓
Document Service (Owned by Person 2/5)
      ↓
Application Workflow (Owned by Person 4)
      ↓
Compliance Engine (Owned by Person 4)
```

**AI Assistant Dependencies:**
```text
AI Assistant (Owned by Person 5)
   ├── Industry data (Read-only access)
   ├── Approval data (Read-only access)
   ├── Compliance data (Read-only access)
   ├── Document status (Read-only access)
   └── RAG (Vector Search logic)
```
*Note: The AI Assistant module queries other modules but does NOT mutate their core state.*

## 9. RULE ENGINE — VERY DETAILED
The Rules Engine is the deterministic heart of the system. **LLM is NOT used to make deterministic applicability decisions.**

**1. Purpose:** Evaluate an Industry Profile against a set of rules to output Applicable Approvals and deterministic Reasons.
**2. Inputs:** Industry Profile JSON, Array of Rule JSON objects.
**3. Processing:**
- **Rule Object Structure:**
  ```json
  {
    "ruleId": "R-101",
    "approvalId": "APP-001",
    "condition": {
      "operator": "AND",
      "rules": [
        { "field": "sector", "operator": "eq", "value": "Textiles" },
        { "field": "generatesWastewater", "operator": "eq", "value": true }
      ]
    },
    "explanationTemplate": "Required because your project is in the {sector} sector and generates wastewater.",
    "priority": 1,
    "effectiveDate": "2023-01-01",
    "version": "1.0"
  }
  ```
- **Operators Supported:** `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `between`, `in`, `AND`, `OR`.
- **Condition Tree:** Evaluates recursively.
- **Field Resolution:** Maps dot-notation fields (e.g., `profile.scale.investment`) to user data.
- **Missing Values:** If a field required by a rule is missing, the rule evaluates to `false` or throws a validation error requesting the data.
- **Invalid Rules:** Logged and ignored during evaluation to prevent crashes.
- **Rule Priority & Dependencies:** If Rule A (requires Approval A) and Rule B (requires Approval B) match, and Approval B depends on Approval A, the engine outputs the roadmap with correct ordering.
- **Explanation Generation:** Replaces variables in `explanationTemplate` with actual profile data.
**4. Outputs:** Array of matched Approval IDs, Reasons, and Dependency graph.
**5. Integration:** Called by the `/approvals/analyze` endpoint.

## 10. APPROVAL ROADMAP
**1. Purpose:** Provide a clear, actionable list of requirements.
**2. Inputs:** Output of Rules Engine.
**3. Processing:** 
- Maps Approval IDs to full Approval definitions in the DB.
- Resolves dependencies (e.g., "Cannot apply for Factory License until Pollution Consent is Approved").
- **Status Behavior:**
  - If required document is missing -> Status: "Documents Pending".
  - If dependency is incomplete -> Status: "Blocked by [Dependency Name]".
  - If application is rejected -> Status: "Rejected", requires re-submission.
  - If approval expires -> Status: "Expired", triggers renewal workflow.
**4. Outputs:** Structured JSON containing applicability, status, reason, authority, documents, dependencies, official link, timeline, validity, source.
**5. Integration:** Displayed on the Frontend Dashboard.

## 11. REGULATORY KNOWLEDGE BASE
**1. Purpose:** Store verified regulatory texts for RAG and citation.
**2. Inputs:** PDFs or text uploaded by Admin.
**3. Processing:**
- **Source Types:** Acts, Rules, Notifications, Guidelines, Official FAQs.
- **Verification:** Only Admin can mark a source as 'verified'.
- **Metadata:** Title, authority, state, industry tags, documentType, version, effectiveDate, page number, section.
- **Hierarchy:** Acts > Rules > Notifications. Newer versions supersede older ones (Active/Inactive state).
**4. Outputs:** Clean text chunks with rich metadata stored in MongoDB.
**5. Integration:** Queried by Vector Search.

## 12. RAG — VERY DETAILED
**1. Purpose:** Answer regulatory questions accurately using verified sources.
**2. Inputs:** User query, Regulatory PDFs.
**3. Processing Pipeline:**
- **Source Ingestion:** Admin uploads PDF.
- **Parse & Clean:** Extract text, remove headers/footers.
- **Section-aware Chunking:** Break text into manageable chunks (e.g., 500 tokens), preserving section boundaries (e.g., "Section 4.1"). Why? To maintain legal context.
- **Metadata Tagging:** Attach state, authority, effective date to each chunk.
- **Embedding:** Convert chunk to vector using an Embedding model (e.g., text-embedding-004).
- **MongoDB Vector Search:** Store vectors.
- **Retrieval:** User asks query -> embed query -> `$vectorSearch` in MongoDB.
- **Filtering:** Pre-filter chunks based on User Profile (e.g., only search "Maharashtra" rules).
- **Top K:** Retrieve top 5 most relevant chunks.
- **Context Construction:** Combine chunks into a prompt.
- **LLM Generation:** Ask LLM to answer *only* using the provided context.
- **Low-confidence Fallback:** If distance metric is poor, LLM must reply: "No sufficiently verified source was found in the available regulatory knowledge base. Please verify with the relevant authority."
- **Citation:** Append source metadata (Title, Page, Section) to the response.
**4. Outputs:** Grounded natural language answer + citations.
**5. Integration:** AI Assistant module.

## 13. AI PROVIDER ABSTRACTION
**DO NOT lock the system to Gemini, Grok, or any specific API.**
**1. Purpose:** Ensure the prototype survives API limits, provider outages, or cost issues.
**2. Architecture:**
```typescript
interface AIProvider {
  generateText(prompt: string): Promise<string>;
  generateEmbeddings(text: string): Promise<number[]>;
  chat(messages: Message[], tools: Tool[]): Promise<Response>;
}
class GeminiProvider implements AIProvider { /* ... */ }
class GrokProvider implements AIProvider { /* ... */ }
class AIService {
  constructor(private provider: AIProvider) {}
  // application logic uses AIService
}
```
**3. Implementation Time Selection:** Based on availability, rate limits, context window, structured output support, and free-tier conditions.

## 14. AI ASSISTANT
**1. Purpose:** Context-aware helper for the user.
**2. Inputs:** Natural language.
**3. Processing:** LLM decides whether to answer directly (using RAG) or call a tool.
- **Tools:**
  - `getIndustryProfile()`: Returns user's data. Use when asked "What is my investment?"
  - `getApplicableApprovals()`: Returns rules engine output. Use when asked "Do I need a fire NOC?" (DO NOT use LLM reasoning, return the deterministic result).
  - `getComplianceStatus()`: Database query. Use for "What is due next month?"
  - `searchRegulations()`: Triggers RAG. Use for "Explain the wastewater parameters."
**4. Outputs:** Chat response.
**5. Integration:** Frontend Chat UI.

## 15. DOCUMENT INTELLIGENCE
**1. Purpose:** Assist in managing uploaded documents.
**2. Inputs:** Uploaded image/PDF.
**3. Processing:**
- **Upload & Security:** Validate file type and size.
- **Storage:** Save to cloud storage or local disk (for prototype).
- **Extraction:** Use OCR or a multimodal LLM to extract fields (Company Name, License Number, Expiry Date).
- **Classification:** Determine document type (e.g., "Is this a Site Plan?").
- **Validation:** Check if extracted Company Name matches Profile Company Name.
- **Confidence & Mismatch:** Flag low confidence or mismatches for manual review.
- **Disclaimer:** Explicitly state that extraction is for convenience and does NOT constitute official authentication.
**4. Outputs:** Extracted JSON metadata attached to the Document record.
**5. Integration:** Document Service.

## 16. APPLICATION WORKFLOW
**1. Purpose:** Track the lifecycle of an approval application.
**2. Processing (State Machine):**
- `NOT_STARTED`: Initial state. Required: None.
- `DOCUMENTS_PREPARED`: Required: All mandatory documents uploaded.
- `SUBMITTED`: Required: User clicks submit (mocking gov portal). Records submission date.
- `UNDER_REVIEW`: Triggered manually or via mock API.
- `INSPECTION`: Triggered manually. Records inspection date.
- `APPROVED`: Triggered manually. Records approval date, generates Compliance Items.
- `REJECTED`: Triggered manually. Records remarks, allows transition back to `DOCUMENTS_PREPARED`.

## 17. COMPLIANCE ENGINE
**1. Purpose:** Manage ongoing obligations.
**2. Inputs:** Approval event, Rules engine definitions.
**3. Processing:**
- Upon Approval, system checks if the approval has recurring compliance rules.
- Generates `compliance_items` in the DB.
- **Recurrence:** ONE_TIME, MONTHLY, QUARTERLY, ANNUAL, RENEWAL.
- **Statuses:** UPCOMING (due in > 30 days), DUE (due in <= 30 days), OVERDUE (past due date), COMPLETED.
- **Compliance Score:** `(Completed Items / (Completed + Due + Overdue Items)) * 100`. Labeled strictly as a workflow metric.
**4. Outputs:** Compliance list and score.

## 18. SLA + INSPECTION
**1. Purpose:** Track government responsiveness.
**2. Processing:**
- **SLA Tracking:** If an application is `SUBMITTED`, system calculates `Expected Completion Date` based on statutory SLA (e.g., 30 days).
- **Warnings:** Normal, SLA Approaching (< 5 days left), SLA Breached (past expected date).
- **Prototype vs Production:** In the prototype, these are simulated/manual. In production, this would tie into real government tracking APIs.

## 19. GOVERNMENT SCHEMES
**1. Purpose:** Recommend financial/support schemes.
**2. Inputs:** Industry Profile.
**3. Processing:** Similar to Rules Engine. Evaluates profile against Scheme Eligibility Rules.
**4. Outputs:** Matched schemes with reasons. Must include disclaimer: "Potentially eligible based on available criteria."

## 20. GOVERNMENT INTEGRATION
**Four Modes of Integration:**
1. **Real API:** (Production) Direct server-to-server sync.
2. **Official Deep Link:** (Prototype) Button links to the exact government portal page (e.g., "Apply on MAITRI").
3. **Manual Tracking:** (Prototype) User updates status themselves based on emails they receive.
4. **Mock Integration:** (Prototype) A simulated API endpoint that automatically approves applications after 30 seconds for demo purposes.
*The prototype heavily utilizes 2, 3, and 4. We do not pretend every government system has an open API.*

## 21. DATABASE REQUIREMENTS
Using MongoDB Atlas.
- `users`: Authentication details, role, password hash.
- `industries`: The Industry Profile. Owned by user.
- `approvals`: Dictionary of all possible approvals.
- `regulatory_rules`: The deterministic logic. Related to `approvals`.
- `regulations`: Metadata for uploaded PDFs.
- `regulation_chunks`: Vector store for RAG. Related to `regulations`. Index: Atlas Vector Search Index.
- `applications`: Instances of a user applying for an approval. Status tracking.
- `documents`: Uploaded files.
- `compliance_items`: Generated obligations.
- `schemes`: Available government schemes.

## 22. API REQUIREMENTS
RESTful design.
- `/auth`: `POST /register`, `POST /login`
- `/industries`: `GET /me`, `POST /`, `PUT /:id`
- `/approvals`: `POST /analyze` (Runs rules), `GET /roadmap/:industryId`
- `/applications`: `POST /`, `PUT /:id/status`
- `/documents`: `POST /upload` (multipart/form-data)
- `/compliance`: `GET /`
- `/ai`: `POST /chat`
- `/admin`: Endpoints for managing rules and regulations.

## 23. SECURITY
- **Authentication:** JWT in HttpOnly cookies or Authorization header.
- **Passwords:** bcrypt hashing.
- **Authorization:** RBAC (Admin vs Industry). Ownership checks (User A cannot view User B's profile).
- **Validation:** Strict backend validation (Zod/Joi) to prevent NoSQL injection.
- **Uploads:** File type (PDF/JPG only), size limits (e.g., 5MB).
- **Secrets:** `MONGODB_URI`, `JWT_SECRET`, AI API keys stored in `.env`.
- **AI Security:** Prompt injection defense instructions in system prompts.

## 24. UX / DESIGN SYSTEM
- **Layout:** Sidebar navigation, top header for profile/logout.
- **Dashboard Style:** Clean, enterprise-SaaS look. Tailwind UI or Shadcn components.
- **Status Indicators:** Green (Approved/Completed), Yellow (Under Review/Due), Red (Rejected/Overdue), Gray (Not Started).
- **Trust Indicators:** Explicitly label data sources: `[Verified Source]`, `[Rule-Based Result]`, `[AI Explanation]`.

## 25. VIBE-CODING / MULTI-AI DEVELOPMENT
**Problem:** 5 developers using AI tools (Cursor, Copilot, Antigravity) will cause architectural drift because AIs lack global context.
**Solution:** Strict adherence to shared contracts.
All contracts (DB schema, API shapes, auth, progress log) live in this file, Sections 39–42. Do not create separate contract files.
*These files act as the "context window" for future AI sessions.*

## 26. AI CODING SESSION WORKFLOW
Every time a developer uses an AI agent, the prompt must enforce:
`Read requirements -> Read relevant contracts -> Inspect current repository -> Identify existing code -> Plan -> Implement bounded task -> Test -> Review -> Update progress.`
The AI must NOT rewrite unrelated modules or invent schemas.

## 27. GIT WORKFLOW
- **Branches:** `main` (production), `develop` (integration), `feature/[module-name]` (e.g., `feature/rules-engine`).
- **Workflow:** Branch off `develop` -> Implement -> Test -> Commit -> Push -> PR -> Code Review by another team member -> Merge to `develop`.
This prevents the 5 developers from overwriting each other.

## 28. PROTOTYPE REQUIREMENTS
**Concrete Boundaries for SIH Demo:**
- **Government Sync:** Mocked via a "Simulate API Response" button or Manual. (Production: Real API).
- **Document Verification:** Basic entity extraction. (Production: Cryptographic verification/DigiLocker).
- **RAG Corpus:** 10-20 PDFs max. (Production: Entire state gazette).

## 29. MVP BOUNDARY
- **Must Have:** Auth, Profile, Rules Engine, Approval Roadmap, Document Upload, State Machine Tracking, RAG, AI Assistant.
- **Nice to Have:** Scheme Discovery, SLA Alerts.
- **Future/Not Building:** Kubernetes, Kafka, Custom LLM pre-training, Nationwide coverage, Real government integration.

## 30. DATA STRATEGY
**Prototype Dataset:**
- **Sector:** Textiles (Textiles have complex water/pollution rules, making for a great demo).
- **State:** Maharashtra.
- **Rules:** 15-20 highly curated rules that demonstrate complex logic (e.g., IF wastewater > X AND location = Y).
- **Documents:** 10-20 authentic MPCB (Maharashtra Pollution Control Board) and MIDC PDFs.

## 31. TESTING
- **Unit Tests:** Jest for Rules Engine logic (crucial for determinism).
- **API Tests:** Postman or Supertest for core endpoints.
- **RAG Tests:** Manual verification of retrieval accuracy.

## 32. ERROR HANDLING
- **Missing Rule Data:** Prompt user to complete profile.
- **RAG No-Result:** "No relevant regulation found."
- **AI Timeout/Limit:** "AI Assistant is currently unavailable. Please refer to the Rule-Based Roadmap."
The system must degrade gracefully. The Rules Engine must work even if the AI provider goes down.

## 33. PERFORMANCE
- **Pagination:** For document lists and compliance items.
- **Indexes:** MongoDB indexes on `userId`, `industryId`, and Vector Index.
- **Limits:** Restrict RAG retrieval to Top 5 chunks to minimize LLM latency and cost.

## 34. OBSERVABILITY
- **Logs:** Console logging for API requests and errors.
- **Audit Trails:** Record state transitions for Applications (who changed it and when).

## 35. SIH DEMO SCRIPT
1. **Landing Page:** Show value proposition.
2. **Register:** Create new account.
3. **Profile:** Enter Textile Project in Pune, ₹20Cr, Wastewater: Yes.
4. **Analyze:** Click button, show loader.
5. **Roadmap:** Reveal 11 applicable requirements.
6. **Detail:** Open "Consent to Establish (Pollution)".
7. **Reason:** Show deterministic reason based on Wastewater flag.
8. **Upload:** Upload "Site Plan" PDF.
9. **Extract:** Show extracted Company Name.
10. **Track:** Move application to "Submitted", then "Approved".
11. **Compliance:** Show newly generated "Monthly Water Report" compliance item.
12. **AI Question:** Open Chat, ask "What are the effluent standards?"
13. **Citation:** AI answers and links to MPCB Notification Page 4.

## 36. JUDGE QUESTIONS + ANSWERS
- **Q: Why not just use existing gov portals?** A: Portals are for submission. Our platform is for discovery, understanding, and lifecycle management.
- **Q: Why not just an LLM?** A: LLMs hallucinate legal facts. We use a deterministic rules engine for applicability, and RAG for explanation.
- **Q: What if no API exists?** A: We provide a deep link to the portal and manual tracking, still solving the orchestration problem for the user.
- **Q: Why a monolith?** A: It's the most practical, reliable architecture for a startup/hackathon scale, avoiding unnecessary DevOps overhead while delivering full product value.

## 37. FUTURE PRODUCTION
- **SIH Prototype:** Focuses on UX, deterministic logic, and AI explanation on a small dataset.
- **Production Platform:** Adds enterprise identity (SSO), massive multilingual corpus, automated regulation change detection, and data-sharing agreements with government bodies.

## 38. FINAL ARCHITECTURE DIAGRAMS
```text
[ SYSTEM ARCHITECTURE ]
       React SPA
           | (REST)
    Node/Express Server
      /    |     \
   Auth  Rules  AI/RAG
     \     |     /
    MongoDB Atlas (Vector)
```

```text
[ RULES ENGINE FLOW ]
Industry Profile -> Matches Rule Condition -> Outputs Approval ID + Reason -> Maps to UI
```

```text
[ RAG FLOW ]
Query -> Embed -> Vector Search -> Top 5 Chunks -> LLM Prompt -> Grounded Answer + Citation
```

```text
[ TEAM OWNERSHIP ]
Person 1: Frontend (React)
Person 2: Backend Core (Node, DB, Auth)
Person 3: Rules Engine
Person 4: Workflow & Compliance
Person 5: AI, RAG, Doc Intelligence
```

## 39. DATABASE SCHEMA (ACTUAL MONGOOSE)

```javascript
const mongoose = require('mongoose');

// 1. users
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Industry'], default: 'Industry' }
  },
  { timestamps: true }
);

// 2. industries
const industrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    companyName: { type: String, required: true },
    sector: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    projectLocation: { type: String, required: true },
    pincode: { type: String, required: true },
    investment: { type: Number, required: true },
    employees: { type: Number, required: true },
    productionCapacity: { type: Number, required: true },
    manufacturingActivity: { type: String, required: true },
    processes: { type: String, required: true },
    waterUsage: { type: Number, required: true },
    generatesWastewater: { type: Boolean, required: true },
    hazardousWaste: { type: Boolean, required: true },
    projectStage: { 
      type: String, 
      enum: ['Pre-establishment', 'construction', 'pre-operation', 'operational', 'expansion'], 
      required: true 
    }
  },
  { timestamps: true }
);

// 3. approvals
const approvalSchema = new mongoose.Schema(
  {
    approvalName: { type: String, required: true },
    authority: { type: String, required: true }
  },
  { timestamps: true }
);

// 4. regulatory_rules
const regulatoryRuleSchema = new mongoose.Schema(
  {
    ruleId: { type: String, required: true, unique: true },
    approvalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Approval', required: true },
    condition: { type: mongoose.Schema.Types.Mixed, required: true },
    explanationTemplate: { type: String, required: true },
    priority: { type: Number, required: true },
    effectiveDate: { type: Date, required: true },
    version: { type: String, required: true }
  },
  { timestamps: true }
);

// 5. applications
const applicationSchema = new mongoose.Schema(
  {
    industryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Industry', required: true, index: true },
    approvalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Approval', required: true },
    status: { 
      type: String, 
      enum: ['NOT_STARTED', 'DOCUMENTS_PREPARED', 'SUBMITTED', 'UNDER_REVIEW', 'INSPECTION', 'APPROVED', 'REJECTED'],
      default: 'NOT_STARTED'
    },
    submissionDate: { type: Date },
    expectedCompletionDate: { type: Date },
    inspectionDate: { type: Date },
    approvalDate: { type: Date },
    remarks: { type: String }
  },
  { timestamps: true }
);

// 6. documents
const documentSchema = new mongoose.Schema(
  {
    industryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Industry', required: true, index: true },
    approvalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Approval', required: false },
    fileUrl: { type: String, required: true },
    documentType: { type: String, required: true },
    companyName: { type: String },
    licenseNumber: { type: String },
    expiryDate: { type: Date }
  },
  { timestamps: true }
);

// 7. compliance_items
const complianceItemSchema = new mongoose.Schema(
  {
    industryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Industry', required: true, index: true },
    approvalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Approval', required: true },
    requirementText: { type: String, required: true },
    recurrence: { 
      type: String, 
      enum: ['ONE_TIME', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'RENEWAL'], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['UPCOMING', 'DUE', 'OVERDUE', 'COMPLETED'], 
      default: 'UPCOMING' 
    },
    dueDate: { type: Date, required: true },
    source: { type: String }
  },
  { timestamps: true }
);
```

## 40. API CONTRACTS (REQUEST/RESPONSE SHAPES)

```http
POST /auth/register
Content-Type: application/json
```
Request:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123"
}
```
Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1...",
    "userId": "60d0fe4f5311236168a109ca"
  }
}
```

```http
POST /auth/login
Content-Type: application/json
```
Request:
```json
{
  "email": "jane@example.com",
  "password": "SecurePassword123"
}
```
Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1..."
  }
}
```

```http
POST /industries
Authorization: Bearer <JWT>
Content-Type: application/json
```
Request:
```json
{
  "companyName": "ABC Textiles Pvt Ltd",
  "sector": "Textiles",
  "state": "Maharashtra",
  "district": "Pune",
  "projectLocation": "Pune MIDC",
  "pincode": "411001",
  "investment": 200000000,
  "employees": 100,
  "productionCapacity": 5000,
  "manufacturingActivity": "Dyeing",
  "processes": "Dyeing, Weaving",
  "waterUsage": 10000,
  "generatesWastewater": true,
  "hazardousWaste": false,
  "projectStage": "Pre-establishment"
}
```
Response:
```json
{
  "success": true,
  "data": {
    "industryId": "60d0fe4f5311236168a109cb"
  }
}
```

```http
GET /industries/me
Authorization: Bearer <JWT>
```
Request: (No body)
Response:
```json
{
  "success": true,
  "data": {
    "industryId": "60d0fe4f5311236168a109cb",
    "companyName": "ABC Textiles Pvt Ltd",
    "sector": "Textiles",
    "state": "Maharashtra",
    "projectStage": "Pre-establishment"
  }
}
```

```http
POST /approvals/analyze
Authorization: Bearer <JWT>
Content-Type: application/json
```
Request:
```json
{
  "industryId": "60d0fe4f5311236168a109cb"
}
```
Response:
```json
{
  "success": true,
  "message": "Analysis complete. Redirect to Roadmap."
}
```

```http
GET /approvals/roadmap/:industryId
Authorization: Bearer <JWT>
```
Request: (No body)
Response:
```json
{
  "success": true,
  "data": [
    {
      "approvalId": "60d0fe4f5311236168a109cc",
      "approvalName": "Consent to Establish (Pollution)",
      "authority": "Maharashtra Pollution Control Board",
      "status": "Required",
      "reason": "Required because your project is in the Textiles sector and generates wastewater.",
      "documents": ["Site Plan", "Water Balance Diagram"]
    }
  ]
}
```

```http
PUT /applications/:id/status
Authorization: Bearer <JWT>
Content-Type: application/json
```
Request:
```json
{
  "status": "SUBMITTED"
}
```
Response:
```json
{
  "success": true,
  "data": {
    "status": "SUBMITTED",
    "submissionDate": "2026-08-28T00:00:00Z"
  }
}
```

```http
POST /documents/upload
Authorization: Bearer <JWT>
Content-Type: multipart/form-data
```
Request:
```text
file: <binary>
industryId: "60d0fe4f5311236168a109cb"
approvalId: "60d0fe4f5311236168a109cc"
```
Response:
```json
{
  "success": true,
  "data": {
    "documentId": "60d0fe4f5311236168a109cd",
    "fileUrl": "https://storage.example.com/file.pdf"
  }
}
```

```http
GET /compliance
Authorization: Bearer <JWT>
```
Request: (No body)
Response:
```json
{
  "success": true,
  "data": {
    "complianceScore": 87,
    "items": [
      {
        "complianceId": "60d0fe4f5311236168a109ce",
        "requirementText": "Submit Monthly Water Quality Report",
        "dueDate": "2026-09-28T00:00:00Z",
        "status": "UPCOMING",
        "recurrence": "MONTHLY"
      }
    ]
  }
}
```

```http
POST /ai/chat
Authorization: Bearer <JWT>
Content-Type: application/json
```
Request:
```json
{
  "query": "What are the specific parameters for textile wastewater in Maharashtra?"
}
```
Response:
```json
{
  "success": true,
  "data": {
    "response": "According to the Maharashtra Pollution Control Board, the effluent standards require...",
    "citations": ["Maharashtra Pollution Control Board Notification 2023, Page 4, Section 2"]
  }
}
```

## 41. AUTH CONTRACT

### JWT Payload
```json
{
  "sub": "USER_ID",
  "role": "Industry",
  "iat": 1693245600,
  "exp": 1693332000
}
```
- **sub**: The user's unique MongoDB `_id` (`userId`).
- **role**: The role of the user (`Industry` or `Admin`).
- **iat**: Issued at timestamp.
- **exp**: Expiration timestamp.
- **Not included**: Sensitive data like passwords, emails, or personal information.

### req.user
After passing through the authentication middleware, the Express request object will be populated with:
```javascript
req.user = {
  id: "USER_ID",
  role: "Industry"
};
```

### Authorization Header
Clients must include the JWT in the `Authorization` header for all protected endpoints:
```http
Authorization: Bearer <JWT>
```
The backend middleware verifies this token. If missing, expired, or invalid, it returns `401 Unauthorized`.

### Roles
- **Industry**: The primary user role. Can create profiles, upload documents, and view their own applications and compliance items.
- **Admin**: The secondary user role. Can manage the deterministic rules engine, upload official PDFs for RAG, and oversee system metrics.

## 42. PROGRESS LOG

Every AI coding session must append an entry here before ending work, and must read the last 3-5 entries before starting new work.

### Person <N> — <date>
Done: ...
Stubbed: ...
Breaking changes: none
Next: ...

### Person <N> — <date>
Done: ...
Stubbed: ...
Breaking changes: none
Next: ...

### Person <N> — <date>
Done: ...
Stubbed: ...
Breaking changes: none
Next: ...
