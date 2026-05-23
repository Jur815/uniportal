# UniPortal Live Demo Script

## Purpose

This script helps present UniPortal to university administrators, registrars, ICT leaders, deans, and student affairs teams.

The goal is to show a clear institutional workflow:

Admin setup -> student registration request -> registrar review -> student enrollment slip -> academic record foundation.

## Before the Demo

Confirm:

- Backend health check is working.
- Vercel frontend loads.
- Demo data has been seeded.
- Admin login works.
- Registrar login works.
- Student login works.
- Active academic session is open.
- At least one pending enrollment exists.
- At least one approved enrollment exists.
- At least one approved enrollment slip is printable.

Suggested browser preparation:

- Open one clean browser window.
- Keep demo credentials nearby but not visible to the audience.
- Keep the backend health URL ready.
- Keep screenshots ready as backup.

## Opening Statement

Say:

“Good morning/afternoon. Today we are presenting UniPortal, an institutional student information and enrollment management MVP. This demonstration focuses on the academic registration lifecycle: academic setup, student management, course registration, registrar approval, enrollment slip printing, and academic record foundations.”

Say:

“This is not being positioned as a complete replacement for every SIS module today. It is a focused institutional MVP designed to show the core workflow and support pilot discussion.”

## Step 1: Show Login Page

Action:

- Open the UniPortal frontend.
- Show the branded login screen.

Say:

“UniPortal starts with secure role-based login. Different users see different workflows depending on whether they are an admin, registrar, or student.”

Value:

“This role separation is important because student registration systems must protect administrative and registrar functions.”

## Step 2: Login as Admin

Action:

- Login using the demo admin account.
- Open `/dashboard`.

Say:

“We will begin as an administrator. The admin dashboard gives a quick institutional snapshot.”

Point out:

- Total students.
- Total courses.
- Faculties and departments.
- Enrollment status counts.
- Active academic session.
- Enrollment open/closed status.

Say:

“From this dashboard, leadership can immediately see whether registration is active and how enrollment activity is progressing.”

## Step 3: Show Demo Readiness Page

Action:

- Open `/admin/demo-readiness`.

Say:

“This demo readiness page is included to help institutions understand which modules are currently available in this MVP.”

Point out:

- Completed modules.
- Sample accounts.
- Institutional seed coverage.
- Recommended demo flow.

Value:

“This helps keep the presentation transparent and organized.”

## Step 4: Show Academic Setup

Action:

- Open Academic Setup, Faculties, and Departments.

Say:

“Before creating courses or registering students, the institution must define its academic structure. UniPortal follows a structure familiar to universities: faculties, departments, programs, and courses.”

Point out:

- Faculty names and codes.
- Departments linked to faculties.
- Programs linked to departments.

Value:

“This structure makes course management and student registration more realistic than a flat list of courses.”

## Step 5: Show Course Management

Action:

- Open `/admin/courses`.

Say:

“Course Management allows administrators to search, filter, edit, activate, and deactivate courses.”

Point out:

- Search field.
- Faculty, department, and program filters.
- Course status.
- Edit/deactivate actions.

Value:

“This is useful for academic offices because courses change by semester, department, and program.”

## Step 6: Show Course Detail and Enrollment Counts

Action:

- Open a course detail page.

Say:

“The course detail view shows not only course information, but also enrollment counts and recent enrollment activity.”

Point out:

- Course code.
- Title.
- Credits.
- Faculty/department/program.
- Enrollment count.
- Recent enrollments.

Value:

“Administrators often need to know how many students registered for a course. This gives that visibility.”

## Step 7: Show Student Management

Action:

- Open `/admin/students`.

Say:

“Student Management allows administrators to search and filter students by academic identity.”

Point out:

- Student search.
- Faculty/department/program filters.
- Status filter.
- Student ID and registration number.
- Academic verification status.

Action:

- Select one student.

Say:

“Here we can see the student’s academic identity, contact details, guardian information, and account status.”

Value:

“This prevents registration from relying only on incomplete self-entered data.”

## Step 8: Show Create Student

Action:

- Open `/admin/students/new`.

Say:

“Admins can also create real student accounts and profiles directly from the system.”

Point out:

- Personal details.
- Academic identity.
- Faculty, department, program dropdowns.
- Guardian/contact information.
- Auto-generated temporary password option.

Value:

“This supports institutions that want controlled account creation instead of only public self-registration.”

Do not create a new student during the live demo unless needed.

## Step 9: Logout and Login as Student

Action:

- Logout.
- Login as a demo student.

Say:

“Now we switch to the student experience.”

## Step 10: Show Student Dashboard

Action:

- Open `/dashboard`.

Say:

“The student dashboard is intentionally simple. It gives students quick access to courses, profile, enrollments, slips, and academic records.”

Point out:

- Browse Courses.
- My Courses.
- Enrollment Slips.
- Academic Records.
- Profile.

Value:

“Students should not need training to understand where to go.”

## Step 11: Show Profile Page

Action:

- Open `/profile`.

Say:

“Students can update allowed profile fields, while official academic identity can remain controlled by the institution.”

Value:

“This balances student self-service with registrar control.”

## Step 12: Show Course Browsing

Action:

- Open `/courses`.

Say:

“The courses page shows available courses for the active academic session. If registration is open, students can submit enrollment requests.”

Point out:

- Course cards.
- Credit hours.
- Semester.
- Department/program.
- Request Enrollment button or status badge.
- Registration closed message if applicable.

Value:

