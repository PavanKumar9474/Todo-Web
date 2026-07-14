# TaskFlow — Smart Task Manager

A full-stack todo/task management web app with a Django REST API backend and a React/Vite frontend.

## Tech Stack

| Layer     | Technology                                    |
|-----------|-----------------------------------------------|
| Frontend  | React 19, Vite 8, React Router 7, Lucide Icons |
| Styling   | Vanilla CSS (custom design system, dark mode) |
| Backend   | Django 5, Django REST Framework               |
| Auth      | DRF Token Authentication                     |
| Database  | SQLite (dev) — swap to PostgreSQL for prod    |

---

## Features

- **Authentication** — Register & login with email/password (Token-based)
- **Full Task CRUD** — Create, read, update, delete tasks via REST API
- **Dashboard View** — Greeting banner, stats cards, calendar, productivity ring
- **Task Metadata** — Category (Personal/Work/Study/Health/Shopping), Priority (High/Medium/Low), Due date, Important flag
- **Calendar** — Month view with task-dot indicators (pending/completed)
- **Analytics** — Productivity %, stats by category, weekly completions
- **Search & Sort** — Live search + 6 sort options
- **Multiple Views** — Dashboard, Today, Upcoming, All, Completed, Important, Analytics
- **Collapsible Sidebar** — With navigation, project categories, tags
- **Dark Mode** — Automatic via `prefers-color-scheme`
- **Responsive** — Works on desktop → tablet → mobile

---

## Project Structure

```
TODOAPP/
├── TodoBackend/
│   ├── requirements.txt
│   └── backend/
│       ├── manage.py
│       ├── db.sqlite3
│       ├── todoapp/          # Django app
│       │   ├── models.py     # Task model
│       │   ├── serializers.py
│       │   ├── views.py      # TaskViewSet, RegisterView, CustomAuthToken
│       │   ├── urls.py
│       │   ├── admin.py
│       │   └── tests.py      # Full test suite (17 tests)
│       └── todobackend/      # Django project config
│           ├── settings.py
│           └── urls.py
└── TodoFrontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx           # Routes (/, /auth, /dashboard)
        ├── App.css           # Full design system + dashboard layout
        ├── landing.css       # Landing page styles
        ├── api.js            # Fetch helpers for all API calls
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── AuthPage.jsx
        │   └── TodoPage.jsx  # Main dashboard (703 lines)
        └── components/
            ├── TodoForm.jsx      # Collapsible form with category/priority
            ├── TodoItem.jsx      # Item with category chip, priority badge, due date
            ├── TodoList.jsx
            ├── Calendar.jsx      # Month calendar with task dots
            └── CircularProgress.jsx
```

---

## Getting Started

### Backend

```bash
cd TodoBackend/backend

# Install dependencies (use a virtualenv)
pip install -r ../requirements.txt

# Apply migrations (already done — db.sqlite3 is included)
python manage.py migrate

# Create a superuser (optional — for /admin panel)
python manage.py createsuperuser

# Run tests
python manage.py test

# Start the server
python manage.py runserver
```

The API will be available at: **http://127.0.0.1:8000/api/**

### Frontend

```bash
cd TodoFrontend

# Install dependencies
npm install

# Start dev server (proxies /api to Django automatically)
npm run dev
```

The app will be at: **http://localhost:5173**

---

## API Endpoints

| Method | Endpoint            | Auth Required | Description          |
|--------|---------------------|---------------|----------------------|
| POST   | `/api/register/`    | No            | Register new user    |
| POST   | `/api/login/`       | No            | Login, get token     |
| GET    | `/api/tasks/`       | Yes           | List user's tasks    |
| POST   | `/api/tasks/`       | Yes           | Create a task        |
| GET    | `/api/tasks/{id}/`  | Yes           | Get a specific task  |
| PATCH  | `/api/tasks/{id}/`  | Yes           | Update a task        |
| DELETE | `/api/tasks/{id}/`  | Yes           | Delete a task        |

### Authentication Header
```
Authorization: Token <your_token>
```

### Task Schema
```json
{
  "id": 1,
  "text": "Read Chapter 5",
  "completed": false,
  "important": false,
  "date": "2026-07-14",
  "dueDate": "2026-07-20",
  "category": "study",
  "priority": "high",
  "created_at": "2026-07-14T08:00:00Z",
  "updated_at": "2026-07-14T08:00:00Z"
}
```
