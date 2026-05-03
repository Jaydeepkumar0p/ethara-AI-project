# ⚡ TaskFlow — Team Task Manager

A full-stack MERN application with cinematic anime-inspired UI, role-based access control, real-time task management, and email notifications.

---

## 🚀 Live Demo

> Deploy using the instructions below. App **must be live** for submission.

---

## 🏗️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18 + Vite, Tailwind CSS, DaisyUI, Zustand, Framer Motion, Axios, Recharts |
| Backend | Node.js, Express.js, MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Email | Nodemailer (Gmail SMTP) |
| Deploy | Render (backend) + Vercel / Render Static (frontend) |

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── models/          User, Project, Task
│   ├── routes/          auth, projects, tasks, users
│   ├── middleware/       protect, adminOnly, projectMember
│   ├── utils/           email.js (nodemailer templates)
│   ├── server.js
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/   HeroScene, Navbar, Dashboard, UI
│   │   ├── hooks/        useScrollProgress.js
│   │   ├── pages/        Home, Auth, Dashboard, Projects, Tasks, Profile
│   │   ├── store/        authStore, taskStore, projectStore, themeStore
│   │   └── utils/        api.js (axios instance)
│   └── .env.example
└── render.yaml
```

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier)
- Gmail account (for email notifications)

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd taskflow

# Install all dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 2. Backend Environment Variables
```bash
cd backend
cp .env.example .env
# Fill in your values:
```

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/taskflow?retryWrites=true&w=majority

# JWT Secret (use a long random string in production)
JWT_SECRET=change_this_to_a_very_long_random_secret_key
JWT_EXPIRES_IN=7d

# Gmail SMTP (create App Password at myaccount.google.com/apppasswords)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=TaskFlow <your_gmail@gmail.com>

# Frontend URL for CORS and email links
CLIENT_URL=http://localhost:5173
```

### 3. Start Development Servers
```bash
# Terminal 1 - Backend (runs on :5000)
cd backend && npm run dev

# Terminal 2 - Frontend (runs on :5173)
cd frontend && npm run dev
```

Open `http://localhost:5173`

---

## 🌐 Deployment on Render

### Backend Deployment

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your repository
4. Configure:
   - **Name**: `taskflow-api`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free
5. Add Environment Variables (same as `.env` above but with production values):
   - `NODE_ENV` = `production`
   - `MONGO_URI` = your Atlas URI
   - `JWT_SECRET` = strong random key
   - `CLIENT_URL` = your frontend URL (set after deploying frontend)
   - All email vars

### Frontend Deployment (Vercel — recommended)

```bash
cd frontend
npm run build
# dist/ folder is ready
```

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your repo
3. Set:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`

### Alternative: Render Static Site (Frontend)
1. New → Static Site
2. Root: `frontend`
3. Build: `npm install && npm run build`
4. Publish: `dist`

---

## 🔐 Environment Variables Reference

### Backend `.env`

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `production` |
| `MONGO_URI` | MongoDB Atlas URI | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret | Long random string |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | Gmail address | `you@gmail.com` |
| `EMAIL_PASS` | Gmail App Password | 16-char password |
| `EMAIL_FROM` | Sender display name | `TaskFlow <you@gmail.com>` |
| `CLIENT_URL` | Frontend URL | `https://taskflow.vercel.app` |

### Frontend `.env`

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.onrender.com/api` |

---

## 📧 Gmail App Password Setup

1. Enable 2FA on your Google account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Generate password for "Mail" → "Other (custom name)"
4. Use the 16-char password as `EMAIL_PASS`

---

## 📊 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| POST | `/api/auth/forgot-password` | Request reset |
| POST | `/api/auth/reset-password/:token` | Reset password |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/members` | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Remove member |
| GET | `/api/projects/:id/stats` | Get project stats |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (filterable) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/comments` | Add comment |
| GET | `/api/tasks/dashboard/stats` | Dashboard stats |

---

## 🎬 UI Features

### Cinematic Hero Scene
- SVG-based sky gradient (purple/blue → orange tones)
- Animated clouds using CSS transforms
- Distant city silhouette with lit windows
- Moon/sun orb with glow effects
- Floating particle effects
- Stars for dark mode

### Scroll Animation Phases
- **0–30%**: Sky color shift, cloud movement, text fade-in
- **30–60%**: City silhouette fades in with depth, CTA buttons appear
- **60–100%**: Scene transitions, hero compresses

### Performance Optimizations
- `requestAnimationFrame` for all scroll animations
- CSS `will-change: transform` on animated elements
- `contain: paint` on hero container
- Lazy loading all routes via `React.lazy + Suspense`
- Skeleton loaders prevent blank screens
- Low-end device detection reduces particle count

---

## 👥 Roles & Permissions

| Action | Admin | Member |
|--------|-------|--------|
| Create project | ✅ | ✅ |
| Delete project | Owner only | Owner only |
| Add members | Owner/Admin | ❌ |
| Create tasks | ✅ | ✅ (in member projects) |
| Update any task | ✅ | Own/Assigned only |
| Delete any task | ✅ | Own only |
| View all users | ✅ | ❌ |

---

## 🌙 Dark / Light Mode

- Auto-detects system preference on first load
- Persisted in `localStorage`
- No FOUC (flash of unstyled content) via inline script in `<head>`
- DaisyUI custom themes: `taskflow` (dark) and `taskflow_light`

---

## 📱 Mobile Optimization

- Fully responsive layouts (mobile-first Tailwind)
- Reduced animation complexity on low-end devices
- Touch-friendly button sizing
- Smooth scrolling with `passive` event listeners

---

## 🏗️ Build Commands

```bash
# Frontend build (output: frontend/dist/)
cd frontend && npm run build

# Backend production start
cd backend && node server.js

# Full production setup
cd backend && npm install && node server.js
```

---

## 🤝 Contributing

Built as a full-stack assignment demonstrating:
- MERN stack proficiency
- Cinematic UI/UX with performance focus
- REST API design with validation
- JWT authentication + RBAC
- Email notification system
- Responsive, accessible design

---

*Built with ❤️ — TaskFlow Team Task Manager*
