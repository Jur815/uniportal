# UniPortal System Flow & User Manual

**Institutional Demo Quick Reference**

UniPortal is an institutional student portal and academic management platform
supporting registration, enrollment, student services, academic records,
examinations, progression decisions, reporting, and controlled role-based
access. The current demonstration presents a practical institutional workflow
that can be configured and expanded through consultation.

## User Roles

| Role | Primary responsibilities |
| --- | --- |
| **Admin** | Configures academic structure, courses, sessions, users, policies, dashboards, and system-wide oversight. |
| **Registrar** | Reviews enrollment, manages academic records, verifies results, approves progression decisions, and releases results. |
| **Student** | Maintains permitted profile details, requests enrollment, follows registration status, uses student services, and views released results. |
| **Lecturer** | Enters course marks, reviews calculated outcomes, and submits complete semester results for academic review. |
| **Dean/HOD** | Reviews submitted results for academic completeness and forwards reviewed results to the Registrar. |
| **Finance (Pilot Concept)** | Demonstrates future institutional fee, financial clearance, and payment workflow possibilities. Current implementation is intentionally limited for institutional consultation and phased rollout discussions. |

## System Flow

```text
Academic Setup
      ↓
Student Registration
      ↓
Enrollment Request
      ↓
Registrar Review & Approval
      ↓
Academic Record Creation
      ↓
Lecturer Mark Submission
      ↓
Dean/HOD Review
      ↓
Registrar Final Approval & Release
      ↓
Student Result Access
      ↓
Institutional Reports
```

1. **Academic setup:** Admin creates faculties, departments, programs, courses, sessions, and policy settings.
2. **Student registration:** Students confirm their identity and academic profiles.
3. **Enrollment request:** Students select eligible courses and submit requests.
4. **Registrar review:** Registrar verifies details, course selection, and credit load before approval or correction.
5. **Academic record creation:** Approved enrollment establishes the semester academic record.
6. **Lecturer mark submission:** Lecturer enters marks; UniPortal calculates grades, points, credits, and GPA.
7. **Dean/HOD review:** Academic leadership checks submitted results for completeness.
8. **Final approval and release:** Registrar verifies standing and approval history, then releases the result.
9. **Student result access:** Students view and print only formally released results.
10. **Institutional reports:** Authorized staff generate progression and department performance summaries.

## Key Institutional Benefits

- Reduces manual paperwork and result-processing burden.
- Improves examination accuracy and consistency.
- Tracks supplementary and carry-over requirements automatically.
- Improves accountability through controlled approval workflows.
- Enhances transparency and student self-service.
- Supports institutional reporting and academic decision-making.
- Adapts to institutional academic policies and governance requirements.

## Current Demo Scope

### Current Demonstration Scope

- Registration and enrollment
- Academic structure
- Student management
- Academic records
- Examination and academic progression
- Supplementary and carry-over tracking
- Timetable
- Complaints / Helpdesk
- Exam clearance
- Institutional reports

### Planned Expansion

- Finance integration
- Payment workflows
- Lecturer assignment controls
- Advanced analytics and dashboards
- SMS / Email notifications
- Additional institutional workflows

## Module Summary

| Module | What it does |
| --- | --- |
| **Dashboard** | Presents role-specific indicators, pending work, institutional totals, and direct access to key tasks. |
| **Academic Setup** | Manages faculties, departments, programs, academic sessions, and institutional structure. |
| **Student Management** | Maintains student identity, program placement, registration details, verification, and account status. |
| **Course Management** | Maintains course codes, titles, credits, level, semester, program links, and active status. |
| **Enrollment Management** | Supports course requests, Registrar decisions, correction reasons, status tracking, and printable slips. |
| **Academic Records** | Stores semester courses, grades, credits, GPA, remarks, and the student academic history foundation. |
| **Examination & Progression** | Controls marks entry, calculations, academic standing, approvals, release, and student result access. |
| **Progression Reports** | Produces supplementary, carry-over, pass, repeat/discontinued, and department summary lists. |
| **Timetable** | Displays and manages course schedules, venues, lecturers, semesters, and academic programs. |
| **Complaints / Helpdesk** | Records student requests, responses, handling status, and resolution progress. |
| **Exam Clearance** | Tracks attendance, financial clearance, eligibility decisions, review notes, and approval status. |
| **Finance (Pilot Concept)** | Demonstrates future institutional fee, financial clearance, and payment workflow possibilities. Current implementation is intentionally limited for institutional consultation and phased rollout discussions. |
| **Audit Trail & Security** | Enforces role permissions and records enrollment decisions, result changes, approvals, and releases. |

## Examination & Academic Progression

- **GPA and CGPA:** UniPortal calculates semester GPA and cumulative academic
  performance from course credit hours and grade points.
- **Grading policy:** Grade bands, pass marks, and grade points are
  institution-configurable and stored with each calculated result.
- **Promotion policy:** GPA, earned-credit, failed-course, repeat, and
  discontinuation thresholds can be aligned with official regulations.
- **Progression detection:** Failed courses are identified automatically and
  classified for supplementary or carry-over tracking where policy requires.
- **Academic standing:** Results may show Pass, Supplementary, Carry Over,
  Repeat, Discontinued, or Suspended.
- **Approval workflow:** Lecturer Submitted → Dean/HOD Reviewed → Registrar
  Approved → Released.
- **Release control:** Students see released results only; lecturers and
  Dean/HOD reviewers cannot release final results.
- **Printable output:** Released results include institutional and student
  details, courses, marks, grades, GPA, CGPA, standing, and approval status.

## Demo Credentials

All demo accounts use the password:

**`UniPortal123`**

Role-specific account emails are available in the demo login documentation.

## Closing Note

UniPortal is configurable per institution. Academic structures, grading
policies, promotion rules, approval workflows, hosting, security controls, and
reports can be adapted to the university's official regulations and
institutional governance requirements.

---

**Confidential Institutional Demonstration Material | UniPortal by Sky High Tech**
