# UniPortal Institutional Demo Presentation

## 1. Title Slide Content

**UniPortal**  
**Institutional Student Information and Enrollment Management System**

Prepared for university and college demonstration.

Suggested subtitle:

**A focused academic registration MVP for student management, course registration, registrar approval, enrollment slips, and academic record foundations.**

Opening message:

UniPortal helps institutions organize academic structure, manage students, control course registration windows, review enrollment requests, and give students a clear registration experience.

## 2. System Overview

UniPortal is a web-based institutional MVP built around the core registration workflow of a university.

The system currently supports:

- Admin dashboard and institutional KPIs.
- Faculty, department, program, and course setup.
- Student account and academic profile management.
- Academic session and registration window control.
- Student course browsing and enrollment request submission.
- Registrar enrollment review and approval workflow.
- Decision audit logs.
- Student enrollment status tracking.
- Printable approved enrollment slips.
- Academic records foundation with courses, grades, credits, GPA, and remarks.

What the user sees:

- A branded UniPortal login screen.
- Role-specific dashboards for admin, registrar, and student users.
- Clear navigation for academic setup, students, courses, enrollments, and records.

What the user does:

- Logs in according to role.
- Opens the correct dashboard.
- Performs academic, registration, or student-facing tasks.

What happens in the backend:

- The API authenticates users using JWT.
- Role-based middleware protects admin, registrar, and student routes.
- MongoDB stores users, profiles, academic structure, courses, sessions, enrollments, audit logs, and academic records.

Why it matters:

Universities need a reliable operational flow from academic setup to course registration approval. UniPortal demonstrates that flow clearly.

## 3. Admin Dashboard Walkthrough

The admin dashboard is the institutional command center.

What the admin sees:

- Total students.
- Total courses.
- Total faculties.
- Total departments.
- Enrollment totals by status.
- Active academic session.
- Enrollment open/closed status.
- Recent enrollments, students, and courses.

What the admin does:

- Reviews the current institutional snapshot.
- Checks whether registration is open.
- Opens student management, academic setup, course management, or demo readiness.

What happens in the backend:

- The dashboard endpoint aggregates counts from users, faculties, departments, programs, courses, enrollments, and academic sessions.
- Recent activity is loaded from the latest enrollment, student, and course records.

Why it matters:

Leadership and administrative staff need fast visibility into the state of registration and academic operations.

## 4. Student Management

Student Management allows admins to view and manage student academic identity.

What the admin sees:

- A searchable student list.
- Filters for faculty, department, program, and status.
- Student details including name, email, student ID, registration number, faculty, department, program, level, intake year, guardian contacts, account status, and academic verification.
- A Create Student option.

What the admin does:

- Searches for a student.
- Filters students by academic structure.
- Views student profile details.
- Activates or suspends student accounts.
- Verifies or unlocks academic fields.
- Creates a new student account and profile when needed.

What happens in the backend:

- Student records are loaded from the User model and StudentProfile model.
- Account status updates modify the student user account.
- Academic verification updates the student profile.
- Admin-created students receive a User account and linked StudentProfile.

Why it matters:

Universities need centralized student identity management. This prevents incomplete registration data and supports controlled academic verification.

## 5. Course Management

Course Management gives admins a professional list of courses.

What the admin sees:

- Searchable and filterable course list.
- Course code, title, credit hours, semester, level, faculty, department, program, and active status.
- Edit, deactivate, reactivate, and detail options.

What the admin does:

- Searches for a course by code or title.
- Filters courses by faculty, department, program, level, semester, or status.
- Creates new courses.
- Edits existing courses.
- Deactivates courses that should no longer receive enrollment requests.

What happens in the backend:

- Course APIs validate course fields.
- Course records store references to faculty, department, and program where available.
- Inactive courses are excluded from student-facing registration.

Why it matters:

Course setup is one of the most visible academic administration tasks. Clean course management makes the system feel credible to registrars and deans.

## 6. Course Detail and Enrollment Counts

The course detail page makes course management feel institutional.

What the admin sees:

- Full course information.
- Enrollment count per course.
- Enrollment status breakdown.
- Recent enrollments linked to that course.

What the admin does:

- Opens a course from course management.
- Reviews how many students requested or received approval for that course.
- Checks recent activity.

What happens in the backend:

- The course detail endpoint loads the course and aggregates enrollment records containing that course.
- Recent enrollments are populated with student names and status details.

Why it matters:

Universities often ask, “How many students registered for this course?” This page answers that question during the demo.

## 7. Registrar Enrollment Review

The registrar review module is the core registration workflow.

What the registrar sees:

- Enrollment queue.
- Filters by pending, approved, rejected, correction required, or all.
- Student information.
- Academic profile.
- Selected courses.
- Credit totals.
- Course active/inactive status.
- Decision controls.

