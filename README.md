# 🗺️ Civic Saathi — Hyperlocal Problem Solver

> A citizen-powered platform to report, track, and resolve community civic issues through AI, collaboration, and transparency.

Built for the **Community Hero — Hyperlocal Problem Solver** hackathon challenge (Problem Statement 2).

---

## 🌟 Overview

Civic Saathi bridges the gap between citizens and local authorities. Citizens can report infrastructure issues like potholes, water leakages, broken streetlights, and waste management problems. Reports are automatically categorized by AI, routed to the correct government department, and tracked transparently from submission to resolution — with email notifications at every step.

---

## ✨ Features

### 📋 Issue Reporting
- **Image upload** — attach photos of the issue (JPG, PNG, WebP — max 10MB)
- **Video upload** — attach video evidence (MP4, MOV, WebM — max 50MB)
- **AI-powered analysis** — Google Gemini 2.0 Flash auto-generates title, category, severity, department routing, and a plain-language summary
- **AI duplicate detection** — before submitting, checks if a similar report exists within 500m and warns the user
- **Anonymous reporting** — submit without revealing your identity
- **GPS location** — one-click location capture via browser geolocation
- **Manual location** — state/city/area picker for India with coordinates
- **Edit & delete** — report owners can edit title/description or delete their own reports

### 🗺️ Issue Map
- Interactive **Google Maps** showing all reported issues
- Markers color-coded by severity (Critical / High / Medium / Low)
- Filter markers by severity level
- Click any marker to preview report details
- Auto-detects user location and centers map

### 👥 Community
- **Upvoting** — show support for reports
- **Comments** — discuss issues with the community
- **Community Verification Badge** — automatically awarded when a report gets 5+ upvotes
- **Confirm / Dispute buttons** — citizens validate whether a report is accurate
- **Community feed** — browse all reports sorted by latest, with image thumbnails, badges, and stats

### 📊 Issue Tracking
- **Issue timeline** — 4-stage progress tracker: Open → In Progress → Resolved → Closed
- **Admin notes** — admins add notes at each status change (e.g. "Assigned to road repair team")
- **Activity log** — full history of every status change on each report
- **Resolution proof** — when marking resolved, admin uploads a photo and description as proof of fix
- **Email notifications** — report owner receives email when status changes; department receives email when assigned
- **Live counts** — upvotes and comments always show real-time numbers

### 📈 Dashboard & Predictive Insights
- Personal stats: reports filed, issues resolved, points earned, badge rank
- **Weekly trend chart** — bar chart of reports filed and resolved over last 7 days with resolution rate
- **Predictive insights panel**:
  - 🔥 Problem hotspots by category
  - 📊 Severity breakdown with AI tip
  - ⚠️ Critical issues needing immediate attention
- My recent reports with status badges
- Community feed preview

### 🏆 Gamification
- **Points system** — earn points for reporting issues
- **5 badge levels** — Newcomer 🌱 → Reporter 📋 → Guardian 🛡️ → Hero ⭐ → Champion 🏆
- **Community leaderboard** — top contributors ranked by points

### 🛡️ Admin Panel (/admin)
- Full reports table with inline status update dropdown
- **SLA tracker** — flags overdue issues (Critical: 1 day, High: 3 days, Medium: 7 days, Low: 14 days)
- KPI cards: Total, Open, In Progress, Resolved, Avg. resolution days, Resolution %
- **Impact charts** — category breakdown, status distribution, weekly trend, severity breakdown
- **AI predictive insights** — powered by Gemini 2.0 Flash
- User leaderboard with badge levels
- Category breakdown bar chart

### 🤖 AI Features
- Auto-categorization using Google Gemini 2.0 Flash
- Automatic department routing based on issue type
- AI-generated plain-language summary for every report
- AI duplicate detection using text similarity + geo-distance (500m radius)
- Keyword-based fallback classifier when Gemini quota is exceeded

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.9 |
| Language | TypeScript | ^5 |
| Frontend | React | 19.2.4 |
| Database + Auth + Storage | Supabase (PostgreSQL) | ^2.108.2 |
| AI | Google Gemini 2.0 Flash | @google/generative-ai ^0.24.1 |
| Maps | Google Maps JavaScript API | @react-google-maps/api ^2.20.8 |
| Email | Nodemailer + Gmail | ^9.0.1 |
| Forms | React Hook Form + Zod | ^7.80.0 / ^4.4.3 |
| Styling | Tailwind CSS | ^4.3.1 |
| Icons | Lucide React | ^1.21.0 |
| Toast notifications | React Hot Toast | ^2.6.0 |
| UI primitives | Radix UI + shadcn | ^1.6.0 |
| Unique IDs | UUID | ^14.0.1 |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)
- Google Cloud account (Maps API + Gemini API keys)
- Gmail account with 2-Step Verification enabled

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/civic-saathi-ai.git
cd civic-saathi-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Gmail (for email notifications)
GMAIL_USER=youremail@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set up Supabase database

Run this SQL in your Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id uuid REFERENCES auth.users PRIMARY KEY,
  name text,
  email text,
  is_admin boolean DEFAULT false,
  points integer DEFAULT 0,
  reports_count integer DEFAULT 0,
  badge_level text DEFAULT 'newcomer',
  created_at timestamptz DEFAULT now()
);

-- Departments table
CREATE TABLE departments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text,
  email text
);