“This makes registration clear and reduces duplicate or invalid requests.”

## Step 13: Submit or Explain Enrollment Request

Action:

- If safe, click Request Enrollment on an available course.
- If not, explain using an existing pending status.

Say:

“When the student requests enrollment, the system creates a pending registration request. It is not final until reviewed by the registrar.”

Backend explanation:

“The backend checks the active session, open registration window, course validity, duplicate requests, and credit limit.”

Value:

“This models real university registration control.”

## Step 14: Show My Enrollments

Action:

- Open `/my-enrollments`.

Say:

“Students can track their registration requests here.”

Point out:

- Academic year.
- Semester.
- Status.
- Courses.
- Credits.
- Action needed.
- Slip/status link.

Value:

“Students can see whether they are pending, approved, rejected, or need correction.”

## Step 15: Show Approved Enrollment Slip

Action:

- Open an approved enrollment.
- Show the printable slip.

Say:

“For approved enrollments, UniPortal generates an official enrollment slip.”

Point out:

- UniPortal branding.
- Student identity.
- Academic year and semester.
- Approved courses.
- Total credits.
- Approval status.
- Decision date.
- Reviewer.
- Print button.

Value:

“This can serve as proof of course registration for students and departments.”

## Step 16: Show Academic Records

Action:

- Open `/my-academic-records`.

Say:

“UniPortal also includes an academic records foundation. This is not yet a full transcript system, but it shows how approved enrollments can become academic records.”

Point out:

- Courses.
- Credits.
- Grades.
- Grade points.
- GPA.
- Remarks.

Value:

“This gives the institution a path toward results and transcript workflows.”

## Step 17: Logout and Login as Registrar

Action:

- Logout.
- Login as registrar.
- Open `/registrar/dashboard`.

Say:

“Now we switch to the registrar role, where enrollment requests are reviewed.”

## Step 18: Show Registrar Dashboard

Action:

- Show registrar dashboard.

Point out:

- Pending enrollments.
- Approved enrollments.
- Rejected enrollments.
- Returned enrollments.
- Decisions today.
- Active session.
- Latest pending enrollments.

Say:

“The registrar dashboard is focused on registration operations.”

## Step 19: Show Enrollment Review Queue

Action:

- Open `/admin/enrollments`.

Say:

“This is the enrollment review queue. Registrars can filter by status and open detailed reviews.”

Point out:

- Student information.
- Academic profile.
- Enrollment context.
- Selected courses.
- Credit total.
- Decision actions.

Value:

“This gives registrars the information needed to make informed registration decisions.”

## Step 20: Open Enrollment Detail

Action:

- Open one pending enrollment detail.

Say:

“The detail page brings together the student profile, academic profile, selected courses, credit totals, and decision panel.”

Point out:

- Student summary.
- Academic summary.
- Selected courses.
- Credit total.
- Status timeline.
- Approval actions.

## Step 21: Make a Registrar Decision

Action:

- Approve, reject, or return for correction.

Suggested safe choice:

- Return for correction if you do not want to change an approved demo record.
- Approve if you want to demonstrate the full slip flow after switching back to student.

Say:

“The registrar can approve, reject, or return the request for correction with a structured reason.”

Backend explanation:

“The backend validates the status, updates the enrollment, and records the decision in the audit log.”

## Step 22: Show Audit Log

Action:

- Scroll to Decision Audit Log.

Say:

“Every registrar decision is recorded here.”

Point out:

- Reviewer.
- Previous status.
- New status.
- Date and time.
- Reason type.
- Reason.

Value:

“This supports accountability and reduces registration disputes.”

## Step 23: Explain Security and Deployment

Say:

“UniPortal uses role-based access control, JWT authentication, hashed passwords, protected API routes, CORS configuration, request body limits, rate limiting for authentication, and a Render/Vercel deployment model.”

Say:

“For this demo, we are using controlled demo data. For a pilot, we would configure the institution’s real academic structure, students, and registration policies.”

## Step 24: Future Roadmap

Say:

“The next practical modules after this presentation would be reports and exports, admissions, lecturer grade entry, timetable scheduling, transcript generation, attendance, notifications, and fees.”

Say:

“The reason we are not showing all of those today is that the current MVP is focused on proving the core academic registration workflow first.”

## Closing Statement

Say:

“UniPortal is ready to demonstrate how a university can move from academic setup to student registration, registrar approval, enrollment slip generation, and academic records. The system is intentionally focused, and the next step would be a pilot discussion around the institution’s real workflows, reporting needs, and deployment requirements.”

## Questions to Invite

Ask:

- “How does your current registration approval workflow work?”
- “Who controls student academic identity at your institution?”
- “Do departments need course rosters exported?”
- “What reports does the registrar need every semester?”
- “Would approval be handled only by registrar, or also by departments?”
- “What data would need to be imported for a pilot?”

## Demo Recovery Lines

If Render is slow:

“The backend is waking from a cloud free-tier sleep. This is a hosting behavior, not an application workflow issue.”

If a login fails:

“Let me confirm that the demo seed was run against this database and use the generated credential from the seed output.”

If registration is closed:

“This is controlled by the academic session module. Admins can open or close enrollment windows by academic year and semester.”

If a student already requested a course:

“The system prevents duplicate requests and replaces the button with a status badge.”

If asked whether it is production-ready:

“The current system is demo and pilot-ready for the registration workflow. A full production SIS would require additional modules such as reports, admissions, fees, timetables, lecturer workflows, attendance, and broader audit/compliance controls.”
