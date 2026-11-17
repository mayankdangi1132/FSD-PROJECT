# Campus Connect - College Event Management & Calendar Portal

Campus Connect is a MERN stack web app where every club, department and the college administration publishes their events in one place. Students log in with an account created by the admin, browse events on a calendar, see full details and check the winners of competitions.

## Features

**Admin** (only the account whose email is set in `ADMIN_EMAIL`)
- Dashboard with clubs, departments, students, total / upcoming / completed events, pending approvals and inactive accounts.
- **Club Management** and **Department Management**: add, edit, activate / deactivate, delete, upload a logo, set the official login email and a temporary password, reset passwords.
- Permission per organizer: "can publish events without admin approval".
- **Student Accounts**: add students (name, college email, USN, department, semester, temporary password), edit, activate / deactivate, delete. Duplicate emails and USNs are rejected.
- Approve or reject submitted events, and create / edit / delete any event. When creating an event the admin can post it as the College Administration or on behalf of any club or department.
- Change own password from Settings.

**Clubs / Departments**
- Log in with the email and temporary password given by the admin (must change it on first login).
- Create, edit and delete only their own events (single-day, multi-day or all-day). Events wait for admin approval unless the admin gave them the auto-publish permission.
- Upload posters and publish winners (position, name, team, USN, department, semester, photo) once a competition is over.

**Students**
- No public sign up - the admin creates student accounts. First login asks them to set their own password.
- Dashboard with a welcome message, events happening today and this week, upcoming events, recently added events, a calendar, latest winners and completed events.
- Search events by name and filter by club, department, category and date.
- Students can only view published events. They cannot create, edit or delete anything.

**Calendar**
- Month, week, day and list views (list view is the default on phones).
- Events are drawn at their real times. Multi-day events show their daily timing on each day (for example 10:00 AM - 5:00 PM every day) instead of one block covering whole days. Only events marked "All-day" go in the all-day row.
- Colours: blue = club, teal = department, purple = college. Today is highlighted and completed events are faded.

**Other**
- Light and dark mode (button in the navbar, remembers your choice).
- Toast notifications, confirm dialogs before deleting, loading spinners and empty states.
- Works on mobile, tablet and desktop.

## How dates and times work (IST)

The whole app uses Indian Standard Time (Asia/Kolkata).
- The organizer types the date (`2026-11-20`) and time (`10:30`). These are saved exactly as typed, so the time shown is always the time entered.
- From them the backend also saves `startAt` / `endAt` as real dates with the +05:30 offset (stored in UTC by MongoDB, e.g. 10:30 IST = 05:00 UTC). These are used for sorting and to decide if an event is upcoming or completed, so nothing shifts even if the server runs in another timezone.

## Tech Stack

| Part | Used |
| --- | --- |
| Frontend | React (Vite), React Router, Axios, FullCalendar, lucide-react icons, plain CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcrypt password hashing, role checks on every request |
| Images | Cloudinary (falls back to a local `uploads` folder if no keys are given) |
| API testing | Postman (`backend/postman_collection.json`) |

## Folder Structure

```
campus-connect/
├── backend/
│   ├── config/         db connection, image upload (cloudinary)
│   ├── controllers/    auth, users (clubs/departments/students), events, dashboards
│   ├── middleware/     JWT auth + role check, multer upload
│   ├── models/         User, Event (winners are stored inside the event)
│   ├── routes/
│   ├── utils/          IST date helpers and validation
│   ├── createAdmin.js  creates the admin from .env (real setup)
│   ├── seed.js         demo data (deletes everything first)
│   └── server.js
└── frontend/
    └── src/
        ├── components/ Navbar, DashboardLayout, EventCard, EventCalendar, AccountManager, StudentManager ...
        ├── context/    AuthContext (login), FeedbackContext (toasts + confirm dialog)
        ├── pages/      Home, Login, Events, EventDetails, Calendar, dashboards, EventForm, Settings
        ├── utils/      date / format helpers
        └── api.js      axios instance
```

## How to Run

You need **Node.js 18+** and **MongoDB** (installed locally or a free MongoDB Atlas cluster).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

Then choose one:

```bash
npm run create-admin   # real setup: creates only the admin account, deletes nothing
npm run seed           # demo: deletes all data and adds sample clubs, departments, students and events
```

Start the API (runs on `http://localhost:5001`):

```bash
npm run dev
```

> We use port 5001 because on macOS port 5000 is taken by AirPlay Receiver.

### 2. Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite forwards `/api` requests to the backend.

### Demo Logins (after `npm run seed`)

| Role | Email | Password |
| --- | --- | --- |
| Admin | value of `ADMIN_EMAIL` | value of `ADMIN_PASSWORD` |
| Club | codingclub@college.edu | club123 |
| Club | culturalclub@college.edu | club123 |
| Club | sportsclub@college.edu | club123 |
| Department | cse@college.edu | dept123 |
| Department | ece@college.edu | dept123 |
| Student | priya@college.edu | student123 |
| Student | arjun@college.edu | student123 |

These are demo passwords only. Accounts created from the admin dashboard get a temporary password that must be changed on first login.

## Environment Variables (backend/.env)

| Variable | What it does |
| --- | --- |
| `PORT` | API port (default 5001) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key used to sign login tokens |
| `CLIENT_URL` | Frontend URL allowed by CORS |
| `COLLEGE_EMAIL_DOMAIN` | Extra check: every account the admin creates must use this domain (e.g. `college.edu`) |
| `REQUIRE_APPROVAL` | `true` = club/department events need admin approval before students see them |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Optional. Without them images are saved in `backend/uploads` |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | The admin account. Only this email gets admin access |

## API Endpoints

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Logged in |
| PUT | `/api/auth/change-password` | Logged in |
| GET | `/api/events` | Logged in (filters: `search`, `organizer`, `category`, `date`, `when=upcoming/completed`) |
| GET | `/api/events/:id` | Logged in (pending events only for owner / admin) |
| GET | `/api/events/mine` | Club / Department / Admin |
| GET | `/api/events/admin/all` | Admin |
| POST | `/api/events` | Club / Department / Admin (admin can send `organizerId`) |
| PUT | `/api/events/:id` | Owner / Admin |
| DELETE | `/api/events/:id` | Owner / Admin |
| PUT | `/api/events/:id/winners` | Owner / Admin (competitive + completed events only) |
| PATCH | `/api/events/:id/status` | Admin |
| GET | `/api/organizers?role=club` | Public (names, descriptions and logos only) |
| GET | `/api/users?role=club\|department\|student` | Admin |
| POST | `/api/users` | Admin (create club, department or student) |
| PUT / DELETE | `/api/users/:id` | Admin |
| POST | `/api/upload` | Club / Department / Admin |
| GET | `/api/dashboard/admin` | Admin |
| GET | `/api/dashboard/organizer` | Club / Department |
| GET | `/api/dashboard/student` | Logged in |

To test in Postman, import `backend/postman_collection.json` and run **Login** first. It saves the token for the other requests.

## Security

- No public registration of any kind. The admin account is created only by `npm run create-admin` (or the demo seed) from `.env`, and only the email in `ADMIN_EMAIL` gets admin access - another "admin" record put in the database is refused.
- Passwords are hashed with bcrypt and never sent back in responses.
- Every protected route checks the JWT, that the account is active, and the user's role on the server. The frontend only hides what the server would refuse anyway.
- Passwords set by the admin are temporary: until the user changes it, the API only allows the login / change-password routes.
- Clubs and departments can only change their own events. Students can only view published events.
- All input is validated on the backend (required fields, dates, times, links, emails, phone numbers, unique email and USN).
