# Jobnest — Job & Aptitude Portal

An integrated recruitment platform where candidates can upload resumes, get matched to jobs, take timed aptitude tests, and prepare for interviews. Recruiters can post jobs, review applicants, shortlist candidates, and generate hiring reports.

## Features

### Candidate Side

| Module | Description |
|--------|-------------|
| Smart Resume Parsing | Extract skills, experience, and education from uploaded resumes |
| JD Matching | AI-based match score between resume and job description |
| Resume Template Builder | ATS-friendly templates with PDF export |
| Section-wise Aptitude Tests | Quantitative, Logical, Verbal, and Coding sections |
| Timed Test Engine | Per-section and overall timers with auto-submit |
| Candidate Dashboard | Track applications, match scores, and test results |
| Interview Preparation | Role-based interview question bank |
| AI Mock Interview | AI-driven interview practice and feedback |

### Recruiter Side

| Module | Description |
|--------|-------------|
| Post Jobs | Create and manage job openings |
| View Applicants | Browse candidate profiles per job |
| Shortlist | Mark qualified candidates |
| Resume Screening | Auto-filter resumes using match scores |
| AI Interview Questions | Generate questions from JD and candidate profile |
| Reports | Recruitment analytics and export |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Java 17, Spring Boot, Spring Security |
| Frontend | React |
| Database | MySQL |
| AI | Spring AI (OpenAI) |
| DevOps | Git, Docker Compose, Cloud |

## Application Flow

### Candidate Flow

```
Signup → Resume Upload → Resume Parsing → JD Matching → Aptitude Test
  → Auto Evaluation → Dashboard → Interview Prep → AI Mock Interview
```

### Recruiter Flow

```
Post Jobs → View Applicants → Shortlist → Resume Screening
  → AI Interview Questions → Reports
```

## Project Structure

```
jobnest-job-aptitude-portal/
├── src/main/java/.../jobnestjobaptitudeportal/
│   ├── config/              # App & security configuration
│   ├── controller/
│   │   ├── auth/            # Signup, login
│   │   ├── candidate/       # Resume, tests, dashboard
│   │   └── recruiter/       # Jobs, applicants, reports
│   ├── dto/                 # Request & response objects
│   ├── entity/              # Database models
│   ├── enums/               # Role, test sections, etc.
│   ├── exception/           # Custom exceptions
│   ├── repository/          # Data access layer
│   ├── security/            # JWT & auth filters
│   ├── service/
│   │   ├── auth/
│   │   ├── resume/          # Parsing & template builder
│   │   ├── job/             # JD matching
│   │   ├── aptitude/        # Tests & timed engine
│   │   ├── interview/
│   │   ├── ai/
│   │   └── report/
│   └── util/
├── src/main/resources/
│   ├── db/migration/        # SQL migrations
│   ├── templates/resume/    # Resume HTML templates
│   └── uploads/resumes/     # Uploaded resume files
├── frontend/src/
│   ├── pages/auth/          # Login, signup
│   ├── pages/candidate/     # Candidate dashboard & tests
│   ├── pages/recruiter/     # Recruiter dashboard
│   ├── components/          # Reusable UI components
│   ├── services/            # API client
│   ├── hooks/               # Custom React hooks
│   ├── context/             # Auth state
│   └── routes/              # Route definitions
└── compose.yaml             # MySQL via Docker
```

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 18+ (for frontend)
- Docker (for MySQL)

### Backend

```bash
docker compose up -d
./mvnw spring-boot:run
```

Backend runs at `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`

## Development Plan

| Phase | Scope |
|-------|-------|
| 1 | Auth — signup/login for Candidate and Recruiter roles |
| 2 | Resume upload and parsing |
| 3 | Job posting and JD matching |
| 4 | Aptitude test engine with timers |
| 5 | Candidate and recruiter dashboards |
| 6 | Interview prep and AI mock interview |
| 7 | Resume template builder and reports |

## Team

Semester 7 Mini Project — CSPIT CE
