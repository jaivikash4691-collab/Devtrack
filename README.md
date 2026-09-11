# DevTrack — Project Management & Health Monitoring Platform

<div align="center">

![DevTrack Banner](https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80)

**Intelligent Project Health & Productivity Telemetry for Student Developer Teams, Hackathons, and Agile Squads**

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-REST_API-black.svg)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-010101.svg)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 1. Project Overview

**DevTrack** is a full-stack, production-grade MERN platform designed to answer the questions that traditional project management tools ignore:

* **What tasks are completed vs overdue?**
* **Are deliverables and milestones on track before the deadline?**
* **Is the team actively contributing, or is workload bottlenecked on one developer?**
* **What is the true, quantified health of the project?**

Unlike generic Todo or clone applications, DevTrack introduces a **Proprietary Project Health Engine** that mathematically aggregates task status velocity, milestone deliverables, deadline adherence, and active team contributions into an intuitive **0–100 Health Score** accompanied by automated, actionable **Smart Insights**.

---

## 2. Key Features

### 🚀 Proprietary Project Health Intelligence
- **5-Factor Weighted Formulation**: Evaluates Task Completion (30%), Milestone Progress (20%), Deadline Performance (20%), Team Participation (15%), and Recent Project Activity (15%).
- **Health Status Categorization**: Instant visual feedback via `Healthy` (80–100), `Needs Attention` (60–79), `At Risk` (40–59), and `Critical` (0–39).
- **Rule-Based Smart Insights**: Automated bottleneck detection (e.g., *"3 tasks overdue"*, *"Workload concentrated on Alex (70%)"*, *"Backend milestone behind schedule"*).

### 📋 Dual Task Management (Kanban + List View)
- **Interactive Kanban Board**: 4-column agile board (`To Do`, `In Progress`, `Review`, `Completed`) with HTML5 drag-and-drop.
- **Rich Task Detail Modal**: Subtask checklists, priority indicators (`Low`, `Medium`, `High`, `Critical`), assignee avatars, deadline countdowns, and discussion comment feeds.
- **Instant Status Recalculation**: Moving a task immediately updates project velocity and recalculates project health in real-time.

### 🎯 Milestone Roadmap Timeline
- Structure complex software deliverables into scheduled milestones.
- Real-time linked task completion progress tracking with milestone achievement celebrations.

### 🐙 Live GitHub Repository Telemetry
- Connects directly to GitHub REST API to synchronize repository stars, forks, open issues count, recent commit logs, and top contributor commit distributions.
- Built-in caching layer to protect against GitHub API rate limits.

### 👥 Team Workload & Role-Based Access Control (RBAC)
- **Three Distinct Roles**:
  - **Student / Member**: Update assigned tasks, manage subtasks, post comments, view analytics.
  - **Project Manager / Lead**: Create projects, invite/remove members, manage milestones, adjust roles, connect GitHub repositories.
  - **Administrator**: System-wide oversight, platform statistics, user moderation, and workspace audit.
- **Workload Balance Matrix**: Track individual task distributions to prevent member burnout.

### ⚡ Real-Time Layer (Socket.IO)
- Instant multi-client synchronization for task status changes, comment discussions, activity timeline logs, and personal notifications without page refreshes.

---

## 3. Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | High-performance SPA with modern React hooks & Context API |
| **Styling** | Custom Vanilla CSS | Developer dark theme, design tokens, glass card elevation |
| **Icons & Animation** | Lucide React, Canvas Confetti | Crisp vector icons and milestone celebrations |
| **Backend** | Node.js, Express.js | Modular REST API with centralized error handling & validation |
| **Database** | MongoDB, Mongoose | Schema validation, compound indexing, in-memory dev fallback |
| **Real-Time** | Socket.IO | Bi-directional room-based event broadcasting |
| **External APIs** | GitHub REST API (v3) | Live repository statistics & commit synchronization |
| **Security** | JWT, BcryptJS, Helmet, Rate-Limit | Strict password hashing, rate limiting, and RBAC middleware |
| **Testing** | Jest, Supertest | Automated unit & integration testing suite |

---

## 4. System Architecture

```
devtrack/
├── backend/
│   ├── config/             # Database connection, JWT & Socket.IO initialization
│   ├── controllers/        # Express controllers (Auth, Project, Task, Milestone, Health, GitHub, Admin)
│   ├── middleware/         # Auth verification, role checks, rate limiting, error handling
│   ├── models/             # Mongoose schemas (User, Project, Task, Milestone, Activity, Notification)
│   ├── routes/             # REST endpoint routing definitions
│   ├── services/           # Health scoring algorithm, GitHub API client, Activity logger
│   ├── utils/              # Seed scripts and express-validator schemas
│   ├── tests/              # Jest integration and unit tests
│   ├── app.js              # Express app pipeline
│   └── server.js           # HTTP + WebSocket server startup
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI (HealthGauge, Kanban, Milestones, GitHub, Modals)
│   │   ├── context/        # AuthContext, ProjectContext, SocketContext, ToastContext
│   │   ├── pages/          # Landing, Login, Register, Dashboard, Projects, Workspace, Admin, Profile
│   │   ├── services/       # Axios API client with automatic token injection
│   │   ├── styles/         # Design tokens (index.css), layout (layout.css), kanban (kanban.css)
│   │   ├── App.jsx         # App route definitions
│   │   └── main.jsx        # React root entry
│   └── index.html          # SEO-optimized HTML5 shell
```

---

## 5. Project Health Score Algorithm

The health score formula computes an objective project health score between `0` and `100`:

