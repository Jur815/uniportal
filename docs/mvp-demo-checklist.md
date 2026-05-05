# UniPortal MVP Demo Checklist

Use this checklist before and during an MVP demo. Replace placeholder URLs and
credentials with the current demo environment values.

## Demo Accounts

- Admin email:
- Admin password:
- Student email:
- Student password:
- Frontend URL:
- Backend URL:

## 1. Admin Login Flow

- Open the deployed frontend URL.
- Go to `/login`.
- Log in with the admin account.
- Confirm redirect to `/dashboard`.
- Confirm dashboard shows the admin name, email, and role.
- Confirm admin-only enrollment review access is available.

Success signal: admin reaches the dashboard and can open enrollment management.

## 2. Admin Course Creation

- Confirm at least one course exists before the student demo.
- If course creation is routed in the current build, create a course with:
  - Title
  - Code
  - Credit hours
  - Semester
  - Level
- If course creation is not exposed in the UI, seed or create courses through
  the backend/admin tooling before the demo.
- Confirm the course appears on the Courses page.

Success signal: students can see active courses for enrollment.

## 3. Student Login Flow

- Log out from the admin session.
- Log in with the student account.
- Confirm redirect to `/dashboard`.
- Confirm dashboard shows student name, email, and role.
- Confirm student routes are available: Courses, My Courses, Profile.

Success signal: student reaches dashboard and cannot access admin enrollment
management.

## 4. Student Profile Update

- Open `/profile`.
- Confirm current name/email display loads.
- Update the visible profile form.
- Submit the form.
- Confirm success message appears.
- Refresh the page and confirm the page still loads without API errors.

Success signal: profile update returns a successful response and the UI does not
simulate success without backend connectivity.

## 5. Student Course Enrollment

- Open `/courses`.
- Pick an active course for the current academic year.
- Click Enroll.
- Confirm success toast appears.
- Confirm the course card changes to an enrolled/disabled state.
- Try enrolling in the same course again if possible.

Success signal: duplicate enrollment is prevented with a clean message.

## 6. My Courses Verification

- Open `/my-courses`.
- Confirm the enrolled course appears.
- Confirm course details are populated:
  - Title
  - Code
  - Credit hours
  - Semester
  - Level
  - Enrollment status
- Confirm total courses and total credits are correct.

Success signal: My Courses reflects the enrollment created in the previous
step.

## 7. Admin Enrollment Review

- Log out as student.
- Log in as admin.
- Open `/admin/enrollments`.
- Confirm the student enrollment appears.
- Confirm student and course details are populated.
- Approve or reject the enrollment.
- Confirm status updates in the UI.
- Refresh and confirm the status persists.

Success signal: admin can review and update enrollment status.

## 8. Production Deployment Checks

- Backend health route works:
  - `GET /api/v1/health`
- Render environment variables are set:
  - `NODE_ENV=production`
  - `DATABASE`
  - `DATABASE_PASSWORD` if `DATABASE` contains `<PASSWORD>`
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN`
  - `CLIENT_URL`
- Vercel environment variable is set:
  - `VITE_API_URL=https://your-render-service.onrender.com/api/v1`
- `CLIENT_URL` exactly matches the Vercel origin and has no trailing slash.
- MongoDB Atlas allows the Render backend to connect.
- Browser network requests from Vercel go to the Render `/api/v1` URL.
- React Router refresh works on deep routes such as `/dashboard` and
  `/my-courses`.

## 9. Common Failure Points

- `VITE_API_URL` missing in Vercel, causing production frontend startup failure.
- `CLIENT_URL` mismatch, causing CORS errors.
- Render health check path not set to `/api/v1/health`.
- MongoDB Atlas network access blocking Render.
- Wrong MongoDB username/password or unescaped special characters.
- `DATABASE` contains `<PASSWORD>` but `DATABASE_PASSWORD` is missing.
- Weak or missing `JWT_SECRET`.
- No active courses exist before the demo.
- Student already enrolled in the demo course for the current academic year.
- Admin account has role `student` instead of `admin`.
- Student profile index migration not applied if production still has the old
  non-sparse `studentId` index.

## 10. Quick Smoke Test Steps

Run this short smoke test before every demo:

1. Open backend health URL and confirm `status: "ok"`.
2. Open frontend URL.
3. Log in as admin.
4. Open Courses and Enrollment Management.
5. Log out.
6. Log in as student.
7. Open Profile and submit once.
8. Open Courses and enroll in one course.
9. Open My Courses and confirm the course appears.
10. Log back in as admin and approve or reject the enrollment.

If any step fails, stop and check browser console, network requests, Render logs,
and MongoDB Atlas connection status before starting the live demo.
