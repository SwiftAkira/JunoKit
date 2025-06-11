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

### **1. Naming & Branding** ✅ **COMPLETE**

* [x] Secure domain junokit.com
* [x] Design mascot (Jupiter w/ cute eyes), plan theme variants
* [x] Color logo with background (JunoKitColor(with a bg).png)
* [x] Black & white SVG logo (JunoKitBW.svg)

### **2. Infra Setup** ✅ **COMPLETE & DEPLOYED**

* [x] Set up AWS CDK infrastructure in Stockholm (eu-north-1)
* [x] Configure AWS Cognito (SSO, invite system) - User Pool: eu-north-1_QUaZ7e7OU
* [x] Set up DynamoDB (per-user context) - Table: junokit-user-context
* [x] Provision Lambda/API Gateway - https://nayr2j5df2.execute-api.eu-north-1.amazonaws.com/v1/
* [x] Set up AWS SES (email notifications) - junokit.com domain
* [x] Store tokens/keys in Secrets Manager
* [x] Configure CloudWatch for monitoring
* [x] Infrastructure testing: 11/11 tests passed
* [x] Complete deployment outputs saved to config/aws-outputs.json

### **3. Frontend Dev** ✅ **95% COMPLETE**

* [x] Build Next.js app with TypeScript and Tailwind CSS
* [x] **Complete Page Structure (9 Pages):**
  * [x] Landing Page (/) - Modern hero with RetroGrid and integrations
  * [x] Dashboard (/dashboard) - Simplified MVP-focused workspace
  * [x] Chat Interface (/chat) - AI conversation layout
  * [x] Settings (/settings) - Theme management and preferences
  * [x] Login (/login) - Authentication with demo credentials
  * [x] Signup (/signup) - Registration with validation
  * [x] Forgot Password (/forgot-password) - Password reset flow
  * [x] Help (/help) - Comprehensive FAQ with 8 categories
  * [x] 404 Error (/not-found) - Humorous interactive error page
* [x] **Authentication System:**
  * [x] AuthContext with session management
  * [x] Complete authentication flow (login/signup/forgot password)
  * [x] AWS Amplify integration ready for Cognito
* [x] **Theme System:**
  * [x] 5 role-based themes (Dev, Ops, QA, Sales, Media)
  * [x] Dark mode support with system preference detection
  * [x] ThemeContext for state management
* [x] **UI/UX Features:**
  * [x] Jupiter mascot with theme-based variations
  * [x] Responsive design (mobile-first approach)
  * [x] Modern glassmorphism effects and animations
  * [x] Consistent design theme across all pages
* [x] **Comprehensive Onboarding System:**
  * [x] 9-step interactive tour with smart positioning
  * [x] Spotlight highlighting with visual effects
  * [x] Progress tracking and navigation controls
  * [x] localStorage persistence and restart capability
  * [x] Viewport-aware tooltip positioning
* [x] **Error Handling & Help:**
  * [x] Humorous 404 page with interactive Jupiter mascot
  * [x] Comprehensive help system with FAQ categories
  * [x] User-friendly error messages and validation

### **4. Backend/AI** 🔄 **READY TO START**

* [ ] **API Integration:**
  * [ ] Connect frontend authentication to live Cognito
  * [ ] Implement real API calls to deployed AWS services
  * [ ] Set up WebSocket connections for real-time features
* [ ] **Lambda functions for:**
  * [ ] Parsing commands (OpenRouter + DeepSeek)
  * [ ] Integrations (Slack, Email, Calendar, Jira, GitHub)
  * [ ] Reminder/follow-up emails
  * [ ] Memory/context updates in DynamoDB
* [ ] **AI Features:**
  * [ ] Role-based AI personality based on user themes
  * [ ] Context-aware responses using DynamoDB storage
  * [ ] Real-time chat with typing indicators

### **5. Integrations** ⏳ **WAITING FOR BACKEND**

* [ ] Slack, Email, Google/Outlook Calendar, Jira, GitHub
* [ ] API endpoints for each action
* [ ] Webhook handlers as needed

