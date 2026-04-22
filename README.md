# ✦ TaskFlow

A beautiful, Notion-inspired to-do list web app — built with vanilla HTML, CSS, and JavaScript. No frameworks, no backend, no build step.

**[Live Demo →](https://Hamzahxvi.github.io/taskflow)**

---

## Features

- 🔐 **User registration & login** — multiple accounts, all stored locally
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

## Deploy to GitHub Pages

### Step 1 — Create a repository

```bash
git init
git add .
git commit -m "Initial commit"
```

### Step 2 — Push to GitHub

```bash
gh repo create taskflow --public --push
# or manually:
git remote add origin https://github.com/YOUR-USERNAME/taskflow.git
git branch -M main
git push -u origin main
```

### Step 3 — Enable GitHub Pages

1. Go to your repo on GitHub
2. Click **Settings** → **Pages**
3. Under *Source*, select **Deploy from a branch**
4. Choose **main** branch and `/ (root)` folder
5. Click **Save**

Your site will be live at:
`https://YOUR-USERNAME.github.io/taskflow`

> **Note:** GitHub Pages may take 1–3 minutes to go live after the first push.

---

## Project Structure

```
taskflow/
├── index.html    # App shell + auth + modals
├── style.css     # All styles, animations, dark mode
├── script.js     # Auth, task logic, UI rendering
└── README.md
```

---

## Demo Account

| Username | Password |
|----------|----------|
| `demo`   | `demo123` |

---

## Tech Stack

- **HTML5** — semantic structure
- **CSS3** — custom properties, animations, grid, flexbox
- **Vanilla JS** — no frameworks
- **localStorage** — client-side persistence per user
- **Google Fonts** — Fraunces (serif) + Plus Jakarta Sans

---

## Notes

> ⚠️ This is a **client-side only** app. Passwords are Base64 encoded in localStorage — suitable for a portfolio project, but **not for production use**. For a real app, use a backend with proper hashing (bcrypt) and a database.

---

## Screenshots

| Light Mode | Dark Mode |
|:---:|:---:|
| Auth screen with floating cards | App with boards, tags, progress |

---

Made with ♥ as a final year CS project.
