# Jobnest — Job & Aptitude Portal

Jobnest is a comprehensive, full-stack recruitment and assessment platform designed to bridge the gap between job seekers and recruiters. Candidates can build ATS-friendly resumes, extract skills from existing resumes, get matched with curated job listings, take proctored timed aptitude tests, prepare with role-based question banks, and practice real-time voice-enabled mock interviews with AI. Recruiters can publish jobs, manage applicant pipelines, shortlist talent, and analyze hiring metrics.

---

## Current Working Functionalities

### 1. Candidate Hub

| Module | Description |
|---|---|
| **Authentication & Role Access** | Stateless JWT authentication with secure local persistence (`jn_token`, `jn_user`), automatic redirection based on role (`CANDIDATE` vs. `RECRUITER`), and session protection. |
| **Profile Management** | Complete candidate profile manager with personal details, professional headline, skills tagging, bio, education, experience, dynamic completion tracker badge (e.g., 84%), and avatar/resume file uploads. |
| **Smart Resume Parsing** | Upload existing resumes (PDF/DOCX/text) to parse contact information, extract technical and aptitude skills against keyword dictionaries, compute an ATS score, and persist structured JSON data. |
| **AI Resume Template Builder** | Interactive resume creator with 3 ATS-tailored layouts (**Classic Professional**, **Modern Minimal**, and **Executive Professional**), live HTML preview, and PDF export rendered with OpenPDF. |
| **AI Resume Assistant** | Built-in Groq AI integration to generate executive summaries, improve work experience descriptions, suggest role-specific skills, polish bullet points, and check grammar. |
| **Job Search & Recommended Jobs** | Browse all active listings or search by title, skills, and location. Candidate profiles receive personalized job recommendations with match percentage indicators. |
| **One-Click Job Applications** | Apply to job openings with a single click and track application status (`APPLIED`, `SHORTLISTED`, `REJECTED`). |
| **Timed & Proctored Aptitude Test** | Assess candidate capabilities across 4 sections: **Quantitative Aptitude**, **Logical Reasoning**, **Verbal Ability**, and **Coding / Technical Knowledge**. Features countdown timers, question flagging, review modal, and auto-submit. |
| **Anti-Cheating Proctoring Engine** | Client-side security monitor that detects and logs suspicious events (tab switching, window blur, copy/paste attempts, full-screen exits) directly to the backend `ProctoringLog`. |
| **Test Scorecards & History** | Instant automated evaluation producing section-wise scores, accuracy percentages, overall performance tier, and a historical record of all test attempts. |
| **Interview Preparation Bank** | Curated questions across core CS domains (**DBMS**, **Operating Systems**, **Computer Networks**, **Data Structures & Algorithms**, **OOP & System Design**) with difficulty filters and AI-generated practice answers evaluation. |
| **Interactive AI Mock Interview** | Freemium mock interview sessions (5 questions, 300s limit) featuring text or voice speech-to-text input, spoken AI interviewer replies via Text-to-Speech (TTS), transitional feedback, and post-session scorecard generation. |

---

### 2. Recruiter Portal & ATS

| Module | Description |
|---|---|
| **Recruiter Dashboard** | Key recruitment metrics at a glance: total active jobs, candidate application pipeline, conversion rates, and recent applicant activity. |
| **Job Posting & Lifecycle** | Create and publish job listings with title, department, employment type, location, experience requirements, salary package, and detailed specifications. Includes job status toggle (`ACTIVE` / `CLOSED`) and deletion. |
| **Applicants ATS** | Centralized applicant review dashboard showing candidate names, applied positions, submission dates, match ratings, and current pipeline status. |
| **Shortlisting & Candidate Workflow** | Update applicant hiring stages in real-time (`APPLIED` → `SHORTLISTED` → `REJECTED`) with live badges and counters. |
| **AI Job Description Generator** | Prompt-driven tool to automatically generate standardized job descriptions, roles & responsibilities, and aptitude cutoffs for any given job title. |
| **Analytics & Reports** | Visual recruitment charts powered by Recharts, tracking average time-to-hire metrics and candidate aptitude screening pass rates. |

---

## Tech Stack

### Backend
- **Framework**: Spring Boot 3.3.2 (Java 17)
- **Security**: Spring Security with stateless HMAC-SHA256 JWT tokens
- **Persistence**: Spring Data JPA & Hibernate
- **Database**: MySQL 8.0
- **Database Migrations**: Flyway (V0–V6 migrations covering users, profiles, jobs, aptitude questions, proctoring logs, and interview sessions)
- **PDF Generation**: OpenPDF (1.3.43)
- **Validation**: Jakarta Bean Validation (`spring-boot-starter-validation`)
- **AI Client**: Groq Cloud Chat Completions API (`llama-3.3-70b-versatile` / `openai/gpt-oss-20b`) via native Java `HttpClient` with resilient fallback templates