### **6. Admin & Scaling** ⏳ **FUTURE PHASE**

* [ ] Admin dashboard for user management, invite codes, activity logs
* [ ] Role management (admin/user)
* [ ] Add logging, GDPR compliance checks

### **7. Testing & QA** 🔄 **ONGOING**

* [x] Infrastructure testing (11/11 tests passed)
* [x] Frontend component testing (all pages functional)
* [x] Authentication flow testing (UI complete)
* [x] Theme system testing (all 5 themes working)
* [x] Onboarding system testing (9-step tour functional)
* [x] Responsive design testing (mobile and desktop)
* [ ] End-to-end integration testing (pending backend)
* [ ] GDPR/data handling review

### **8. Launch** ⏳ **READY FOR BETA**

* [ ] Connect frontend to live AWS services
* [ ] Invite first 5 users for beta testing
* [ ] Collect feedback
* [ ] Plan for new features (Slack bot, mobile, more integrations, etc.)

---

## **Current Status Summary**

### ✅ **COMPLETED (85% Overall Progress)**
- **Phase 1**: Project Foundation (100%)
- **Phase 2**: Infrastructure Setup (100% - Deployed & Live)
- **Phase 3**: Frontend Foundation (95% - All pages implemented)

### 🔄 **IN PROGRESS**
- **Phase 4**: Backend Integration (Ready to start)

### ⏳ **UPCOMING**
- **Phase 5**: Advanced Integrations
- **Phase 6**: Admin & Scaling Features

---

## **Frontend Achievement Highlights**

### **Complete Page Ecosystem (9 Pages)**
1. **Modern Landing Page** - Hero section with company integrations
2. **Simplified Dashboard** - MVP-focused with essential features only
3. **Chat Interface** - Ready for AI integration
4. **Comprehensive Settings** - Theme management and preferences
5. **Complete Auth Flow** - Login, signup, password reset
6. **Help System** - 8 FAQ categories with expandable sections
7. **Error Handling** - Interactive 404 with humorous elements

### **Advanced Onboarding System**
- **9-Step Interactive Tour** covering all dashboard features
- **Smart Positioning** with viewport-aware tooltip placement
- **Visual Effects** including spotlight highlighting and animations
- **User Experience** with skip functionality and progress tracking
- **Persistence** using localStorage with restart capability

### **Technical Excellence**
- **Modern Stack**: Next.js 15.3.3, TypeScript, Tailwind CSS
- **State Management**: React Contexts for auth and themes
- **Responsive Design**: Mobile-first with dark mode support
- **AWS Integration**: Ready for Cognito and API Gateway connection
- **Theme System**: 5 role-based themes with dynamic Jupiter mascot

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

| Area        | Tool/Service        | Status | Notes                     |
| ----------- | ------------------- | ------ | ------------------------- |
| Frontend    | Next.js (SSR)       | ✅ Complete | All 9 pages implemented |
| Auth        | AWS Cognito         | ✅ Deployed | UI ready for integration |
| Backend/API | AWS Lambda          | ✅ Deployed | Ready for integration |
| DB          | DynamoDB            | ✅ Live | User context table ready |
| Secrets     | Secrets Manager     | ✅ Live | API key storage ready |
| Email       | AWS SES             | ✅ Live | Domain configured |
| AI          | OpenRouter/DeepSeek | ⏳ Pending | Ready for integration |
| Comms       | Slack, Email        | ⏳ Pending | Integrations planned |
| Calendar    | Google/Outlook      | ⏳ Pending | API endpoints needed |
| Tasks       | Jira, GitHub        | ⏳ Pending | Integration planned |

---

## **Next Immediate Steps**

1. **Connect Frontend to AWS Services**
   - Integrate authentication with live Cognito
   - Set up API calls to deployed Lambda functions
   - Implement real-time WebSocket connections

2. **AI Chat Implementation**
   - OpenRouter API integration
   - Role-based AI personalities
   - Context management with DynamoDB

3. **Beta Testing**
   - Invite first users
   - Collect feedback
   - Iterate based on real usage

**The frontend is complete and ready for backend integration!** 🚀 