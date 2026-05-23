# UniPortal Executive Presentation

## Slide 1: Title

**UniPortal**  
**Institutional Student Information and Enrollment Management System**

Prepared for university and college decision-makers.

Positioning:

UniPortal is a focused institutional MVP for academic setup, student management, course registration, registrar approval, enrollment slips, and academic record foundations.

## Slide 2: The Problem

Many universities still manage registration with disconnected tools, paper forms, spreadsheets, manual approvals, and unclear student communication.

Common challenges:

- Student records are fragmented.
- Course registration lacks clear approval tracking.
- Registrars spend time resolving duplicate or incomplete requests.
- Students do not always know their registration status.
- Leadership has limited real-time visibility.
- Audit trails are weak or missing.

## Slide 3: UniPortal Solution

UniPortal brings the core academic registration workflow into one web-based system.

It supports:

- Academic structure setup.
- Student account and profile management.
- Course management.
- Academic session control.
- Student enrollment requests.
- Registrar approval workflow.
- Decision audit logs.
- Printable enrollment slips.
- Academic record foundations.

## Slide 4: Current MVP Scope

The current system is designed to demonstrate the complete registration lifecycle.

Core workflow:

1. Admin sets up faculties, departments, programs, and courses.
2. Admin creates or manages student profiles.
3. Admin opens an academic session for registration.
4. Student browses courses and submits enrollment requests.
5. Registrar reviews and approves, rejects, or returns requests.
6. Student views status and prints approved enrollment slip.
7. Approved enrollments can become academic records.

## Slide 5: Role-Based Experience

UniPortal separates access by institutional role.

**Admin**

- Academic setup.
- Student management.
- Course management.
- Sessions and dashboards.

**Registrar**

- Enrollment review.
- Approval decisions.
- Audit log review.
- Academic records operations.

**Student**

- Profile update.
- Course browsing.
- Enrollment request.
- Enrollment slip and academic record viewing.

## Slide 6: Admin Dashboard

The admin dashboard gives leadership and administrative staff a quick institutional snapshot.

Shows:

- Total students.
- Total courses.
- Faculties, departments, and programs.
- Pending, approved, rejected, and returned enrollments.
- Active academic session.
- Enrollment open/closed status.
- Recent activity.

Institutional value:

Administrators can quickly understand registration activity without waiting for manual reports.

## Slide 7: Academic Setup and Course Management

UniPortal supports the academic structure universities expect.

Structure:

**Faculty -> Department -> Program -> Course**

Admins can:

- Create faculties and departments.
- Manage programs.
- Create and edit courses.
- Filter courses by faculty, department, program, level, and semester.
- Activate or deactivate courses.
- View course detail and enrollment counts.

Institutional value:

This creates a clean foundation for registration, reporting, and future academic planning.

## Slide 8: Student Management

Admins can manage student identity and academic placement.

Student data includes:

- Name and email.
- Student ID or registration number.
- Faculty.
- Department.
- Program.
- Level/year.
- Intake year.
- Guardian/contact information.
- Account status.
- Academic verification status.

Institutional value:

The university controls official academic identity while still allowing student self-service where appropriate.

## Slide 9: Registrar Enrollment Review

The registrar workflow turns enrollment into an official approval process.

Registrar can:

- View pending enrollment requests.
- Review student profile and academic identity.
- Review selected courses and credit total.
- Approve enrollment.
- Reject enrollment.
- Return enrollment for correction.
- Add structured reasons.

Institutional value:

Registration becomes controlled, traceable, and aligned with real university procedures.

## Slide 10: Decision Audit Log

Every enrollment decision is recorded.

Audit log captures:

- Who made the decision.
- When the decision was made.
- Previous status.
- New status.
- Reason type.
- Decision note.

Institutional value:

This supports accountability, transparency, and dispute resolution.

## Slide 11: Student Self-Service

Students have a clear registration experience.

Students can:

- Login securely.
- Update allowed profile fields.
- Browse available courses.
- Submit enrollment requests.
- Track pending, approved, rejected, or correction-required status.
- View action-needed messages.
- Print approved enrollment slips.
- View academic records.

Institutional value:

Students get clarity, and offices receive fewer status-check visits.

## Slide 12: Printable Enrollment Slip

Approved enrollments generate a branded registration slip.

Slip includes:

- Student identity.
- Academic year and semester.
- Faculty, department, program, and level.
- Approved courses.
- Credit hours.
- Total credits.
- Approval status.
- Decision date and reviewer.

Institutional value:

The slip provides official proof of course registration for students, departments, and administrative offices.

## Slide 13: Security and Deployment Readiness

Current technical foundation:

- JWT authentication.
- Role-based access control.
- Password hashing.
- Protected API routes.
- CORS configuration.
- Helmet security headers.
- Auth rate limiting.
- JSON body size limit.
- Render backend deployment support.
- Vercel frontend deployment support.
- MongoDB Atlas database support.
- Health check endpoint.

Institutional value:

The system is designed to run as a real deployed web application, not only as a local prototype.

## Slide 14: What This MVP Proves

UniPortal currently proves:

- The institution can model its academic structure.
- Students can be managed with academic identity.
- Courses can be organized by faculty, department, and program.
- Registration can be controlled by academic session.
- Students can submit enrollment requests.
- Registrars can review and approve requests.
- Decisions can be audited.
- Approved students can print enrollment slips.
- Academic records can begin from approved enrollments.

Honest positioning:

This is a strong institutional registration MVP, not yet a complete production SIS.

## Slide 15: Roadmap and Next Step

Recommended next modules after presentation:

**Immediate pilot priorities**

- Reports and exports.
- Course rosters.
- Admissions/intake management.
- Password reset.
- Broader audit logging.
- CSV import for students and courses.

**Pilot expansion**

- Lecturer portal.
- Grade submission workflow.
- Transcript generation.
- Timetable and scheduling.
- Notifications and announcements.
- Document uploads.

Recommended next step:

Run a guided pilot discovery with the institution to map real registration policies, reporting needs, user roles, and required data imports.

## Closing Message

UniPortal is ready to demonstrate a serious, practical registration workflow for universities and colleges.

It gives decision-makers a clear view of how the institution can move from academic setup to student registration, registrar approval, enrollment slip generation, and academic records.
