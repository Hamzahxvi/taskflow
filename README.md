# TaskFlow

A beautiful, Notion-inspired task management app — built with **React**, **Node.js/Express**, and **SQLite**.

---

## Features

- 🔐 **User registration & login** — JWT-based auth with bcrypt password hashing
- 📋 **Boards** — organise tasks into colour-coded boards (Personal, Work, Study…)
- 🏷️ **Tags** — add comma-separated tags and filter by them
- 🔴 **Priorities** — High / Medium / Low with visual indicators
- 📅 **Due dates** — overdue & today highlighting
- ✅ **Subtasks** — nested progress bars inside each task
- 🔍 **Search** — real-time fuzzy search across title, description, and tags
- ↕️ **Sort** — by creation date, due date, priority, or A–Z
- ⊞ **Grid / List view** — switch between layouts
- 🌙 **Dark mode** — persisted per device
- 🖱️ **Drag & drop** — reorder tasks by dragging
- 🎞️ **Animations** — slide-in, pop, completion, and toast notifications
- ⌨️ **Keyboard shortcuts** — `Ctrl+N` new task · `Ctrl+K` search · `Esc` close

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Backend | Node.js + Express |
| Database | SQLite (via better-sqlite3) |
| Auth | JWT + bcrypt |
| Styling | CSS custom properties, animations |

---

## Getting Started

### Prerequisites
- Node.js 18+

### Install & Run

```bash
# Install all dependencies
cd client && npm install && cd ..
cd server && npm install && cd ..
npm install

# Start both frontend and backend
npm run dev
```

The app will be available at `http://localhost:5173` (Vite dev server), proxying API calls to `http://localhost:3001`.

### Production Build

```bash
npm run build
npm start
```

The server serves the built React app from `client/dist/` on port 3001.

---

## Project Structure

```
taskflow/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── api/            # Axios client & API calls
│   │   ├── components/
│   │   │   ├── Auth/       # Login/Register screen
│   │   │   ├── Common/     # Toast notifications
│   │   │   ├── Layout/     # Sidebar
│   │   │   ├── Modals/     # Task & Board modals
│   │   │   └── Tasks/      # TaskList, TaskCard, QuickAdd
│   │   ├── context/        # React context (global state)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
├── server/                  # Express backend
│   ├── routes/
│   │   ├── auth.js         # Register, login, me
│   │   ├── tasks.js        # CRUD + reorder
│   │   └── boards.js       # CRUD
│   ├── middleware/
│   │   └── auth.js         # JWT verification
│   ├── db.js               # SQLite setup + seed data
│   └── index.js            # Express server entry
└── package.json            # Root scripts (dev, build, start)
```

---

## Demo Account

| Username | Password |
|----------|----------|
| `demo`   | `demo123` |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Sign in |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/tasks` | Yes | List all tasks |
| POST | `/api/tasks` | Yes | Create task |
| PUT | `/api/tasks/:id` | Yes | Update task |
| DELETE | `/api/tasks/:id` | Yes | Delete task |
| PUT | `/api/tasks/reorder/batch` | Yes | Reorder tasks |
| GET | `/api/boards` | Yes | List all boards |
| POST | `/api/boards` | Yes | Create board |
| DELETE | `/api/boards/:id` | Yes | Delete board |

---

## Notes

The original vanilla HTML/CSS/JS version is preserved in the root (`index.html`, `style.css`, `script.js`). The new React + Express version lives in `client/` and `server/`.

Made with ♥ as a final year CS project.
