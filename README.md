# Review Tools – Policy-Driven Code Maturity Engine

> A configurable static analysis engine designed to evaluate technical maturity, governance, and operational readiness of software repositories.

---

## 🚀 Overview

Review Tools is a modular, policy-driven code maturity engine that analyzes software repositories and produces:

- Structured findings
- Weighted risk score
- Technical grade (A–F)
- Actionable improvement recommendations
- Historical job tracking

The system is inspired by real-world engineering governance practices and aims to provide a lightweight, extensible alternative for baseline repository quality validation.

It is designed to be:

- Extensible (modular rule engine)
- Configurable (multi-policy profiles)
- Auditable (job history & policy traceability)
- Developer-friendly (clear feedback loop)

---

## 🏗 Architecture

The project follows a modular monorepo architecture:

review-tools/
├── apps/web           # React frontend (UI)
├── services/api       # Fastify REST API
├── services/worker    # Asynchronous job processor
├── packages/rules     # Modular rule engine
├── packages/shared    # Shared types & policy definitions
├── data/              # File-based queue & results
└── policies/          # Policy profiles (standard, strict, security)

### Core Components

### 🔹 API (Fastify)
- Accepts repository URL or ZIP upload
- Queues analysis jobs
- Exposes job status & results endpoints
- Supports dynamic policy selection

### 🔹 Worker
- Processes jobs asynchronously
- Executes modular rules
- Applies policy profile
- Calculates weighted score & grade
- Stores structured result

### 🔹 Rule Engine
- Independent rule modules
- Categorized by domain (security, CI/CD, governance, etc.)
- Extensible architecture

### 🔹 Policy Engine
- Configurable severity penalties
- Category-based weight multipliers
- Rule overrides
- Multi-profile support (standard, strict, security)

### 🔹 Frontend (React)
- Submit repository URL or ZIP
- Select policy profile
- View score, grade, summary
- Receive prioritized improvement feedback
- Browse recent jobs

---

## 📊 Scoring Model

Score is calculated as:

Score = 100 - (Sum of weighted penalties)

### Severity Base Penalties

| Severity | Base Penalty |
|----------|-------------|
| High     | 30          |
| Medium   | 15          |
| Low      | 5           |
| Info     | 0           |

### Category Multipliers (Example)

| Category              | Multiplier |
|-----------------------|------------|
| security              | 1.5        |
| ci-cd                 | 1.2        |
| repository-hygiene    | 1.2        |
| governance            | 1.0        |
| documentation         | 0.8        |

Policies can override these values.

---

## 🎯 Policy Profiles

The engine supports multiple policy profiles:

policies/
├── standard.json
├── strict.json
└── security.json

Profiles can be selected via:

- Query parameter: ?policy=strict
- Header: x-policy-profile
- Environment variable: POLICY_PROFILE
- Default fallback: standard

This allows organizations to adapt scoring logic to their risk tolerance.

---

## 🧠 Example Findings

Examples of automated checks:

- Missing CI configuration
- Committed .env file
- Missing LICENSE
- Missing Dockerfile
- Missing .gitignore
- Hardcoded localhost reference

Each finding includes:

- Rule ID
- Severity
- Category
- Human-readable explanation
- Actionable recommendation

---

## 📦 Running Locally

### 1️⃣ Install dependencies

npm install

### 2️⃣ Start services (3 terminals)

Terminal 1:
npm -w services/api run dev

Terminal 2:
npm -w services/worker run dev

Terminal 3:
npm -w apps/web run dev

Open in browser:
http://localhost:5173

---

## 🔬 Testing via PowerShell

### Analyze repository URL

```powershell
$res = Invoke-RestMethod -Uri "http://127.0.0.1:3001/analyze?policy=strict" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"repoUrl":"https://github.com/user/repo"}'

$jobId = $res.jobId
Invoke-RestMethod "http://127.0.0.1:3001/jobs/$jobId"
```

### Analyze ZIP upload

```powershell
$zipPath = "C:\path\to\project.zip"

$res = curl.exe -s -X POST `
  "http://127.0.0.1:3001/analyze/upload?policy=strict" `
  -F "file=@$zipPath"

$jobId = ($res | ConvertFrom-Json).jobId

Invoke-RestMethod "http://127.0.0.1:3001/jobs/$jobId"
```

---

## 📈 Use Cases

- Engineering governance baseline
- Pull request validation
- Pre-release quality gate
- Onboarding repository assessment
- Risk visibility for leadership
- Policy experimentation

---

## 🔮 Roadmap Ideas

- CI/CD integration
- GitHub App mode
- SaaS multi-tenant mode
- Dependency vulnerability checks
- Rule packs per language
- Persistent database storage
- Trend analysis dashboard

---

## 🏷 Professional Positioning

Review Tools demonstrates:

- Modular architecture design
- Policy-driven governance modeling
- Configurable scoring systems
- Asynchronous processing
- UX-oriented technical feedback
- Platform engineering thinking

---

## 👤 Author Maicon Balke

Developed as a technical exploration of configurable governance engines and code maturity evaluation systems.

---
