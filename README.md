# 🗺️ Civic Saathi – AI-Powered Hyperlocal Civic Issue Reporting Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase)
![Google Gemini](https://img.shields.io/badge/Google-Gemini_AI-orange?logo=google)
![Google Maps](https://img.shields.io/badge/Google-Maps_API-red?logo=googlemaps)

### 🚀 Empowering Citizens • Enabling Transparency • Solving Civic Issues with AI

Built for the **Community Hero – Hyperlocal Problem Solver Hackathon**

</div>

---

# 🌟 Overview

**Civic Saathi** is an AI-powered civic issue reporting platform that connects citizens with local authorities through intelligent automation, community collaboration, and transparent issue tracking.

Citizens can report problems such as potholes, water leakages, broken streetlights, overflowing garbage, illegal dumping, damaged roads, and many more using images or videos.

Once submitted, **Google Gemini AI** automatically:

- Classifies the issue
- Determines severity
- Generates a meaningful title
- Creates a plain-language summary
- Detects duplicate complaints
- Routes the issue to the correct government department

Citizens can then monitor the issue's lifecycle from submission to resolution while receiving real-time updates and email notifications.

The platform also provides a dedicated **Admin Dashboard** for authorities to efficiently manage reports, monitor analytics, and track civic performance.

---

# 🎯 Problem Statement

Many civic problems remain unresolved because:

- Citizens don't know where to report them.
- Duplicate complaints waste administrative effort.
- There is little transparency after filing a complaint.
- Authorities lack centralized analytics.
- Citizens rarely receive updates regarding issue resolution.

**Civic Saathi solves these challenges by combining AI, geolocation, community participation, and real-time tracking into one seamless platform.**

---

# ✨ Key Highlights

- 🤖 AI-powered issue classification using Google Gemini
- 📍 GPS & Google Maps integration
- 📸 Image & Video complaint submission
- 🔍 AI duplicate detection
- 🏛️ Automatic department routing
- 📈 Predictive analytics dashboard
- 📧 Email notifications
- 🛡️ Secure Admin Panel
- 👥 Community verification
- 🏆 Gamification & Leaderboard
- 📊 Real-time dashboards
- 📱 Responsive UI

---

# 🌐 Live Demo


```
https://civic-ai-saathi.vercel.app/
```

### Admin Login

```
Email: admin@gmail.com
Password: admin1234
```

> These credentials are provided for hackathon demonstration purposes only.

---

# 🎥 Demo Video


```
https://youtu.be/thHguyH2PMc?si=GBBwOKL0cyTBFJnM
```

---

# 📸 Screenshots & Project Documentation

```
https://docs.google.com/document/d/1OUtL79AhW7xaoaeCLIynn9j4fRYLFg4pjjS4Y63rptg/edit?usp=sharing
```

---


# 🏗️ System Architecture

```text
                Citizen
                   │
                   ▼
          Next.js Frontend
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
 Supabase     Google Maps    Gemini AI
 Auth/DB        Location     Classification
 Storage         API         & Insights
        │
        ▼
 PostgreSQL Database
        │
        ▼
 Admin Dashboard
        │
        ▼
 Email Notifications
```

---

# 🤖 AI Workflow

```text
User uploads Image / Video
              │
              ▼
      Google Gemini AI
              │
              ▼
 Generates
 • Title
 • Category
 • Severity
 • Summary
 • Department
              │
              ▼
Duplicate Detection
(within 500m radius)
              │
              ▼
 Save Report
              │
              ▼
Notify Department
              │
              ▼
Citizen Tracks Progress
              │
              ▼
Admin Resolves Issue
```

---

# 🚀 Features

---

## 📋 Smart Issue Reporting

Users can report civic problems with rich details.

### Features

- 📸 Upload images (JPG, PNG, WebP)
- 🎥 Upload videos (MP4, MOV, WebM)
- 📍 Automatic GPS detection
- 📍 Manual India location picker
- 🤖 AI-generated title
- 🤖 AI-generated description
- 🤖 AI categorization
- 🤖 Severity prediction
- 🏛️ Department allocation
- 🔍 Duplicate detection
- 🙈 Anonymous reporting
- ✏️ Edit reports
- 🗑️ Delete reports

---

## 🤖 AI Features

Powered by **Google Gemini 2.0 Flash**

- Automatic issue categorization
- Severity prediction
- Department routing
- Plain-language summaries
- Duplicate complaint detection
- Keyword fallback classifier
- AI predictive insights
- Smart recommendations

---

## 🗺️ Interactive Issue Map

- Google Maps integration
- Color-coded markers
- Severity filters
- Live report preview
- Current location detection
- Interactive navigation

---

## 👥 Community Features

Citizens collaborate to verify issues.

Features include:

- 👍 Upvoting
- 💬 Comments
- ✅ Confirm reports
- ❌ Dispute reports
- 🏅 Community Verification Badge
- 📢 Community feed
- Live counters

---

## 📊 Issue Tracking

Every report follows a transparent lifecycle.

```
Open
   ↓
In Progress
   ↓
Resolved
   ↓
Closed
```

Includes

- Timeline
- Activity history
- Resolution proof
- Admin notes
- Email notifications
- Status updates

---

## 📈 Dashboard

Each citizen receives a personalized dashboard containing

- Reports filed
- Reports resolved
- Weekly trends
- Resolution rate
- Badge level
- Community rank
- AI insights
- Recent activity

---

## 🏆 Gamification

Rewarding active citizens.

### Badge Levels

🌱 Newcomer

↓

📋 Reporter

↓

🛡️ Guardian

↓

⭐ Hero

↓

🏆 Champion

Users earn points for contributing and appear on the community leaderboard.

---

## 🛡️ Admin Panel

Accessible **only to authorized administrators**.

### Default Credentials

```
Email: admin@gmail.com
Password: admin1234
```

### Admin Capabilities

- View all reports
- Update issue status
- Upload resolution proof
- Add admin notes
- Monitor SLA tracker
- View analytics
- AI insights
- Leaderboard
- Delete fake reports
- Manage issue lifecycle

Unauthorized users cannot access the `/admin` route.

---

## 📧 Email Notifications

Automatic emails are sent when

- A report is assigned
- Status changes
- Issue gets resolved
- Resolution proof is uploaded

---

## 🔒 Security Features

- Supabase Authentication
- Protected Admin Routes
- Role-based access
- Row Level Security (RLS)
- Secure file uploads
- Form validation with Zod
- Duplicate protection
- Input sanitization

---

# 🛠️ Technology Stack
# 🛠️ Technology Stack

| Layer | Technology |
|--------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Frontend** | React 19 |
| **Styling** | Tailwind CSS 4 |
| **Backend** | Supabase |
| **Database** | PostgreSQL |
| **Authentication** | Supabase Auth |
| **Storage** | Supabase Storage |
| **AI** | Google Gemini 2.0 Flash |
| **Maps** | Google Maps JavaScript API |
| **Validation** | Zod |
| **Forms** | React Hook Form |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **UI Components** | shadcn/ui + Radix UI |
| **Notifications** | React Hot Toast |
| **Email Service** | Nodemailer + Gmail |
| **Deployment** | Vercel |

---

# 📂 Project Structure

```text
civic-saathi-ai/

├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   │
│   ├── (dashboard)/
│   │   ├── admin/
│   │   ├── community/
│   │   ├── dashboard/
│   │   ├── map/
│   │   ├── report/
│   │   └── reports/[id]/
│   │
│   ├── api/
│   │   ├── ai/
│   │   ├── reports/
│   │   ├── notify/
│   │   └── check-duplicate/
│   │
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── admin/
│   ├── dashboard/
│   ├── reports/
│   └── layout/
│
├── lib/
│   ├── supabase/
│   ├── gemini.ts
│   ├── admin.ts
│   └── utils.ts
│
├── public/
├── types/
├── package.json
├── README.md
└── .env.local
```

---

# 🚀 Getting Started

## Prerequisites

Before running the project, make sure you have:

- Node.js 18+
- npm
- Supabase Account
- Google Cloud Account
- Gemini API Key
- Gmail Account

---

# 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/civic-saathi-ai.git

cd civic-saathi-ai
```

---

# 2️⃣ Install Dependencies

```bash
npm install
```

---

# 3️⃣ Environment Variables

Create

```text
.env.local
```

Add

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Gemini
GEMINI_API_KEY=

# Gmail
GMAIL_USER=

GMAIL_APP_PASSWORD=

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

# 4️⃣ Database Setup

Run the SQL script provided below in the **Supabase SQL Editor**.

The database contains the following tables:

- Users
- Reports
- Departments
- Upvotes
- Comments
- Timeline Events
- Report Validations

After creating the tables:

- Enable Row Level Security (RLS)
- Apply the provided policies
- Insert the default departments

> **Note:** Use the SQL schema provided in this repository to create all tables and policies.

---

# 5️⃣ Supabase Storage

Create two **Public Buckets**

```
report-images

report-videos
```

---

# 6️⃣ Gmail Setup

Enable

- Two-Step Verification

Create

```
App Password
```

Add it inside

```
.env.local
```

---

# 7️⃣ Run Development Server

```bash
npm run dev
```

Visit

```
http://localhost:3000
```

---

# 🔐 Admin Access

The application contains a dedicated **Admin Panel** that is only accessible to administrators.

## Default Credentials

```text
Email: admin@gmail.com

Password: admin1234
```

Only this account can access

```
/admin
```

Regular users attempting to access the Admin Panel will be denied permission.

> **Note:** These credentials are intended only for demonstration and hackathon purposes. In production, use secure role-based authentication and server-side authorization.

---

# 📡 API Endpoints

| Endpoint | Method | Description |
|-----------|----------|-------------|
| `/api/reports` | POST | Create report |
| `/api/reports` | GET | Fetch reports |
| `/api/ai/classify` | POST | AI issue classification |
| `/api/ai/insights` | GET | Dashboard AI insights |
| `/api/check-duplicate` | POST | Detect nearby duplicate issues |
| `/api/notify` | POST | Send email notifications |

---

# 📊 Database Schema

```text
Users
│
├── Reports
│      │
│      ├── Upvotes
│      ├── Comments
│      ├── Timeline Events
│      └── Report Validations
│
└── Departments
```

---

# 🔄 Report Lifecycle

```text
Citizen Reports Issue
          │
          ▼
AI Categorization
          │
          ▼
Duplicate Detection
          │
          ▼
Department Assignment
          │
          ▼
Open
          │
          ▼
In Progress
          │
          ▼
Resolved
          │
          ▼
Closed
```

---

# 📈 Dashboard Analytics

The platform provides detailed analytics including

- Total Reports
- Active Reports
- Resolved Reports
- Resolution Percentage
- Average Resolution Time
- Category Distribution
- Severity Distribution
- Weekly Trends
- User Leaderboard
- Community Statistics
- AI Predictive Insights

---

# 🚀 Deployment

Deploy easily using **Vercel**

```bash
npm install -g vercel

vercel --prod
```

After deployment,

Add all environment variables inside

```
Vercel Dashboard

↓

Project Settings

↓

Environment Variables
```

Update

```env
NEXT_PUBLIC_APP_URL=
```

to your deployed URL.
# 🔒 Security & Best Practices

Civic Saathi follows modern security practices to ensure user data and administrative functionality remain protected.

### Authentication

- Secure authentication using **Supabase Auth**
- Protected user sessions
- Email & password authentication
- Anonymous issue reporting support

### Authorization

- Role-based Admin Access
- Protected `/admin` route
- Row Level Security (RLS)
- User-specific permissions
- Admin-only report management

### Validation

- Zod schema validation
- React Hook Form validation
- Secure file upload restrictions
- Input sanitization
- Duplicate report prevention

### Storage

- Secure Supabase Storage
- Separate buckets for images and videos
- Public access only to required assets

---

# ⚡ Performance Optimizations

The platform is optimized for scalability and responsiveness.

- ⚡ Next.js App Router
- ⚡ Server Components
- ⚡ Dynamic Imports
- ⚡ Optimized Image Loading
- ⚡ Efficient Database Queries
- ⚡ Indexed PostgreSQL Tables
- ⚡ Cached AI Responses
- ⚡ Lazy Loading Components
- ⚡ Responsive UI across devices

---

# 🎯 Hackathon Problem Statement Coverage

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Image-based Issue Reporting | ✅ | Image upload with preview |
| Video-based Issue Reporting | ✅ | Video evidence support |
| AI Issue Categorization | ✅ | Google Gemini 2.0 Flash |
| Automatic Department Routing | ✅ | AI-powered routing |
| Duplicate Detection | ✅ | Geo-distance + AI similarity |
| GPS Location | ✅ | Browser Geolocation API |
| Interactive Maps | ✅ | Google Maps JavaScript API |
| Community Verification | ✅ | Upvotes + Confirm/Dispute |
| Issue Tracking | ✅ | Timeline & Status Updates |
| Resolution Proof | ✅ | Admin image upload |
| Email Notifications | ✅ | Nodemailer + Gmail |
| Analytics Dashboard | ✅ | Charts & KPIs |
| Predictive Insights | ✅ | AI-generated insights |
| Gamification | ✅ | Points, Badges & Leaderboard |
| Admin Dashboard | ✅ | Complete management portal |

---

# 🌍 Why Civic Saathi?

Most citizens experience problems like:

- Potholes
- Broken streetlights
- Garbage accumulation
- Water leakages
- Damaged roads
- Illegal dumping
- Sewer blockages

However, reporting these issues is often fragmented, time-consuming, and lacks transparency.

**Civic Saathi** simplifies this process by combining Artificial Intelligence, geolocation, community participation, and transparent issue tracking into a single platform.

Instead of simply reporting a complaint, citizens become active participants in improving their communities.

---

# 🚀 Future Enhancements

The project has significant potential for future expansion.

### AI

- AI priority prediction
- AI repair cost estimation
- AI-generated repair recommendations
- OCR for extracting text from images
- Voice-based issue reporting
- Multilingual AI assistance

### Citizen Experience

- Mobile Application (Android & iOS)
- Push Notifications
- WhatsApp Complaint Integration
- SMS Notifications
- Offline Report Submission

### Government Integration

- Integration with Municipal APIs
- Department Performance Dashboard
- Smart City Data Integration
- Automatic Work Order Generation

### Community

- Volunteer Groups
- Local Community Forums
- Reward Marketplace
- Citizen Challenges
- Monthly Community Awards

---

# 📚 Learning Outcomes

This project demonstrates practical implementation of:

- Full Stack Development
- Next.js App Router
- React & TypeScript
- PostgreSQL Database Design
- Authentication & Authorization
- Row Level Security (RLS)
- REST API Development
- Google Gemini AI Integration
- Google Maps API
- Email Automation
- Dashboard Design
- Data Visualization
- Responsive UI/UX

---

# 🧪 Testing Checklist

- ✅ User Authentication
- ✅ Report Submission
- ✅ Image Upload
- ✅ Video Upload
- ✅ AI Categorization
- ✅ Duplicate Detection
- ✅ Map Rendering
- ✅ Upvotes
- ✅ Comments
- ✅ Community Verification
- ✅ Dashboard Analytics
- ✅ Admin Panel
- ✅ Resolution Proof Upload
- ✅ Email Notifications
- ✅ Mobile Responsiveness

---

# 👨‍💻 Developer

**Shiwani Jha**

### Responsibilities

- Full Stack Development
- Frontend Design
- Backend Development
- Database Design
- AI Integration
- Dashboard Development
- UI/UX Design
- Google Maps Integration
- Authentication
- Deployment

---

# 🤝 Contributing

Contributions are always welcome!

1. Fork the repository
2. Create a new feature branch

```bash
git checkout -b feature/your-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push the branch

```bash
git push origin feature/your-feature
```

5. Open a Pull Request

---

# 🙏 Acknowledgements

Special thanks to the amazing technologies that made this project possible.

- Next.js
- React
- TypeScript
- Supabase
- PostgreSQL
- Google Gemini AI
- Google Maps Platform
- Tailwind CSS
- shadcn/ui
- Radix UI
- Lucide Icons
- React Hook Form
- Zod
- Nodemailer
- Vercel

---


# ⭐ Support

If you found this project useful,

please consider giving it a ⭐ on GitHub.

It helps others discover the project and motivates further development.

---

<div align="center">

## 🌟 Civic Saathi

### *Empowering Citizens • Building Better Communities • Solving Civic Issues with AI*

Made with ❤️ using **Next.js**, **Supabase**, **Google Gemini AI**, and **Google Maps**.

**Thank you for visiting this repository!**

</div>
