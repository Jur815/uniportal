# UniPortal Demo Smoke Test

Use this flow after Render and Vercel redeploy successfully.

## Preflight

- Backend health route returns `status: ok` at `/api/v1/health`.
- Vercel frontend loads without console errors.
- Browser network tab shows API calls going to the Render `/api/v1` URL.
- Demo seed has been run and passwords were captured from terminal output.

## Admin Flow

1. Login as `admin@uniportal.demo`.
2. Open `/dashboard`.
3. Confirm KPI cards show students, courses, faculties, departments, and enrollments.
4. Open `/admin/demo-readiness`.
5. Confirm completed modules, sample accounts, and demo steps are visible.
6. Open `/admin/faculties` and `/admin/departments`.
7. Confirm sample academic structure appears.
8. Open `/admin/academic-sessions`.
9. Confirm `2026/2027` Semester `1` is active and enrollment is open.
10. Open `/admin/courses`.
11. Confirm sample courses are listed.
12. Open `/admin/students`.
13. Select a student and confirm academic identity fields display.

## Registrar Flow

1. Login as `registrar@uniportal.demo`.
2. Open `/registrar/dashboard`.
3. Confirm enrollment KPI cards and active session display.
4. Open `/admin/enrollments`.
5. Confirm pending and approved enrollment records are visible.
6. Open a pending enrollment detail.
7. Return it for correction or approve it if you want to demonstrate the decision workflow.
8. Confirm the registrar audit log records reviewer, date, previous status, new status, and reason.
9. Open `/admin/academic-records`.
10. Generate a record from an approved enrollment if one has not already been generated.
11. Update demo grades and confirm GPA recalculates.

## Student Flow

1. Login as `john.student@uniportal.demo`.
2. Open `/my-enrollments`.
3. Confirm approved enrollment is visible.
4. Open the approved enrollment slip.
5. Confirm student details, academic year, semester, approved courses, total credits, approval status, reviewer, and decision date.
6. Use the print button and verify the print layout is clean.
7. Open `/my-academic-records`.
8. Confirm grades, credit hours, GPA, and remarks display.
9. Login as `amina.student@uniportal.demo`.
10. Confirm pending enrollment status is clear and no printable approved slip is shown.

## Production Failure Points To Watch

- CORS error: confirm backend `CLIENT_URL` exactly matches Vercel origin.
- Network error from frontend: confirm `VITE_API_URL` includes `/api/v1`.
- 502 on Render: check server logs for missing env vars or MongoDB Atlas access.
- Login fails: confirm demo seed ran against the same database used by Render.
- Empty dashboards: confirm seed completed and the frontend is pointed to the correct backend.

## Demo Pass Criteria

The live demo is ready when:

- Admin, registrar, and student logins work.
- Academic setup data is visible.
- Enrollment review and audit log are functional.
- Approved student enrollment slip prints cleanly.
- Academic records page shows at least one generated record.
- No browser console CORS or API URL errors appear during the flow.
