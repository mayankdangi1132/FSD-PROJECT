# Campus Connect - College Event Management & Calendar Portal

Campus Connect is a MERN stack web app where all clubs, departments and the college administration publish their events in one place. Students can browse every event on a calendar, see full details and check the winners of competitions.

## Features

**Admin**
- Creates club and department accounts (with an official college email). There is no public sign up.
- Can edit, disable or delete organizer accounts.
- Sees and manages every event, and can approve / reject events (when approval is turned on).
- Publishes college-level events.
- Dashboard with total clubs, departments, events, upcoming and completed events.

**Clubs / Departments**
- Log in with the email and password given by the admin.
- Create, edit and delete only their own events.
- Upload a poster, add description, venue, timings, registration link, deadline and contact details.
- Single day and multi-day events.
- Add winners (position, name, USN, department, semester, team name, photo) after a competitive event is over.
- Dashboard with total / upcoming / completed events and a reminder for competitions that still need winners.

**Students** (no login needed)
- Browse all events, search by name and filter by club, department, category, date, upcoming or completed.
- Calendar with month, week and day views. Each organizer type has its own colour, today is highlighted and completed events are faded.
- Event details page with poster, timings, venue, contacts and a Winners section for competitive events.
- Student dashboard with upcoming events, a calendar, recently added events and recently published winners.

## Tech Stack

| Part | Used |
| --- | --- |
| Frontend | React (Vite), React Router, Axios, FullCalendar, plain CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcrypt password hashing |
| Images | Cloudinary (falls back to a local `uploads` folder if no keys are given) |
| API testing | Postman (`backend/postman_collection.json`) |

## Folder Structure

```
campus-connect/
├── backend/
│   ├── config/         db connection, image upload (cloudinary)
│   ├── controllers/    auth, users (organizers), events, dashboard
│   ├── middleware/     JWT auth + role check, multer upload
│   ├── models/         User, Event (winners are stored inside the event)
│   ├── routes/
│   ├── utils/          validation and date helpers
│   ├── seed.js         sample data
│   └── server.js
└── frontend/
    └── src/
        ├── components/ Navbar, EventCard, EventCalendar, EventTable ...
        ├── context/    AuthContext (login state)
        ├── pages/      Home, Events, EventDetails, CalendarPage, dashboards, forms
        ├── utils/      date/format helpers
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

Open `.env` and set `MONGO_URI` and `JWT_SECRET`. Cloudinary keys are optional.

```bash
npm run seed
npm run dev
```

`npm run seed` deletes existing data and adds an admin, 3 clubs, 2 departments and some sample events. The API runs on `http://localhost:5001`.

> We use port 5001 because on macOS port 5000 is taken by AirPlay Receiver.

### 2. Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite forwards `/api` requests to the backend, so nothing else needs to be set.

### Demo Logins (after seeding)

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@college.edu | admin123 |
| Club | codingclub@college.edu | club123 |
| Club | culturalclub@college.edu | club123 |
| Club | sportsclub@college.edu | club123 |
| Department | cse@college.edu | dept123 |
| Department | ece@college.edu | dept123 |

Change these passwords if you deploy the project anywhere.

## Environment Variables (backend/.env)

| Variable | What it does |
| --- | --- |
| `PORT` | API port (default 5001) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key used to sign login tokens |
| `CLIENT_URL` | Frontend URL allowed by CORS |
| `COLLEGE_EMAIL_DOMAIN` | If set (e.g. `college.edu`), organizer emails must end with it |
| `REQUIRE_APPROVAL` | `true` = club/department events need admin approval before students see them |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Optional. Without them images are saved in `backend/uploads` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin login created by `npm run seed` |

## API Endpoints

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Logged in |
| GET | `/api/events` | Public (filters: `search`, `organizer`, `category`, `date`, `when=upcoming/completed`) |
| GET | `/api/events/:id` | Public |
| GET | `/api/events/mine` | Organizer / Admin |
| GET | `/api/events/admin/all` | Admin |
| POST | `/api/events` | Organizer / Admin |
| PUT | `/api/events/:id` | Owner / Admin |
| DELETE | `/api/events/:id` | Owner / Admin |
| PUT | `/api/events/:id/winners` | Owner / Admin (competitive + completed events only) |
| PATCH | `/api/events/:id/status` | Admin |
| GET | `/api/organizers?role=club` | Public |
| GET / POST | `/api/users` | Admin |
| PUT / DELETE | `/api/users/:id` | Admin |
| POST | `/api/upload` | Organizer / Admin |
| GET | `/api/dashboard/admin` | Admin |
| GET | `/api/dashboard/organizer` | Club / Department |
| GET | `/api/dashboard/student` | Public |

To test in Postman, import `backend/postman_collection.json` and run **Login** first. It saves the token for the other requests.

## Security

- Passwords are hashed with bcrypt and never sent back in responses.
- Every protected route checks the JWT and the user's role on the server.
- Clubs can only edit, delete or add winners to their own events. Only the admin can manage accounts and approve events.
- Disabled accounts cannot log in, and an already issued token stops working once the account is disabled.
- All event data is validated on the backend (required fields, dates, times, links, email and phone).