What the registrar does:

- Opens pending enrollment requests.
- Reviews student eligibility and course selection.
- Approves the enrollment.
- Rejects the enrollment.
- Returns the enrollment for correction.
- Adds structured decision reasons.

What happens in the backend:

- Enrollment records are loaded with student, profile, and course data.
- The status update endpoint validates allowed decisions.
- Approval checks course existence, active course status, and credit limits.
- The enrollment status changes to approved, rejected, or correction_required.

Why it matters:

Registrar approval is a realistic institutional control point. It shows that registration is not simply student self-service; it includes official review.

## 8. Audit Log

The decision audit log records registrar actions.

What the user sees:

- Previous status.
- New status.
- Reviewer name and role.
- Decision date and time.
- Reason type.
- Decision reason.

What the registrar does:

- Makes a decision on an enrollment.
- Reviews past decisions on the enrollment detail page.

What happens in the backend:

- Every decision appends an audit entry to the enrollment record.
- The audit log stores who made the decision, when it happened, previous status, new status, and reason.

Why it matters:

Universities need accountability. Audit logs reduce disputes and support administrative transparency.

## 9. Student Dashboard

The student dashboard gives students a simple starting point.

What the student sees:

- Browse Courses.
- My Courses.
- Profile.
- Enrollment Slips.
- Academic Records.

What the student does:

- Opens the courses page to begin registration.
- Checks current enrollment requests.
- Updates allowed profile fields.
- Opens academic records.

What happens in the backend:

- Student routes use the authenticated user ID.
- Students only access their own profile, enrollments, slips, and records.

Why it matters:

Students need a clear self-service portal. A simple dashboard reduces confusion during registration.

## 10. Profile Update

The profile page allows students to update allowed personal information.

What the student sees:

- Personal and contact fields.
- Academic identity fields where available.
- Protected academic fields if verified by admin.

What the student does:

- Updates allowed profile fields.
- Saves profile changes.

What happens in the backend:

- The profile API validates and updates permitted fields.
- Admin-controlled academic identity fields are protected when verification rules apply.

Why it matters:

Students should maintain their own contact details, while official academic identity remains controlled by the institution.

## 11. Course Browsing

The course browsing page is the student registration entry point.

What the student sees:

- Available courses for the active academic session.
- Course code, title, credit hours, semester, level, department, and program.
- Request Enrollment button when registration is open.
- Status badge when the course is already requested or enrolled.
- Clear message when registration is closed.

What the student does:

- Reviews available courses.
- Requests enrollment in a course.
- Avoids duplicate requests because the button is replaced by status.

What happens in the backend:

- The frontend loads the active academic session.
- The course API returns active courses.
- Existing student enrollments are loaded to show status badges.

Why it matters:

Students need to understand which courses are available and whether registration is open. Clear status messaging prevents repeated submissions.

## 12. Enrollment Submission

Enrollment submission creates a pending request.

What the student sees:

- Request Enrollment button.
- Success message after submission.
- Pending status badge after submission.

What the student does:

- Clicks Request Enrollment.

What happens in the backend:

- The enrollment API checks the active academic session.
- It confirms registration is open.
- It validates academic year, semester, course IDs, active course status, duplicate requests, and credit limits.
- It creates or updates an enrollment record with pending status.

Why it matters:

This models a real registration request instead of automatic final enrollment. That is more credible for university operations.

## 13. My Enrollments

My Enrollments shows students the status of their registration requests.

What the student sees:

- Academic year.
- Semester.
- Enrollment status.
- Course count.
- Total credits.
- Action needed for rejected or correction-required enrollments.
- Link to slip or status detail.

What the student does:

- Reviews whether enrollment is pending, approved, rejected, or correction required.
- Opens the approved slip when available.

What happens in the backend:

- The API returns only enrollments belonging to the logged-in student.
- Courses and decision information are included.

Why it matters:

Students should not need to visit an office to know whether registration has been approved.

## 14. Academic Records

Academic Records provide a foundation for transcript and results workflows.

What the user sees:

- Academic year and semester.
- Courses.
- Credit hours.
- Grades.
- Grade points.
- GPA.
- Remarks.

What the admin or registrar does:

- Generates academic records from approved enrollments.
- Updates demo-level grades and remarks.

What the student does:

- Views their academic records.

What happens in the backend:

- Academic records are generated from approved enrollment course data.
- Grade updates recalculate GPA.
- Student access is scoped to the logged-in student.

Why it matters:

Universities need a path from approved registration to academic results and transcript records. This feature shows that foundation.

## 15. Printable Enrollment Slip

The enrollment slip is the student’s official registration proof.

What the student sees:

