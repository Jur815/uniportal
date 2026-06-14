# UniPortal Demo Readiness Review Report

**Review date:** June 13, 2026  
**Review scope:** Current local institutional demo and configured demo database

## Executive Summary

UniPortal is **Mostly Ready** for a guided institutional demonstration.

The core administration, enrollment, academic record, student self-service, and examination workflows are functioning. All demo roles can authenticate, role navigation is clear, the examination dataset covers the required academic standings, and released-result controls are enforced in both the interface and backend.

Two demo-blocking defects were found and corrected during this review:

1. Authenticated page reloads were incorrectly consuming the login rate limit, which could lock out later demo roles.
2. An examination result that had not been released could be exposed through the older Academic Records student endpoint.

No remaining software defect currently prevents a controlled demo. The main risks are database cleanliness, sparse sample data in some secondary modules, and role scoping that is suitable for an MVP demonstration but not yet sufficient for production deployment.

## Verification Summary

| Check | Result |
| --- | --- |
| Backend tests | Passed: 6/6 |
| Frontend lint | Passed |
| Production build | Passed |
| Browser verification | Passed on desktop |
| Demo role logins | Admin, Registrar, Student, Lecturer, Dean/HOD, and Finance verified |
| Frontend protected routes | Verified |
| Backend examination RBAC | Verified |
| Released-result visibility | Verified |
| Unreleased-result privacy | Verified after correction |
| Printable enrollment slip | Verified |
| Printable examination result sheet | Verified |
| Mobile responsiveness | CSS breakpoint reviewed; full device emulation not available |

## What Is Working Well

### Core Demo Flow

- Admin dashboard loads institutional KPIs, active session, enrollment status, recent activity, and direct module links.
- Registrar dashboard clearly presents pending work, decision totals, active session details, and recent enrollment requests.
- Student dashboard is simple and understandable, with direct access to registration, enrollments, academic records, results, services, and profile.
- Lecturer and Dean/HOD dashboards honestly distinguish demonstrable examination functions from planned scope.
- Finance dashboard is clearly labeled as a read-only pilot concept and does not imply live financial processing.
- Academic setup contains faculties, departments, programs, and linked course structures.
- Student management provides search, filters, academic identity, status controls, and detailed profiles.
- Enrollment review includes course context, credit totals, decisions, correction reasons, and audit history.
- Academic records, student complaints, timetable, and exam-clearance pages load correctly and use professional empty states where data is absent.

### Examination & Academic Progression

- Course marks are converted into grades and grade points using a configurable policy snapshot.
- GPA, CGPA, earned credits, failed courses, supplementary courses, and carry-over courses are verified before release.
- The released Computer Science cohort includes:

| Student | Standing | Failed Courses | Workflow |
| --- | --- | ---: | --- |
| Bol Mading | Pass | 0 | Released |
| Nyabuay Gatluak | Supplementary | 1 | Released |
| James Loku | Carry Over | 2 | Released |
| Adut Akech | Repeat | 4 | Released |
| Morris Wani | Discontinued | 6 | Released |
| Rebecca Deng | Pass | 0 | Dean/HOD Reviewed, intentionally unreleased |

- All five released examples pass the result-verification checks.
- Released examples contain ten audit entries each, covering course marks and workflow decisions.
- The policy is explicitly labeled **“Demo Policy — configurable per institution.”**
- Registrar policy access is read-only; Administrator access is editable.
- The workflow is clearly presented as Lecturer Submitted, Dean/HOD Reviewed, Registrar Approved, and Released.
- Supplementary, carry-over, repeat/discontinued, and department performance reports contain presentation-ready data.
- The result sheet includes institutional identity, student context, courses, GPA, CGPA, standing, approval status, Registrar approval, release date, and the institutional-review footer.

### RBAC and Security

- Students are redirected away from staff examination routes.
- Student API access to staff examination records returns `403`.
- Lecturer release attempts return `403`; lecturer report access also returns `403`.
- Dean/HOD release and mark-entry attempts return `403`.
- Registrar policy updates return `403`, while Registrar report access returns `200`.
- Registrar and Administrator release requests reach workflow validation and are blocked when the selected result is not in the correct state.
- Only released examination records are returned by the student results endpoint.
- Examination-controlled records are now excluded from the older student Academic Records endpoint until release.

## Issues Found

### High Priority Before Presentation

1. **The current database contains visible non-demo records.**

   The reviewed database contains 31 students, 43 courses, and 11 departments instead of the clean seed targets of 30, 42, and 10. Visible examples include:

   - Department: `Stephen Hakim Joseph`, code `001`
   - Course: `commnity studies amd rural development`, code `001`
   - Student: `Ngor Agook Kuol`

   The malformed course appears on the Admin dashboard, Course Management, and Timetable course selector. This is the largest remaining presentation-quality risk.

