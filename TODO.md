# **Junokit: AI Work Assistant for Devs & Teams**

*"Your smart, customizable AI assistant—powered by AWS, themed for every team."*

---

## **Branding**

* **Name:** Junokit
* **Mascot:** Cartoon planet Jupiter with cute eyes.
  * **Theme system:** Outfits/accessories/colors change for Dev, Ops, QA, Sales, Media, etc.
* **Domain:** junokit.com
* **Assets:** 
  * ✅ JunoKitColor(with a bg).png - Color logo with background
  * ✅ JunoKitBW.svg - Black & white SVG logo
* **Slogan:**
  * "One toolkit, every workflow."
  * "Bringing AI to your daily grind—cute, clever, and always on."

---

## **Core Features (MVP)**

* **Chat UI (Web):** Send direct commands to your AI assistant.
* **AI Actions:**
  * Send messages (Slack, Email, etc.)
  * Book meetings (Google/Outlook Calendar)
  * Fetch tasks (Jira, Confluence, GitHub)
  * Summarize your day
  * Simple reminders/follow-ups (via email)
* **Context & Memory:** Personalization per user (stored in DynamoDB).
* **User Accounts:** SSO login with invite codes (self-serve onboarding).
* **Admin Panel:** Manage users, see activity/logs, assign admin roles.
* **Notifications:** Automated follow-up/reminder emails.
* **GDPR Compliance:** Data kept in EU region, ephemeral message storage, strict access controls.

---

## **Theme System**

* **Role-based themes:**
  Users select a theme (Dev, Ops, QA, Sales, Media, etc.)
* **Dynamic Mascot:**
  Jupiter mascot changes look/accessories per theme.
* **Custom Dashboard:**
  Each theme can have tailored dashboard widgets (future feature).

---

## **Tech Stack**

### **Frontend**

* **Framework:** Next.js (React, supports SSR & static)
* **Hosting:** AWS Amplify Hosting (with SSR)
* **Design:** Custom UI, mascot and themes, responsive (mobile-friendly)
* **Auth:** AWS Cognito (SSO, invite code system)
* **Notifications:** Emails via AWS SES

### **Backend/API**

* **Serverless:** AWS Lambda (API endpoints, AI logic)
* **Gateway:** AWS API Gateway (connects frontend/backend)
* **DB:** AWS DynamoDB (user memory/context, tokens, minimal logs)
* **Secrets:** AWS Secrets Manager (API tokens/keys)
* **AI:** OpenRouter with DeepSeek (free LLM for commands/intents)

### **Integrations**

* **Comms:** Slack, Email (SES), Outlook, Gmail
* **Calendar:** Google Calendar, Outlook
* **Tasks:** Jira, Confluence, GitHub
* *(Add more as needed)*

### **DevOps & Infra**

* **IaC:** AWS CDK or Terraform
* **CI/CD:** Amplify CI/CD (for frontend); GitHub Actions for backend
* **Monitoring:** AWS CloudWatch
* **Security:** IAM roles, encrypted storage, GDPR configs

---

## **Scaling**

* **From 1 to 100+ users** (MVP: 5 users, easy to add more)
* **Admin controls:** Invite codes, user management, roles
* **Multi-user memory/context:** Separate state per user
* **Logs:** Minimal, only for GDPR-compliant auditing

---

## **Security & Compliance**

* **GDPR:**
  * EU-region data only
  * No long-term message storage (ephemeral for AI context only)
  * User data export/delete on request
* **SSO/Invite-only:**
  * Users sign up via unique invite code
  * SSO for easy, secure login

---

## **Action Plan / Roadmap**

### **1. Naming & Branding**

* [x] Secure domain junokit.com
* [x] Design mascot (Jupiter w/ cute eyes), plan theme variants
* [x] Color logo with background (JunoKitColor(with a bg).png)
* [x] Black & white SVG logo (JunoKitBW.svg)

### **2. Infra Setup**

* [ ] Set up AWS Amplify for frontend hosting
* [ ] Configure AWS Cognito (SSO, invite system)
* [ ] Set up DynamoDB (per-user context)
* [ ] Provision Lambda/API Gateway
* [ ] Set up AWS SES (email notifications)
* [ ] Store tokens/keys in Secrets Manager
* [ ] Configure CloudWatch for monitoring

### **3. Frontend Dev**

* [ ] Build Next.js app:
  * Chat UI (Jupiter mascot, theme-able)
  * Auth/signup with invite code
  * Dashboard (personalized per user/theme)
  * Settings: theme switcher, notification prefs

### **4. Backend/AI**

* [ ] Lambda functions for:
  * Parsing commands (OpenRouter + DeepSeek)
  * Integrations (Slack, Email, Calendar, Jira, GitHub)
  * Reminder/follow-up emails
  * Memory/context updates in DynamoDB

### **5. Integrations**

* [ ] Slack, Email, Google/Outlook Calendar, Jira, GitHub
* [ ] API endpoints for each action
* [ ] Webhook handlers as needed

### **6. Admin & Scaling**

* [ ] Admin dashboard for user management, invite codes, activity logs
* [ ] Role management (admin/user)
* [ ] Add logging, GDPR compliance checks

