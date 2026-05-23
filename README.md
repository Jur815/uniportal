# UniPortal

UniPortal is a MERN-based institutional MVP for university academic setup, student management, course registration, registrar approval, enrollment slips, and academic record foundations.

It is prepared for demo and pilot discussions with universities and colleges. It should be presented as a focused academic registration and registrar workflow MVP, not yet as a complete production Student Information System.

## Current Demo Scope

UniPortal currently supports:

- JWT authentication and role-based access control.
- Admin, registrar, and student user roles.
- Admin dashboard with institutional KPIs.
- Registrar dashboard with enrollment review KPIs.
- Faculty, department, and program academic setup.
- Course creation, management, search/filter, activate/deactivate, and course detail views.
- Student management with academic identity fields.
- Admin-created student accounts and linked student profiles.
- Academic session and enrollment window control.
- Student course browsing and enrollment requests.
- Registrar approval workflow with pending, approved, rejected, and correction-required statuses.
- Registrar decision audit logs.
- Student enrollment status views.
- Printable approved enrollment slips.
- Academic records foundation with courses, credits, grades, GPA, and remarks.
- Institutional demo seed data and demo readiness guide.

## Honest Positioning

Use this language for presentations:

> UniPortal is an institutional MVP focused on academic setup, student management, course registration, registrar approval, enrollment slips, and academic record foundations. It demonstrates the core academic registration workflow universities need before expanding into admissions, fees, timetables, lecturer portals, attendance, reporting, and full transcript processing.

Avoid presenting the current system as a complete production SIS. The current build is suitable for a live institutional MVP demo and early pilot discovery after environment, data, and security checks are completed.

## Tech Stack

Backend:

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- JWT
- bcryptjs
- Helmet
- Express rate limiting

Frontend:

- React
- Vite
- React Router
- Axios
- React Hot Toast
- CSS modules/global CSS in `client/src/index.css`

## Project Structure

```text
uniportal/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── app/routes/
│   │   ├── components/
│   │   └── features/
│   ├── package.json
│   └── vercel.json
├── server/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   └── scripts/
│   └── package.json
└── docs/
```

## Local Setup

Backend:

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Frontend:

```bash
cd client
npm install
cp .env.example .env.development
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api/v1`
- Backend health check: `http://localhost:5000/api/v1/health`

## Required Environment Variables

Backend:

```env
NODE_ENV=development
PORT=5000
DATABASE=mongodb+srv://username:<PASSWORD>@cluster.mongodb.net/uniportal
DATABASE_PASSWORD=only_required_if_DATABASE_contains_<PASSWORD>
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CORS_ORIGINS=
```

Frontend:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

Never commit real `.env` or `config.env` files.

## Demo Seed Data

Run the institutional demo seed from the backend folder:

```bash
cd server
npm run seed:demo
```

The seed creates or updates:

- Demo admin and registrar accounts.
- Sample student accounts.
- Faculties, departments, and programs.
- Courses.
- Active and historical academic sessions.
- Pending, approved, rejected, and correction-required enrollments.
- Registrar decision audit history.
- Academic records for approved enrollments.

Passwords are generated or read from environment variables and printed in the terminal output. Do not hardcode demo passwords in frontend code or public docs.

Optional seed password variables:

```env
DEMO_ADMIN_PASSWORD=
DEMO_REGISTRAR_PASSWORD=
DEMO_STUDENT_PASSWORD=
```

## Useful Scripts

Backend:

```bash
cd server
npm run dev
npm start
npm run seed:academic
npm run seed:demo
```

Frontend:

```bash
cd client
npm run dev
npm run lint
npm run build
npm run preview
```

## Pre-Presentation Verification

Run backend syntax/module checks:

```bash
cd server
for f in src/controllers/*.js src/routes/*.js src/models/*.js src/middlewares/*.js src/scripts/*.js src/app.js src/server.js; do node --check "$f" || exit 1; done
node -e "require('./src/app'); console.log('app loaded')"
```

Run frontend checks:

```bash
cd client
npm run lint
npm run build
```

Then run the live smoke test in `docs/demo-smoke-test.md`.

## Render Backend Deployment

Create a Render Web Service:

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/v1/health`

Required Render environment variables:

```env
NODE_ENV=production
DATABASE=your_mongodb_atlas_connection_string
DATABASE_PASSWORD=only_required_if_DATABASE_contains_<PASSWORD>
JWT_SECRET=your_strong_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-vercel-app.vercel.app
CORS_ORIGINS=
```

MongoDB Atlas must allow Render network access. If login or API requests fail with 502, check Render logs and Atlas network/database credentials first.

## Vercel Frontend Deployment

Create a Vercel project:

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`

Required Vercel environment variable:

```env
VITE_API_URL=https://your-render-service.onrender.com/api/v1
```

The deployed frontend must point to the Render API URL including `/api/v1`.

## Live Demo Flow

Recommended presentation path:

1. Login as admin.
2. Show dashboard KPIs and active academic session.
3. Show demo readiness page.
4. Show faculties, departments, programs, and courses.
5. Show student management and student academic identity.
6. Show course detail with enrollment counts.
7. Switch to student and request/view enrollment.
8. Switch to registrar and approve/reject/return an enrollment.
9. Show registrar audit log.
10. Return to student and show approved enrollment slip.
11. Show academic records foundation.

## Known Pilot Gaps

Recommended future modules after presentation:

- Reports and exports.
- Admissions/intake management.
- Lecturer portal and grade submission.
- Timetable/scheduling.
- Attendance.
- Fees/payments.
- Notifications and announcements.
- Document uploads.
- Password reset and stronger account lifecycle tools.
- Broader audit logging for admin actions.

## Documentation

Key docs:

- `docs/deployment-checklist.md`
- `docs/demo-smoke-test.md`
- `docs/uniportal-demo-user-manual.md`
- `docs/mvp-demo-checklist.md`
- `docs/student-profile-studentId-index-migration.md`

## Author

Peter Jur Makender Makech  
Sky High Tech  
Juba, South Sudan

## License

MIT
