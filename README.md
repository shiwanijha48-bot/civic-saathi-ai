# 🗺️ Civic Saathi — Hyperlocal Problem Solver

> A citizen-powered platform to report, track, and resolve community civic issues through AI, collaboration, and transparency.

---

## 🌟 Overview

Civic Saathi enables citizens to identify and report local infrastructure issues like potholes, water leakages, broken streetlights, and waste management problems. Reports are automatically categorized by AI, routed to the correct department, and tracked transparently from submission to resolution.

Built for the **Community Hero — Hyperlocal Problem Solver** hackathon challenge.

---

## ✨ Features

### 📋 Issue Reporting
- Image upload with issue submission
- AI-powered auto-categorization using Google Gemini
- Keyword-based fallback classifier
- AI summary generated for each report
- Anonymous reporting option
- GPS-based geo-location tagging
- Address-based location input
- Edit & delete own reports

### 🗺️ Mapping
- Interactive Google Maps with all reported issues
- Severity-colored markers (Critical / High / Medium / Low)
- Filter issues by severity on map
- Click markers to preview report details
- User location auto-detection

### 👥 Community
- Upvote reports to show support
- Comment on reports
- Community Verification Badge — auto-awarded at 5+ upvotes
- Confirm / Dispute buttons — citizens validate report accuracy
- Community feed with all reports sorted by latest

### 📊 Tracking & Transparency
- Issue timeline with 4 stages: Open → In Progress → Resolved → Closed
- Admin can advance status with optional notes
- Full activity log on every report
- Email notification to report owner on status change (via Gmail/Nodemailer)
- Live upvote and comment counts

### 🏆 Gamification
- Points earned for reporting issues
- Badge levels: Newcomer → Reporter → Guardian → Hero → Champion
- Community leaderboard

### 📈 Dashboard & Insights
- Personal stats: reports filed, resolved, points, rank
- Predictive insights panel:
  - 🔥 Problem hotspots by category
  - 📊 Severity breakdown
  - ⚠️ Critical issues needing attention
- My recent reports
- Community feed preview

### 🛡️ Admin Panel
- Full reports table with status management
- One-click status updates per report
- Department assignment visibility
- Category breakdown bar chart
- User leaderboard with points & badges

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI | Google Gemini 2.0 Flash |
| Maps | Google Maps JavaScript API |
| Email | Nodemailer + Gmail |
| Styling | Tailwind CSS + Inline Styles |
| Icons | Lucide React |
| Toast | React Hot Toast |
| Hosting | Vercel (recommended) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Google Cloud account (Maps API + Gemini API)
- Gmail account with App Password enabled

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

Create a `.env.local` file in the root:

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

Run the following SQL in your Supabase SQL Editor:

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
  latitude double precision,
  longitude double precision,
  address text,
  upvotes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  is_anonymous boolean DEFAULT false,
  is_verified boolean DEFAULT false,
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

-- Report validations table
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
CREATE POLICY "Users can insert reports" ON reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reports" ON reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reports" ON reports FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read validations" ON report_validations FOR SELECT USING (true);
CREATE POLICY "Users can manage own validations" ON report_validations FOR ALL USING (auth.uid() = user_id);
```

### 5. Enable Gmail App Password

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Security → 2-Step Verification → Enable
3. Security → App Passwords → Create for "Mail"
4. Copy the 16-character password to `GMAIL_APP_PASSWORD`

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
civic-saathi-ai/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── admin/          # Admin dashboard
│   │   ├── community/      # All reports feed
│   │   ├── dashboard/      # User dashboard + insights
│   │   ├── map/            # Google Maps view
│   │   ├── report/         # Submit new report
│   │   └── reports/[id]/   # Report detail page
│   └── api/
│       ├── ai/classify/    # AI categorization endpoint
│       └── notify/         # Email notification endpoint
├── components/
│   ├── admin/
│   │   └── AdminStatusUpdate.tsx
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
└── types/
```

---

## 🔑 Making a User Admin

In Supabase SQL Editor:

```sql
UPDATE users SET is_admin = true WHERE email = 'youremail@gmail.com';
```

Then access the admin panel at `/admin`.

---

## 🌐 Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add all environment variables in Vercel dashboard under **Settings → Environment Variables**.

---

## 📸 Screenshots

| Dashboard | Community Feed | Issue Map |
|---|---|---|
| Personal stats & insights | All civic reports | Google Maps view |

| Report Detail | Admin Panel | Issue Timeline |
|---|---|---|
| Full report with AI summary | Manage all reports | Track issue progress |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👨‍💻 Built With ❤️ for Community Impact

Civic Saathi was built to bridge the gap between citizens and local authorities, making civic issue reporting transparent, trackable, and collaborative.

> *"Every pothole reported is a step toward better roads. Every streetlight fixed is a safer street. Together, we build better communities."*