2. **Examination access is institution-wide within each staff role.**

   Lecturers can currently see and edit any eligible draft academic result, and Dean/HOD users can see institution-wide results. There is no course-assignment or department ownership constraint yet. This is acceptable only when described as an MVP role workflow and is not production-ready authorization.

3. **Course registration does not enforce student level or program eligibility.**

   A level-one Computer Science student can see and request higher-level Computer Science courses. The backend validates session, semester, active status, duplicates, and credit limits, but not prerequisites, program membership, or year-of-study eligibility.

### Medium Priority

1. The examination workspace includes many legacy draft Academic Records before the six curated examination examples. The initial selection is usually an incomplete draft, so the presenter must deliberately choose a released 2025/2026 Computer Science record.
2. The seed does not preserve a `lecturer_submitted` or `registrar_finalized` sample. A complete live workflow requires submitting a draft during the presentation or explaining the four-stage indicator using existing released records.
3. Academic Records and Examinations use the same underlying records but expose different administrative editing experiences. Present the older Academic Records page as the foundation and the Examination page as the controlled marks and progression workflow.
4. Grading bands validate individual values but do not yet reject overlapping bands or gaps between bands.
5. Complaints and timetable have no current demo records. Exam clearance has one pending record. Their empty states are clean, but the modules have limited presentation value without prepared examples.
6. The in-app Demo Readiness page and older demo scripts do not yet mention the completed Examination & Academic Progression module.

### Minor Polish Items

- Set `VITE_INSTITUTION_NAME` to the receiving university before presentation; the result sheet currently displays “Demonstration University.”
- The Finance dashboard’s closing “Controlled Expansion Path” text refers to the examination workflow and could be more finance-specific.
- Long course, academic-record, and examination lists are dense. Use direct navigation and prepared record names during the presentation.
- Local browser verification must use `http://localhost:5173`. A fallback Vite port or `127.0.0.1` origin is not currently in the backend CORS allowlist.
- Full mobile device emulation was unavailable. Responsive CSS exists at the 760px breakpoint, but a real phone/tablet smoke test is still recommended.

## Critical Demo Blockers

**Open blockers: None.**

### Blockers Fixed During Review

1. The authentication limiter was narrowed to login and registration requests. Twenty-five consecutive authenticated `/auth/me` requests completed without a non-200 response.
2. Student Academic Records now hide examination-controlled records until the Registrar releases them. Rebecca Deng’s reviewed result is hidden from both student result surfaces.

## Recommended Fixes Before Leadership Presentation

1. Clean the demo database or deploy a fresh database containing only the institutional seed.
2. Confirm the receiving institution name in the frontend environment.
3. Preselect and rehearse the six Computer Science examination records by student name.
4. Decide whether to demonstrate a live Lecturer-to-Dean/HOD transition or explain the workflow using the released audit trail.
5. Keep Finance positioned as a consultation concept, not an implemented finance system.
6. Avoid presenting timetable and complaints as data-rich modules unless sample records are prepared.
7. State clearly that lecturer assignment, departmental scoping, prerequisites, and program eligibility are deployment requirements, not completed production controls.
8. Run the same smoke test against the exact deployed frontend, backend, and database on the presentation day.

## Suggested Demo Flow

1. **Admin login:** Show dashboard KPIs, active session, and honest MVP positioning.
2. **Academic setup:** Show faculties, departments, programs, and clean Computer Science course structure.
3. **Student management:** Open Bol Mading or John Garang and show academic identity.
4. **Student registration:** Show John Garang’s approved enrollment and printable slip.
5. **Registrar login:** Show pending queue, decision controls, reasons, and audit history.
6. **Examination overview:** Open Bol Mading’s released Pass record and explain verification metrics and policy configuration.
7. **Progression reports:** Show Supplementary, Carry Over, Repeat, Discontinued, and department summary examples.
8. **RBAC sequence:** Show Lecturer submission scope, Dean/HOD review scope, and Registrar release responsibility.
9. **Student result:** Login as Bol Mading and show the released printable result sheet.
10. **Privacy proof:** Briefly explain that Rebecca Deng’s reviewed result is intentionally hidden until release.
11. **Future scope:** Show Finance only as a controlled consultation roadmap.

## Final Readiness Rating

# Mostly Ready

UniPortal is suitable for a guided university leadership demonstration after the current database is cleaned. The examination module is credible and well positioned as an institutional prototype. The remaining limitations should be stated openly as pilot configuration and production-hardening requirements.