$$\text{Overall Health} = 0.30 \cdot C_{\text{task}} + 0.20 \cdot P_{\text{milestone}} + 0.20 \cdot D_{\text{deadline}} + 0.15 \cdot A_{\text{team}} + 0.15 \cdot A_{\text{recent}}$$

### Factor Formulations:
1. **Task Completion Score ($C_{\text{task}}$)** ($30\%$):
   $$C_{\text{task}} = \min\left(100, \left\lfloor \frac{N_{\text{completed}} \cdot 1.0 + N_{\text{review}} \cdot 0.8 + N_{\text{in\_progress}} \cdot 0.5}{N_{\text{total}}} \cdot 100 \right\rfloor\right)$$
2. **Milestone Progress Score ($P_{\text{milestone}}$)** ($20\%$):
   $$P_{\text{milestone}} = \max\left(0, \overline{\text{Progress}} - 15 \cdot N_{\text{delayed}}\right)$$
3. **Deadline Performance Score ($D_{\text{deadline}}$)** ($20\%$):
   $$D_{\text{deadline}} = \max\left(0, \left(1 - \frac{N_{\text{overdue}}}{N_{\text{total}}}\right) \cdot 100\right) - \text{DeadlinePenalty}$$
4. **Team Participation Score ($A_{\text{team}}$)** ($15\%$):
   $$A_{\text{team}} = \min\left(100, \frac{M_{\text{active 14d}}}{M_{\text{total}}} \cdot 100\right)$$
5. **Recent Activity Cadence ($A_{\text{recent}}$)** ($15\%$):
   $$A_{\text{recent}} = \min\left(100, \frac{\text{Actions}_{\text{last 7d}}}{10} \cdot 100\right)$$

---

## 6. REST API Endpoints

### Authentication
* `POST /api/auth/register` — Register user
* `POST /api/auth/login` — Authenticate and receive JWT token
* `GET /api/auth/me` — Current user profile
* `PUT /api/auth/profile` — Update name, bio, skills, avatar
* `PUT /api/auth/change-password` — Change password

### Projects
* `GET /api/projects` — List user's project workspaces
* `POST /api/projects` — Create project
* `GET /api/projects/:id` — Get project details & statistics
* `PUT /api/projects/:id` — Update project metadata
* `DELETE /api/projects/:id` — Delete project (Owner/Admin)
* `POST /api/projects/:id/members` — Add/Invite member
* `DELETE /api/projects/:id/members/:userId` — Remove member

### Tasks
* `GET /api/projects/:projectId/tasks` — List tasks with filters
* `POST /api/projects/:projectId/tasks` — Create task
* `GET /api/tasks/:id` — Task details
* `PUT /api/tasks/:id` — Update task status / priority / fields
* `DELETE /api/tasks/:id` — Delete task
* `POST /api/tasks/:id/comments` — Add discussion comment

### Milestones & Health
* `GET /api/projects/:projectId/milestones` — List milestones with linked progress
* `POST /api/projects/:projectId/milestones` — Create milestone
* `GET /api/projects/:projectId/health` — Calculate real-time health score & insights

### GitHub & Activity
* `GET /api/projects/:projectId/github` — Live repository stats, commits, contributors
* `POST /api/projects/:projectId/github/sync` — Refresh repository cache
* `GET /api/projects/:projectId/activity` — Project audit log timeline

### Administration (Admin Only)
* `GET /api/admin/stats` — Platform metrics & health distribution
* `GET /api/admin/users` — User directory
* `PUT /api/admin/users/:id/toggle-status` — Enable/Disable user
* `PUT /api/admin/users/:id/role` — Update system role

---

## 7. Running Locally

### Prerequisites
- Node.js `v18+` or `v20+`
- NPM `v9+`

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/devtrack.git
cd devtrack

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables
Create `.env` in `backend/`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/devtrack
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
GITHUB_TOKEN=
```
*(Note: If `MONGODB_URI` is left blank or local MongoDB is not running, the backend will automatically spin up an in-memory database for immediate testing).*

Create `.env` in `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Seed Demo Data
```bash
cd backend
npm run seed
```

### 4. Start Development Servers
```bash
# In backend directory
npm run dev

# In frontend directory (in a new terminal)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 8. Demo Credentials

Use these pre-configured accounts to explore different permission levels:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Project Lead / PM** | `priya@devtrack.io` | `Password123!` | Create/edit projects, milestones, invite members, sync GitHub |
| **Full-Stack Developer** | `arun@devtrack.io` | `Password123!` | Update assigned tasks, subtasks, add comments, view stats |
| **UI/UX Designer** | `karthik@devtrack.io` | `Password123!` | Manage UI tasks, view roadmaps, post feedback |
| **Platform Administrator** | `admin@devtrack.io` | `Password123!` | System-wide statistics, user moderation, all workspaces |

---

## 9. Automated Testing

Run the comprehensive Jest test suite:
```bash
cd backend
npm test
```
Verifies authentication flows, JWT validation, project permissions, task lifecycles, and health scoring calculations.

---

## 10. Deployment

- **Frontend**: Connect repository to [Vercel](https://vercel.com) with root directory set to `frontend` and build command `npm run build`.
- **Backend**: Deploy `backend` to [Render](https://render.com) or [Railway](https://railway.app) with start command `node server.js`.
- **Database**: Connect to a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster by setting `MONGODB_URI`.

---

## 11. Author & License

Built with ❤️ by the **DevTrack Engineering Team**. Released under the [MIT License](LICENSE).