### Frontend
- **Framework**: React 19 (Vite 6)
- **Styling**: Vanilla CSS Design System with CSS variables, glassmorphism, responsive grid layouts, and cohesive typography
- **Animations**: Framer Motion
- **Visualizations**: Recharts (Area charts, bar charts, metric cards)
- **Speech API**: Native Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) for voice mock interviews
- **State & Routing**: React Context API (`AuthContext`), custom client-side router with browser history synchronization

---

## System Architecture & User Flows

### Candidate Flow
```
Register / Login (JWT)
  │
  ├── Profile Setup & Resume Upload ──► Skills Extraction & ATS Scoring
  │
  ├── AI Resume Builder ──► Live Preview ──► AI Writing Assist ──► PDF Download
  │
  ├── Job Exploration ──► Recommended Matches ──► 1-Click Application
  │
  ├── Aptitude Assessment ──► Timed Test ──► Proctoring Monitor ──► Scorecard & History
  │
  └── Interview Preparation ──► Question Bank ──► AI Mock Voice Interview ──► Evaluation Summary
```

### Recruiter Flow
```
Register / Login (JWT)
  │
  ├── Recruiter Overview ──► Key Recruitment KPIs
  │
  ├── Job Management ──► Post New Job (Manual or AI JD Generator) ──► Manage Status / Delete
  │
  ├── Applicants ATS ──► Review Candidates & Profile Details ──► Shortlist / Reject
  │
  └── Reports & Analytics ──► Time-to-Hire Trends & Screening Pass Rates
```

---

## Project Structure

```
jobnest-job-aptitude-portal/
├── src/main/java/.../jobnestjobaptitudeportal/
│   ├── config/                      # Security & CORS configuration
│   ├── controller/
│   │   ├── aptitude/                # Aptitude test start, submit, proctor logs, results
│   │   ├── auth/                    # Signup and login endpoints
│   │   ├── candidate/               # Profile, resume builder, applications, interview prep
│   │   ├── recruiter/               # Job CRUD, applicant review & status updating
│   │   └── JobPublicController.java # Public job listing endpoints
│   ├── dto/
│   │   ├── request/                 # Request payload records
│   │   └── response/                # Response records and DTOs
│   ├── entity/                      # JPA Entities (User, CandidateProfile, Job, Application, etc.)
│   ├── enums/                       # Role, TestSection, Difficulty, AttemptStatus
│   ├── exception/                   # Global exception handling & custom API exceptions
│   ├── repository/                  # Spring Data JPA repositories
│   ├── security/                    # JWT utility & authentication filter
│   ├── service/
│   │   ├── ai/                      # Groq API client & interview question generator
│   │   ├── aptitude/                # Test engine, timer service, evaluation service
│   │   ├── auth/                    # User authentication & registration service
│   │   ├── interview/               # Interview practice & mock interview session manager
│   │   ├── job/                     # Job management & candidate application service
│   │   ├── profile/                 # Candidate profile & avatar/resume upload service
│   │   ├── report/                  # Reporting utilities
│   │   └── resume/                  # Resume parsing, OpenPDF generator & AI resume writer
│   └── util/                        # General helper utilities
│
├── src/main/resources/
│   ├── application.properties       # App configuration, MySQL connection & Groq keys
│   ├── db/migration/                # Flyway SQL migrations (V0 to V6)
│   └── templates/resume/            # HTML resume templates for live preview
│
├── frontend/
│   ├── src/
│   │   ├── components/              # Layout, Navbar, Sidebar, UI cards, Modals
│   │   ├── context/                 # AuthContext (token & user state management)
│   │   ├── pages/
│   │   │   ├── Landing/             # Public landing page with features & quick signup
│   │   │   ├── auth/                # Login and Register pages
│   │   │   ├── candidate/           # Dashboard, Profile, ResumeBuilder, Tests, MockInterview, etc.
│   │   │   └── recruiter/           # Overview, PostJob, Applicants ATS, Shortlisted, Reports, AITools
│   │   ├── services/
│   │   │   └── api.js               # Centralized API service with auth injection
│   │   ├── App.jsx                  # Main router and dashboard switcher
│   │   └── index.css                # Global design system tokens and styling
│   ├── package.json                 # Frontend dependencies and build scripts
│   └── vite.config.js               # Vite bundler configuration
│
├── compose.yaml                     # Docker Compose configuration (MySQL, Backend, Frontend)
├── Dockerfile                       # Multi-stage optimized Spring Boot Dockerfile
└── pom.xml                          # Maven project dependencies & build plugins
```

---

## Key API Endpoints

