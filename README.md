# 🩸 RaktBandhan AI

> **AI-Powered Blood Coordination Platform for Blood Warriors Foundation**  
> *Helping 2-3 Lakh Thalassemia Patients Across India*

[![AWS](https://img.shields.io/badge/AWS-Cloud-orange)](https://aws.amazon.com/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.12-yellow)](https://python.org/)
[![Hackathon](https://img.shields.io/badge/AI4Good-2.0-red)](https://blend360.com/)

---

## 🎯 What is RaktBandhan AI?

**RaktBandhan AI** is a complete AI-powered platform that automates blood coordination for Blood Warriors Foundation. It reduces 80% of admin manual work, gives Thalassemia patients peace of mind through auto-scheduled transfusions, and treats donors as humans with personalized AI interactions.

### The Problem
- **2-3 lakh Thalassemia patients** in India need blood every 2-4 weeks for life
- Blood Warriors currently coordinates manually — calls, follow-ups, scheduling
- At this scale, manual work is **impossible**

### Our Solution
A two-layer system:
- **Layer 1:** Complete web platform (patient + donor + admin portals)
- **Layer 2:** Autonomous AI brain (matching, outreach, learning, scheduling)

---

## ✨ Key Features

### For Patients
- 📅 Auto-scheduled recurring transfusions
- 📧 Advance email confirmations
- 👥 Backup donor system
- 📊 Personal transfusion dashboard

### For Donors
- 🎯 Smart targeted requests only
- ⭐ Reliability Score (0-100) — like a credit score
- 💬 AI chatbot that remembers you
- 🏆 Recognition badges (Gold/Silver/Bronze)

### For Admins
- 🤖 80% reduction in manual coordination
- 🧠 ML-Powered Donor Prediction Score (XGBoost) for optimal matching
- 📊 Real-time dashboard with AI insights
- 💡 Natural language queries ("Show inactive O+ donors in Hyderabad")
- 📈 Daily auto-generated reports
- 🧠 Self-improving system via failure learning

---

## 🏗️ Architecture

```
Frontend (React)
    ↓
AWS Amplify + CloudFront
    ↓
API Gateway → Lambda (FastAPI)
    ↓
DynamoDB | Bedrock | SES | Step Functions | EventBridge | SageMaker
```

**Full architecture details:** See [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js + Vite + TailwindCSS + shadcn/ui |
| **Backend** | Python FastAPI on AWS Lambda |
| **Database** | Amazon DynamoDB |
| **AI/LLM** | Amazon Bedrock (Claude 3.5) |
| **ML** | XGBoost & Scikit-Learn via AWS S3 and Lambda |
| **Workflows** | AWS Step Functions |
| **Scheduling** | Amazon EventBridge |
| **Email** | Amazon SES |
| **Auth** | Amazon Cognito |
| **Hosting** | AWS Amplify |

**Full tech stack:** See [TECH_STACK.md](./TECH_STACK.md)

---

## 📦 Project Structure

```
raktbandhan-ai/
│
├── 📄 PRD.md                       # Product Requirements
├── 📄 ARCHITECTURE.md              # System Design
├── 📄 TASKS.md                     # Living task tracker
├── 📄 API_SPEC.md                  # API contracts
├── 📄 DATABASE_SCHEMA.md           # DynamoDB design
├── 📄 TECH_STACK.md                # Locked tech choices
├── 📄 UI_UX_GUIDELINES.md          # Design system
├── 📄 DEPLOYMENT.md                # Deployment guide
├── 📄 AWS_SERVICES_SETUP.md        # AWS setup steps
├── 📄 AI_RULES.md                  # Rules for AI agents
├── 📄 AI_AGENT_PROMPT_M1.md        # Member 1's master prompt
├── 📄 AI_AGENT_PROMPT_M2.md        # Member 2's master prompt
├── 📄 .env.example                 # Environment variables template
├── 📄 README.md                    # You are here
│
├── 📁 frontend/                    # React app (Member 1)
│   ├── src/
│   ├── public/
│   └── package.json
│
├── 📁 backend/                     # Lambda functions (Member 2)
│   ├── lambdas/
│   ├── data/
│   └── requirements.txt
│
└── 📁 docs/                        # Reference docs
    ├── IDEATION.md
    ├── INNOVATION.md
    └── PROJECT_OVERVIEW.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.12+
- AWS Account with CLI configured
- GitHub account

### Frontend Setup
```bash
cd frontend/
npm install
cp .env.example .env.local
# Edit .env.local with your values
npm run dev
# Opens at http://localhost:5173
```

### Backend Setup
```bash
cd backend/
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your values

# Run FastAPI locally
uvicorn app.main:app --reload --port 8000
```

### Deploy to AWS
See [DEPLOYMENT.md](./DEPLOYMENT.md) for full steps.

**Quick deploy:**
```bash
# Frontend (auto-deploys on push)
git push origin main

# Backend (manual)
cd backend/lambdas/rb-match-donors/
zip -r package.zip .
aws lambda update-function-code \
  --function-name rb-match-donors \
  --zip-file fileb://package.zip
```

---

## 🎬 Demo

**Live URL:** `https://main.dxxxxxx.amplifyapp.com`

### Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@raktbandhan.ai | AdminDemo2024! |
| Donor (Gold) | rahul.gold@demo.com | DonorDemo2024! |
| Patient | anjali.patient@demo.com | PatientDemo2024! |

### Demo Flow
1. Login as **Admin** → See dashboard with KPIs and active requests
2. Trigger a blood request → Watch AI auto-match and email donors
3. Login as **Donor** → Accept request via email link
4. Login as **Patient** → See auto-scheduled upcoming transfusions
5. Open AI Chatbot → Ask "When can I donate next?"

---

## 🏆 Innovations

1. **Donor Reliability Score** — Like CIBIL for donors (0-100)
2. **Predictive ML Matching** — XGBoost model deployed via S3 to predict the probability of a donor showing up
3. **Recurring Standing Orders** — Auto-scheduled transfusions
4. **Self-Healing AI** — Learns from failures, updates rules
5. **Conversational Memory** — Chatbot remembers every donor
6. **Maximum Admin Automation** — 13+ tasks fully automated

**Full innovation details:** See [docs/INNOVATION.md](./docs/INNOVATION.md)

---

## 📊 Impact Metrics

| Metric | Target |
|---|---|
| Admin work reduction | 80% |
| Auto-handled requests | 80% |
| Donor response rate | 50%+ |
| Match time | < 5 minutes |
| Recurring transfusions auto-scheduled | 100% |

---

## 👥 Team

| Role | Responsibilities |
|---|---|
| **Member 1** | Frontend (React) + UI/UX + Integration |
| **Member 2** | Backend (Lambda) + AI/ML + Data |

---

## 🤖 Built with Vibe Coding

This project was built using AI-powered pair programming:
- **Cursor** / **Antigravity** / **GitHub Copilot**
- Master prompts in [AI_AGENT_PROMPT_M1.md](./AI_AGENT_PROMPT_M1.md) and [AI_AGENT_PROMPT_M2.md](./AI_AGENT_PROMPT_M2.md)
- Strict rules in [AI_RULES.md](./AI_RULES.md)

---

## 📝 Documentation Index

| Document | Purpose |
|---|---|
| [PRD.md](./PRD.md) | Product requirements |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture |
| [API_SPEC.md](./API_SPEC.md) | API contracts |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | Database design |
| [TECH_STACK.md](./TECH_STACK.md) | Technology choices |
| [UI_UX_GUIDELINES.md](./UI_UX_GUIDELINES.md) | Design system |
| [AWS_SERVICES_SETUP.md](./AWS_SERVICES_SETUP.md) | AWS configuration |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deployment steps |
| [AI_RULES.md](./AI_RULES.md) | AI agent rules |
| [TASKS.md](./TASKS.md) | Current tasks |

---

## 🙏 Acknowledgments

- **Blood Warriors Foundation** — for inspiring this project
- **Blend360** — for hosting AI4Good 2.0 hackathon
- **AWS** — for the cloud platform
- **Anthropic** — for Claude AI model

---

## 📜 License

MIT License — Open source for social good.

---

## 📧 Contact

Built with ❤️ for **Blood Warriors Foundation**  
**AI For Good 2.0 Hackathon** — 2024

---

**"Coordination on Autopilot — So Every Patient Gets Blood On Time"**