### **7. Testing & QA**

* [ ] Test onboarding, SSO, all core actions
* [ ] GDPR/data handling review
* [ ] End-to-end use case tests

### **8. Launch**

* [ ] Invite first 5 users
* [ ] Collect feedback
* [ ] Plan for new features (Slack bot, mobile, more integrations, etc.)

---

## **Branding & UX Ideas**

* **Mascot:**
  Cute Jupiter planet with big eyes; wears "dev" glasses, "ops" headset, "QA" clipboard, etc.
* **Colors:**
  Jupiter orange, deep blue, soft purple, neon green (theme changes per role)
* **Vibes:**
  Modern, playful, not childish; devs and non-devs feel at home

---

## **Optional Nice-to-Haves**

* **Slack bot version**
* **Mobile app wrapper**
* **Custom dashboard widgets per theme**
* **Voice commands (future)**
* **AI learns workflow patterns for smarter suggestions**

---

## **Summary Table**

| Area        | Tool/Service        | Notes                     |
| ----------- | ------------------- | ------------------------- |
| Frontend    | Next.js (SSR)       | AWS Amplify Hosting       |
| Auth        | AWS Cognito         | SSO + invite code system  |
| Backend/API | AWS Lambda          | Serverless, fast          |
| DB          | DynamoDB            | User context/memory       |
| Secrets     | Secrets Manager     | Token/API key storage     |
| Email       | AWS SES             | Notifications/reminders   |
| AI          | OpenRouter/DeepSeek | Free LLM, custom prompts  |
| Comms       | Slack, Email        | Integrations, automations |
| Calendar    | Google/Outlook      | Book meetings             |
| Tasks       | Jira, GitHub        | Fetch/summarize tasks     |
| Monitoring  | CloudWatch          | Logs, metrics             |

---

## **Current Assets**

### **Logos & Branding** (Located in `assets/logos/`)
* `JunoKitColorWithTEXT(with a bg).png` - Full color logo with text and background (1.59MB)
* `JunoKitColorNoBGNoTEXT.png` - Color logo without background or text (1.56MB) 
* `JunoKitBWWithTEXT.svg` - Black & white SVG logo with text (9.3KB, scalable)

### **Project Structure Created** ✅
```
📁 JunoKit/
├── 📁 frontend/           # Next.js React app
│   ├── 📁 components/     # React components
│   ├── 📁 pages/         # Next.js pages
│   ├── 📁 styles/        # CSS/styling
│   ├── 📁 hooks/         # Custom React hooks
│   ├── 📁 utils/         # Frontend utilities
│   ├── 📁 types/         # TypeScript types
│   └── 📁 public/        # Static assets
│       ├── 📁 images/
│       └── 📁 icons/
├── 📁 backend/           # AWS Lambda functions
│   ├── 📁 functions/     # Lambda functions by feature
│   │   ├── 📁 auth/      # Authentication
│   │   ├── 📁 ai/        # AI/OpenRouter logic
│   │   ├── 📁 integrations/ # Slack, Email, etc.
│   │   ├── 📁 notifications/ # Email/reminders
│   │   └── 📁 admin/     # Admin functions
│   ├── 📁 layers/        # Lambda layers
│   │   ├── 📁 shared/    # Shared utilities
│   │   └── 📁 aws-sdk/   # AWS SDK layer
│   ├── 📁 utils/         # Backend utilities
│   └── 📁 types/         # TypeScript types
├── 📁 infrastructure/    # Infrastructure as Code
│   ├── 📁 aws-cdk/       # AWS CDK files
│   └── 📁 terraform/     # Terraform files
├── 📁 assets/           # Design & branding assets
│   ├── 📁 logos/        # Brand logos ✅
│   ├── 📁 images/       # General images
│   ├── 📁 icons/        # Icon assets
│   └── 📁 themes/       # Theme-specific assets
│       ├── 📁 dev/      # Developer theme
│       ├── 📁 ops/      # Operations theme
│       ├── 📁 qa/       # QA theme
│       ├── 📁 sales/    # Sales theme
│       └── 📁 media/    # Media theme
├── 📁 docs/             # Documentation
│   ├── 📁 api/          # API documentation
│   ├── 📁 deployment/   # Deployment guides
│   └── 📁 user-guide/   # User documentation
├── 📁 tests/            # Test suites
│   ├── 📁 frontend/     # Frontend tests
│   ├── 📁 backend/      # Backend tests
│   └── 📁 e2e/         # End-to-end tests
├── 📁 scripts/          # Build/deployment scripts
├── 📁 config/           # Configuration files
├── 📁 .github/          # GitHub workflows
│   └── 📁 workflows/    # CI/CD workflows
└── 📄 TODO.md          # This roadmap ✅
```

### **Next Steps for Assets**
* [ ] Create theme variants of mascot (Dev, Ops, QA, Sales, Media)
* [ ] Design favicon versions from existing logos
* [ ] Create different logo sizes for web/mobile
* [ ] Social media assets (profile pics, banners)
* [ ] Marketing materials templates 