# UniPortal Deployment Checklist

Use this checklist before pushing to GitHub and redeploying the Render backend and Vercel frontend.

## Required Backend Environment

Set these on Render for the backend service:

- `DATABASE`: MongoDB Atlas connection string.
- `DATABASE_PASSWORD`: only required when `DATABASE` contains the literal `<PASSWORD>` placeholder.
- `JWT_SECRET`: strong private signing secret.
- `JWT_EXPIRES_IN`: token lifetime, for example `7d`.
- `CLIENT_URL`: exact deployed Vercel origin, for example `https://your-app.vercel.app`.

Optional backend variables:

- `CORS_ORIGINS`: comma-separated extra allowed origins if you need more than one frontend origin.
- `DEMO_ADMIN_PASSWORD`: optional fixed password for the demo admin seed account.
- `DEMO_REGISTRAR_PASSWORD`: optional fixed password for the demo registrar seed account.
- `DEMO_STUDENT_PASSWORD`: optional fixed password shared by demo student seed accounts.

If the optional demo password variables are not set, `npm run seed:demo` generates temporary passwords and prints them in the backend terminal output.

## Required Frontend Environment

Set this on Vercel for the frontend project:

- `VITE_API_URL`: Render API base URL with `/api/v1`, for example `https://your-render-service.onrender.com/api/v1`.

The production frontend intentionally fails fast if `VITE_API_URL` is missing.

## Production URL Checks

- Backend CORS allows `CLIENT_URL` and optional `CORS_ORIGINS`.
- `CLIENT_URL` must be the origin only, with no path and preferably no trailing slash.
- Frontend API calls use `VITE_API_URL`.
- Render health check should pass at `/api/v1/health`.

## Git Push Checklist

1. Confirm `.env`, `config.env`, and build outputs are not staged.
2. Run backend checks:
   ```bash
   cd server
   for f in src/controllers/*.js src/routes/*.js src/models/*.js src/middlewares/*.js src/scripts/*.js src/app.js src/server.js; do node --check "$f" || exit 1; done
   node -e "require('./src/app'); console.log('app loaded')"
   ```
3. Run frontend checks:
   ```bash
   cd client
   npm run lint
   npm run build
   ```
4. Review changed files with `git status --short`.
5. Push to GitHub only after checks pass.

## Render Redeploy Checklist

1. Confirm Render root directory is `server`.
2. Build command: `npm install`.
3. Start command: `npm start`.
4. Confirm all required backend env vars are present.
5. Confirm MongoDB Atlas network access allows Render.
6. Redeploy latest GitHub commit.
7. Verify `https://your-render-service.onrender.com/api/v1/health`.
8. Watch logs for DB connection, CORS, and route import errors.

## Vercel Redeploy Checklist

1. Confirm Vercel root directory is `client`.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Set `VITE_API_URL` to the Render backend `/api/v1` URL.
5. Redeploy latest GitHub commit.
6. Open the deployed frontend and confirm login reaches the Render API.

## Demo Data Setup

Run the demo seed from the backend folder against the intended demo database:

```bash
cd server
npm run seed:demo
```

The seed creates or updates demo users, academic structure, courses, an active academic session, sample enrollments, and one academic record. It does not delete existing data.

Demo account emails:

- Admin: `admin@uniportal.demo`
- Registrar: `registrar@uniportal.demo`
- Student: `john.student@uniportal.demo`
- Student: `amina.student@uniportal.demo`

Passwords are printed by the seed command. Do not commit real credentials.

## Go/No-Go

Go when:

- Backend checks pass.
- Frontend lint and build pass.
- Render health route responds.
- Vercel frontend uses the deployed Render API.
- Login works for admin, registrar, and student demo accounts.
- Enrollment review, enrollment slip, and academic records pages load in production.