- UniPortal branded slip.
- Student name and email.
- Student ID or registration number.
- Faculty, department, program, and level.
- Academic year and semester.
- Approved courses.
- Total credits.
- Approval status.
- Decision date.
- Reviewer if available.
- Print button.

What the student does:

- Opens an approved enrollment.
- Clicks Print Slip.

What happens in the backend:

- The enrollment detail endpoint returns the student’s approved enrollment and audit decision data.
- The frontend shows the printable layout only for approved enrollments.

Why it matters:

Universities often require proof of course registration. A printable slip is a strong demo moment.

## 16. Security and Role-Based Access

UniPortal uses role-based access to separate responsibilities.

What users see:

- Admin users see admin pages.
- Registrar users see enrollment review and academic operations pages.
- Student users see student self-service pages.
- Unauthorized users are blocked.

What users do:

- Login with role-specific accounts.
- Access only the workflows assigned to their role.

What happens in the backend:

- JWT tokens identify authenticated users.
- Middleware protects API routes.
- Role checks restrict admin, registrar, and student actions.
- Passwords are hashed.
- Helmet, rate limiting, CORS rules, and JSON body limits improve production safety.

Why it matters:

Universities need clear separation of duties. Students should not access registrar controls, and registrars should not manage unrelated system configuration.

## 17. Production Deployment Overview

UniPortal is prepared for cloud deployment with a Render backend and Vercel frontend.

What administrators see:

- A deployed frontend URL.
- A backend health route.
- Live API calls to the deployed backend.

What the technical team does:

- Deploys the backend to Render.
- Deploys the frontend to Vercel.
- Configures MongoDB Atlas.
- Sets environment variables.
- Runs demo seed data against the correct database.

What happens in the backend:

- The server loads required environment variables.
- MongoDB Atlas stores application data.
- CORS allows the deployed frontend origin.
- `/api/v1/health` confirms API availability.

Why it matters:

Deployment readiness helps ICT directors trust that the system can run outside a local developer machine.

## 18. Demo Login Flow

Demo credentials are generated by the seed script and displayed in the backend terminal.

Recommended login sequence:

1. Login as admin.
2. Show the admin dashboard and setup modules.
3. Logout.
4. Login as student.
5. Show course browsing, enrollment status, slip, and academic records.
6. Logout.
7. Login as registrar.
8. Show enrollment review, decision actions, and audit log.

Why this order works:

- Admin establishes institutional control.
- Student shows the user experience.
- Registrar proves the approval workflow.

## 19. Suggested Live Presentation Script

Opening:

“Today we are presenting UniPortal, an institutional student information and enrollment management MVP. The focus is not to claim that every SIS module is complete today, but to demonstrate the core academic registration workflow that universities need: academic setup, student management, course registration, registrar approval, enrollment slips, and academic record foundations.”

Admin dashboard:

“We begin with the admin dashboard. This gives the institution a high-level view of students, courses, faculties, departments, enrollments, and the active academic session.”

Academic setup:

“Before a university can register students into courses, it must define its academic structure. UniPortal supports faculties, departments, programs, and courses.”

Student management:

“The admin can manage student accounts and academic identity, including student ID, registration number, faculty, department, program, level, and status.”

Course management:

“Course management allows administrators to create, edit, activate, deactivate, search, and filter courses by academic structure.”

Registrar workflow:

“Students submit enrollment requests, but the enrollment is not final until reviewed. The registrar can approve, reject, or return a request for correction.”

Audit log:

“Every registrar decision is logged with who made the decision, when, the previous status, the new status, and the reason.”

Student view:

“From the student side, the student can browse courses, request enrollment, track approval status, print an approved enrollment slip, and view academic records.”

Closing:

“UniPortal is ready to demonstrate a serious institutional registration workflow. The next phase would expand into reports, admissions, lecturer grade entry, timetables, attendance, fees, and full transcript processing.”

## 20. Future Modules Roadmap

Must-have after presentation:

- Reports and exports for enrollment lists, course rosters, students by department, and registration summaries.
- Admissions and intake management.
- Password reset and account recovery.
- Broader audit logging for admin changes.
- CSV import for students, courses, and academic structure.

Important for pilot:

- Lecturer portal.
- Grade submission workflow.
- Transcript generation.
- Timetable and scheduling.
- Student document uploads.
- Notifications and announcements.
- Fee/payment integration planning.

Can wait:

- Mobile app.
- Attendance.
- Advanced analytics.
- Multi-campus configuration.
- LMS integrations.
- Parent/guardian portal.

Recommended positioning:

UniPortal should be presented as a practical, focused academic registration MVP that is strong enough for institutional discussion and pilot planning, while being honest about the modules still required for a full production SIS.