-- Insert default departments
INSERT INTO departments (name, email) VALUES
  ('Roads & Infrastructure', 'roads@civic.gov'),
  ('Sanitation & Waste', 'sanitation@civic.gov'),
  ('Water & Utilities', 'water@civic.gov'),
  ('Electrical & Lighting', 'electrical@civic.gov'),
  ('Public Safety', 'safety@civic.gov'),
  ('Parks & Recreation', 'parks@civic.gov');

-- Reports table
CREATE TABLE reports (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  title text,
  description text,
  ai_summary text,
  category text,
  severity text DEFAULT 'medium',
  status text DEFAULT 'open',
  department_id uuid REFERENCES departments(id),
  image_url text,
  video_url text,
  latitude double precision,
  longitude double precision,
  address text,
  upvotes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  is_anonymous boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  resolution_image_url text,
  resolution_note text,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Upvotes table
CREATE TABLE upvotes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(report_id, user_id)
);

-- Comments table
CREATE TABLE comments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text,
  created_at timestamptz DEFAULT now()
);

-- Timeline events table
CREATE TABLE timeline_events (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE,
  status text,
  note text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Report validations (confirm/dispute)
CREATE TABLE report_validations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text CHECK (type IN ('confirm', 'dispute')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(report_id, user_id)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_validations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read reports" ON reports FOR SELECT USING (true);
CREATE POLICY "Users can insert reports" ON reports FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update own reports" ON reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reports" ON reports FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can update any report" ON reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
);
CREATE POLICY "Anyone can read validations" ON report_validations FOR SELECT USING (true);
CREATE POLICY "Users can manage own validations" ON report_validations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read upvotes" ON upvotes FOR SELECT USING (true);
CREATE POLICY "Users can manage own upvotes" ON upvotes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can read timeline" ON timeline_events FOR SELECT USING (true);
CREATE POLICY "Admins can insert timeline" ON timeline_events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
);
CREATE POLICY "Anyone can read users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
```

### 5. Set up Supabase Storage

In Supabase Dashboard → Storage, create two **public** buckets:
- `report-images`
- `report-videos`

### 6. Set up Gmail App Password

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Security → 2-Step Verification → Enable
3. Security → App Passwords → Create → name it `civic-saathi`
4. Copy the 16-character password into `GMAIL_APP_PASSWORD`

### 7. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Making a User Admin

Run this in Supabase SQL Editor:

```sql
UPDATE users SET is_admin = true WHERE email = 'youremail@gmail.com';
```

Then visit [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 📁 Project Structure

```
civic-saathi-ai/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── admin/page.tsx           # Admin dashboard
│   │   ├── community/page.tsx       # All reports feed
│   │   ├── dashboard/page.tsx       # User dashboard + insights
│   │   ├── map/page.tsx             # Google Maps view
│   │   ├── report/page.tsx          # Submit new report
│   │   ├── reports/[id]/page.tsx    # Report detail page
│   │   └── layout.tsx               # Sidebar layout
│   ├── api/
│   │   ├── ai/classify/route.ts     # Gemini AI categorization
│   │   ├── ai/insights/route.ts     # AI predictive insights
│   │   ├── check-duplicate/route.ts # Duplicate detection
│   │   ├── notify/route.ts          # Email notifications
│   │   └── reports/route.ts
│   ├── layout.tsx
│   └── page.tsx                     # Landing page
├── components/
│   ├── admin/
│   │   ├── AdminStatusUpdate.tsx
│   │   ├── ImpactCharts.tsx
│   │   ├── PredictiveInsights.tsx
│   │   └── ResolutionUpload.tsx
│   ├── dashboard/
│   │   └── WeeklyTrendChart.tsx
│   ├── layout/
│   │   └── Sidebar.tsx
│   └── reports/
│       ├── CommentSection.tsx
│       ├── IssueTimeline.tsx
│       ├── LocationPicker.tsx
│       ├── ReportActions.tsx
│       ├── UpvoteButton.tsx
│       ├── ValidationButtons.tsx
│       └── VerificationBadge.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── admin.ts
│   ├── constants.ts
│   ├── gemini.ts
│   ├── india-locations.ts
│   └── utils.ts
├── types/index.ts
├── .env.local            # Not committed
├── package.json
└── README.md
```

---

## 🌐 Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Add all `.env.local` variables in Vercel Dashboard → Project → Settings → Environment Variables. Update `NEXT_PUBLIC_APP_URL` to your live Vercel URL.

---

## 🎯 Problem Statement Coverage

| Requirement | Status | Implementation |
|---|---|---|
| Image-based issue reporting | ✅ | Supabase Storage, max 10MB |
| Video-based issue reporting | ✅ | Supabase Storage, max 50MB |
| AI-powered issue categorization | ✅ | Google Gemini 2.0 Flash |
| Geo-location and mapping | ✅ | Google Maps API + GPS |
| Community verification | ✅ | 5-upvote badge + Confirm/Dispute |
| Real-time issue tracking | ✅ | 4-stage timeline with activity log |
| Impact dashboards | ✅ | User dashboard + Admin dashboard |
| Predictive insights | ✅ | Hotspots + SLA tracker + Weekly trend |
| Gamification | ✅ | Points + 5 badge levels + Leaderboard |

---

## 📄 License

MIT License

---

*Built with ❤️ for Community Impact — Civic Saathi makes every citizen a guardian of their community.*
