<div align="center">

# 🩺 HEALTH AI

### _Where verified healthcare meets engineering — a cinematic platform for health-tech partner discovery._

[![Live Demo](https://img.shields.io/badge/▶️_LIVE_DEMO-Open_App-1e90ff?style=for-the-badge&labelColor=0a0a0a)](https://de27omk8jz7if.cloudfront.net/)
[![SENG384](https://img.shields.io/badge/SENG384-Senior_Project-7c3aed?style=for-the-badge&labelColor=0a0a0a)](#)
[![Status](https://img.shields.io/badge/status-shipped-22c55e?style=for-the-badge&labelColor=0a0a0a)](#)

<br/>

![React](https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.183-000000?style=for-the-badge&logo=threedotjs&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4.1-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-S3_+_CloudFront-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)

<br/>

![Landing Page](docs/screenshots/landing_page.png?v=2)

</div>

---

## ✨ What is HEALTH AI?

> **HEALTH AI** is a structured discovery platform that pairs **verified medical professionals** with **engineering teams** to launch health-tech collaborations — through institutional `.edu` registration, NDA-gated project details, scheduled meeting slots, and real-time chat.

Built as a **cinematic, product-style web app** rather than a static landing — every section breathes with Spline 3D, Framer Motion choreography, and a custom liquid-glass design system.

<br/>

<table>
<tr>
<td width="33%" align="center" valign="top">

### 🛡️ Verified Identity
`.edu` email + 6-digit OTP via EmailJS.<br/>No anonymous accounts.

</td>
<td width="33%" align="center" valign="top">

### 🤝 NDA-Gated Collaboration
Confidential project details unlock only after digital NDA acknowledgement.

</td>
<td width="33%" align="center" valign="top">

### 💬 Real-Time Chat
Typing indicators, presence, replies, reactions, unread badges — all on Firestore.

</td>
</tr>
<tr>
<td align="center" valign="top">

### 📅 Meeting Slots
Propose, accept, and decline meeting times directly inside the post workflow.

</td>
<td align="center" valign="top">

### 🎛️ Admin Oversight
Metrics, moderation, user management, activity logs, and CSV export.

</td>
<td align="center" valign="top">

### 🌐 GDPR-Aware
JSON data export, account deletion, audit trail for every sensitive action.

</td>
</tr>
</table>

---

## 🗺️ User Journey — From Curious Visitor to Active Partner

```mermaid
flowchart LR
    V([👤 Visitor]):::guest --> L[🎬 Cinematic Landing]
    L --> S{Sign up?}
    S -->|No| L
    S -->|Yes| R[📧 .edu Registration]
    R --> O[🔢 6-digit OTP]
    O --> D[🏠 Dashboard Feed]

    D --> B[🔍 Browse posts]
    D --> C[✍️ Create post]

    B --> P[📄 Post Detail]
    C --> P
    P --> I[💡 Express Interest]
    I --> N[🔒 NDA Modal]
    N -->|Sign| M[📅 Meeting Slots]
    M -->|Accept| W[🎉 Partner Found]
    W --> X[💬 Direct Chat]

    classDef guest fill:#1e293b,stroke:#7c3aed,color:#fff,stroke-width:2px
    classDef default fill:#0f172a,stroke:#1e90ff,color:#e2e8f0,stroke-width:1.5px
```

---

## 🏛️ System Architecture

```mermaid
graph TB
    subgraph Client["🌐 Browser (Client)"]
        UI[React 19 + Vite SPA]
        UI --> Routes[React Router 7<br/>Lazy Routes]
        Routes --> Pages[Landing • Dashboard • PostDetail<br/>Chat • Profile • Admin]
        Pages --> Hooks[useAuth • usePosts<br/>useChat • useNotifications]
        Pages --> Shell[Navbar • CommandPalette<br/>Toasts • Notifications]
    end

    subgraph Services["⚙️ Service Layer"]
        FS[firestore.js<br/>Data access]
        ES[emailService.js<br/>OTP + Meetings]
    end

    subgraph Cloud["☁️ Cloud"]
        DB[(🔥 Firebase Firestore<br/>users • posts • chats<br/>notifications • logs)]
        EMJ[📧 EmailJS API]
        CDN[🌍 AWS CloudFront]
        S3[📦 AWS S3 Bucket]
    end

    Hooks --> FS
    Hooks --> ES
    FS <--> DB
    ES --> EMJ
    UI -.served by.-> CDN
    CDN -.origin.-> S3

    style UI fill:#1e293b,stroke:#61DAFB,color:#fff
    style DB fill:#1e293b,stroke:#FFCA28,color:#fff
    style CDN fill:#1e293b,stroke:#FF9900,color:#fff
    style EMJ fill:#1e293b,stroke:#22c55e,color:#fff
```

---

## 🔐 Authentication & OTP Verification

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant App as React App
    participant Firestore
    participant EmailJS

    User->>App: Submit .edu email + password
    App->>App: Validate institutional domain
    App->>Firestore: Create user (status: pending)
    App->>App: Generate 6-digit code
    App->>EmailJS: Send OTP email
    EmailJS-->>User: 📧 Verification code
    User->>App: Enter 6-digit code
    App->>App: Verify code (TTL 10 min)
    App->>Firestore: Update status → verified
    App-->>User: ✅ Welcome to dashboard
```

---

## 📝 Post Lifecycle — From Draft to Partner Found

```mermaid
stateDiagram-v2
    [*] --> Draft: 3-step Wizard
    Draft --> Published: Submit
    Published --> Engaged: First Interest
    Engaged --> NDA_Pending: Author opens detail
    NDA_Pending --> Meetings: NDA accepted
    Meetings --> PartnerFound: Slot accepted
    Published --> Expired: Deadline reached
    Engaged --> Expired: Deadline reached
    PartnerFound --> [*]
    Expired --> [*]

    note right of Draft
        Wizard collects:
        domain • stage
        expertise needs
        location • confidentiality
    end note

    note right of NDA_Pending
        Confidential fields
        unlock after digital
        NDA acknowledgement
    end note
```

---

## 💬 Real-Time Chat Data Flow

```mermaid
flowchart LR
    A[👤 User A] -->|sends| MA[Message]
    B[👤 User B] -->|sends| MB[Message]

    MA --> CV[(conversations/&#123;id&#125;)]
    MB --> CV
    CV --> MS[(messages subcollection)]

    MS -->|onSnapshot| LA[🔴 Live render — A]
    MS -->|onSnapshot| LB[🔴 Live render — B]

    CV -.typing.-> LA
    CV -.typing.-> LB
    CV -.presence.-> LA
    CV -.presence.-> LB

    style CV fill:#1e293b,stroke:#FFCA28,color:#fff
    style MS fill:#1e293b,stroke:#FFCA28,color:#fff
    style LA fill:#0f172a,stroke:#22c55e,color:#fff
    style LB fill:#0f172a,stroke:#22c55e,color:#fff
```

---

## 🗄️ Firestore Data Model

```mermaid
erDiagram
    USERS ||--o{ POSTS : "authors"
    USERS ||--o{ INTERESTS : "expresses"
    USERS ||--o{ CONVERSATIONS : "participates"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ ACTIVITY_LOGS : "generates"

    POSTS ||--o{ INTERESTS : "has"
    POSTS ||--o{ MEETINGS : "has"

    CONVERSATIONS ||--o{ MESSAGES : "contains"

    USERS {
        string uid PK
        string email
        string role
        string status
        string institution
        bool online
        timestamp lastSeen
    }
    POSTS {
        string id PK
        string authorUid FK
        string title
        string domain
        string stage
        string status
        string confidentiality
        timestamp expiresAt
    }
    INTERESTS {
        string id PK
        string userUid FK
        bool ndaAccepted
        timestamp createdAt
    }
    MEETINGS {
        string id PK
        timestamp slot
        string status
    }
    CONVERSATIONS {
        string id PK
        array members
        map unreadCounts
        bool typing
    }
    MESSAGES {
        string id PK
        string text
        string replyTo
        map reactions
        bool read
    }
    NOTIFICATIONS {
        string id PK
        string type
        bool read
    }
    ACTIVITY_LOGS {
        string action
        string actorUid
        timestamp at
    }
```

---

## 📸 Screenshots

<table>
<tr>
<td width="50%" align="center">
<b>🎬 Landing</b><br/>
<img src="docs/screenshots/landing_page.png?v=2" alt="Landing"/>
</td>
<td width="50%" align="center">
<b>🏠 Dashboard</b><br/>
<img src="docs/screenshots/dashboard_page.png?v=2" alt="Dashboard"/>
</td>
</tr>
<tr>
<td align="center">
<b>✍️ Create Post</b><br/>
<img src="docs/screenshots/create_post_page.png?v=2" alt="Create Post"/>
</td>
<td align="center">
<b>📄 Post Detail</b><br/>
<img src="docs/screenshots/post_detail_page.png?v=2" alt="Post Detail"/>
</td>
</tr>
<tr>
<td align="center">
<b>💬 Chat</b><br/>
<img src="docs/screenshots/chat_page.png?v=2" alt="Chat"/>
</td>
<td align="center">
<b>👤 Profile</b><br/>
<img src="docs/screenshots/profile_page.png?v=2" alt="Profile"/>
</td>
</tr>
<tr>
<td colspan="2" align="center">
<b>🔐 Login & OTP</b><br/>
<img src="docs/screenshots/login_page.png?v=2" alt="Login" width="60%"/>
</td>
</tr>
</table>

---

## 🧰 Tech Stack

| Layer | Tools |
| --- | --- |
| 🎨 **Frontend** | React 19 • Vite 7 • React Router 7 |
| 🎬 **Animation & 3D** | Framer Motion 12 • Three.js • React Three Fiber • Drei • Spline • HLS Video |
| 🔥 **Data** | Firebase Cloud Firestore (subcollections, real-time listeners) |
| 📧 **Email** | EmailJS — OTP & meeting-request templates |
| 💎 **UI System** | Custom liquid-glass CSS • Lucide React icons • PxSelect • Skeletons • Toast provider • Wizard progress |
| 🧪 **Testing** | Vitest 4 • Testing Library • jsdom |
| ☁️ **Deployment** | AWS S3 + CloudFront via `deploy.sh` |

---

## 🛣️ Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | 🌍 Guest | Cinematic landing experience |
| `/login` | 🌍 Guest | Login, registration, and OTP verification |
| `/dashboard` | 🔓 Authenticated | Browse and filter announcements |
| `/create-post` | 🔓 Authenticated | Publish a collaboration announcement |
| `/post/:id` | 🔓 Authenticated | View details, NDA, meetings |
| `/my-posts` | 🔓 Authenticated | Manage own announcements |
| `/chat` | 🔓 Authenticated | Real-time direct messages |
| `/profile` | 🔓 Authenticated | Profile, GDPR export, account controls |
| `/admin` | 👑 Admin only | Users, posts, logs, metrics, CSV export |

---

## 🚀 Deployment Pipeline

```mermaid
flowchart LR
    Dev[💻 Local Dev] -->|npm run build| Build[📦 dist/]
    Build -->|deploy.sh| Sync[🔄 aws s3 sync]
    Sync -->|long cache| Assets[(📦 S3 — assets/)]
    Sync -->|no-cache| HTML[(📄 S3 — index.html)]
    HTML --> Inv[♻️ CloudFront Invalidation]
    Assets --> CF[🌍 CloudFront Edge]
    Inv --> CF
    CF --> Live[🌐 Users Worldwide]

    style Dev fill:#1e293b,stroke:#7c3aed,color:#fff
    style CF fill:#1e293b,stroke:#FF9900,color:#fff
    style Live fill:#1e293b,stroke:#22c55e,color:#fff
```

```bash
./deploy.sh <bucket-name> <cloudfront-distribution-id>
```

---

## 🏁 Getting Started

### Prerequisites
- Node.js **20+** and npm
- A modern browser
- _(Optional)_ Firebase project — to point the app at your own database
- _(Optional)_ EmailJS credentials — for OTP & meeting emails

### Install & Run

```bash
git clone https://github.com/cozalss/SENG384-project.git
cd SENG384-project
npm install
npm run dev
```

Vite will print a local URL — usually `http://localhost:5173`.

### Environment Variables

Create a `.env` in the project root:

```bash
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

Firebase configuration currently lives in `src/firebase.js`. For production, move keys into environment-managed settings and enforce Firestore security rules.

---

## 📜 Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | 🛠️ Start the Vite development server |
| `npm run build` | 📦 Create the production build in `dist/` |
| `npm run preview` | 👀 Preview the production build locally |
| `npm run lint` | 🧹 Run ESLint against `src/` |
| `npm run test` | ✅ Run Vitest once |
| `npm run test:watch` | 🔁 Run Vitest in watch mode |

---

## 📂 Project Structure

```text
Seng384/
├── 📄 index.html
├── ⚙️  vite.config.js
├── 🚀 deploy.sh
├── 📚 docs/
│   ├── 📸 screenshots/
│   └── 📝 generate_*.py            # SRS / SDD / User Guide generators
└── 📁 src/
    ├── 🎨 index.css • liquid-glass.css
    ├── 🔥 firebase.js
    ├── 📐 constants/landingData.jsx
    ├── 🧩 components/
    │   ├── 🎬 landing/             # Hero • CinematicStage • BentoFeatures…
    │   ├── 🪟 CommandPalette.jsx
    │   ├── 🔔 Notifications.jsx
    │   ├── 🍞 ToastProvider.jsx
    │   └── 🧭 WizardProgress.jsx
    ├── 🪝 hooks/                   # useAuth • usePosts • useChat …
    ├── 📄 pages/                   # Landing • Dashboard • PostDetail …
    ├── 🛣️  routes/AppRoutes.jsx
    ├── ⚙️  services/                # firestore.js • emailService.js
    └── 🧪 test/
```

---

## 📚 Documentation

The repository ships with the full academic deliverables:

- 📘 `HEALTH_AI_SRS_Document.docx` — Software Requirements Specification
- 📗 `HEALTH_AI_SDD_Document.docx` — Software Design Document
- 📕 `HEALTH_AI_User_Guide.docx` — Illustrated user guide

Generators live in `docs/`.

---

## ⚠️ Notes on Scope

This is an **academic prototype** for SENG384. The UI presents GDPR-aware workflows, data export, deletion, NDA acknowledgement, and audit logging — but a production launch should add hardened server-side authentication, formal legal review of NDA/GDPR text, Firestore security rules, rate limiting, and secret management.

---

## 👥 Team — Health Shield

> _SENG384 Software Development 2 — Spring 2026_

| 👤 Member | 🎯 Role |
| --- | --- |
| **Cem Özal** | Full-stack development |
| **Emre Kurubaş** | Frontend & UI/UX |
| **Hasabu Can Eltayeb** | Backend & Firebase |
| **Sertaç Ataç** | QA & documentation |

---

<div align="center">

### 🌟 Try the live experience

[![Open Live App](https://img.shields.io/badge/▶️_OPEN_HEALTH_AI-Visit_Now-1e90ff?style=for-the-badge&labelColor=0a0a0a&logo=react&logoColor=61DAFB)](https://de27omk8jz7if.cloudfront.net/)

_Built with 🩺 for safer collaboration in health-tech._

</div>