### Authentication & Public
- `POST /api/auth/signup` — Register as a Candidate or Recruiter
- `POST /api/auth/login` — Authenticate and receive a signed JWT
- `GET /api/jobs` — Public job listings with keyword and location search
- `GET /api/jobs/{id}` — Get single job details

### Candidate Portal (`/api/candidate`)
- `GET /api/candidate/profile` — Fetch current candidate profile
- `PUT /api/candidate/profile` — Update candidate profile details
- `POST /api/candidate/profile/image` — Upload candidate profile picture
- `POST /api/candidate/profile/resume` — Upload resume file
- `POST /api/candidate/resume/upload` — Parse uploaded resume and extract skills
- `GET /api/candidate/resume/latest` — Fetch latest parsed resume data
- `GET /api/candidate/resume/templates` — List available resume templates
- `POST /api/candidate/resume/preview` — Generate HTML preview for resume data
- `POST /api/candidate/resume/download` — Download resume as OpenPDF document
- `POST /api/candidate/resume/ai-assist` — AI writing assistance (summary, bullets, skills)
- `GET /api/candidate/jobs/recommended` — Get personalized job recommendations
- `GET /api/candidate/jobs/all` — List all jobs with candidate application statuses
- `POST /api/candidate/jobs/{jobId}/apply` — Submit 1-click job application
- `GET /api/candidate/applications` — List candidate's submitted applications
- `POST /api/candidate/interview/ai-generate` — Generate AI interview questions by role
- `POST /api/candidate/interview/evaluate` — Evaluate practice interview answer
- `POST /api/candidate/interview/mock/start` — Start timed AI mock interview session
- `POST /api/candidate/interview/mock/submit-answer` — Submit answer for question evaluation
- `POST /api/candidate/interview/mock/voice-reply` — Process spoken response & get TTS reply
- `POST /api/candidate/interview/mock/force-end/{sessionId}` — Complete mock session on timeout

### Aptitude Engine (`/api/aptitude`)
- `POST /api/aptitude/start` — Start randomized test session (section selection & duration)
- `POST /api/aptitude/proctor-log` — Record proctoring violation event
- `POST /api/aptitude/submit` — Submit completed test for automatic grading
- `GET /api/aptitude/result/{attemptId}` — Get detailed score breakdown and scorecard
- `GET /api/aptitude/history` — Get historical test attempts for authenticated candidate

### Recruiter Portal (`/api/recruiter`)
- `GET /api/recruiter/jobs` — Retrieve all jobs posted by the recruiter
- `POST /api/recruiter/jobs` — Post a new job opportunity
- `PATCH /api/recruiter/jobs/{id}/status` — Update job status (`ACTIVE` / `CLOSED`)
- `DELETE /api/recruiter/jobs/{id}` — Remove a job posting
- `GET /api/recruiter/applicants` — Retrieve all applicants across recruiter's jobs
- `PATCH /api/recruiter/applicants/{id}/status` — Update applicant pipeline status

---

## Getting Started

### Prerequisites
- **Java 17+**
- **Maven 3.9+**
- **Node.js 18+ & npm**
- **Docker & Docker Compose** (optional, for containerized run)
- **Groq API Key** (optional for live AI completions; template fallbacks are included)

---

### Option 1: Run with Docker Compose (Recommended)

Starts MySQL, the Spring Boot backend, and the Vite frontend with cached Maven builds:

```bash
docker compose up --build
```

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8080/api`
- **MySQL Database**: `localhost:3306`

---

### Option 2: Run Locally (Without Docker)

#### 1. Start MySQL
Ensure MySQL is running locally on port 3306 with a database named `jobnest` (or configure via environment variables).

#### 2. Run the Spring Boot Backend
```bash
# From project root
./mvnw spring-boot:run
```
*(On Windows PowerShell, use `.\mvnw.cmd spring-boot:run`)*

Backend will start at `http://localhost:8080`. Flyway will automatically execute database migrations on startup.

#### 3. Run the React Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend dev server will launch at `http://localhost:5173` (or `http://localhost:3000`).

---

## Environment Variables

| Variable | Default Value | Description |
|---|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/jobnest?...` | MySQL JDBC connection URL |
| `SPRING_DATASOURCE_USERNAME` | `root` | Database username |
| `SPRING_DATASOURCE_PASSWORD` | *(empty)* | Database password |
| `APP_JWT_SECRET` | `dev-secret-change-me-...` | Secret key for signing JWT tokens |
| `APP_JWT_EXPIRATION_SECONDS` | `86400` (24h) | JWT validity period in seconds |
| `GROQ_API_KEY` | *(dev key included)* | Groq API Key for AI features |
| `VITE_API_URL` | `http://localhost:8080/api` | Backend base URL for frontend client |

---

## Team & Academic Context

Developed as a Semester 7 Capstone / Mini Project — **CSPIT CE**.
