# UniPortal Clean Demo Database Report

**Completed:** June 14, 2026  
**Database:** `uniportal` on the confirmed UniPortal Atlas demo cluster  
**Purpose:** University leadership presentation preparation

## Backup

The database was exported before any destructive operation.

- **Backup name:** `uniportal-demo-backup-2026-06-14T12-22-21Z`
- **Created:** June 14, 2026 at 12:22:30 UTC / 2:22:30 PM CAT
- **Location:** `outputs/backups/uniportal-demo-backup-2026-06-14T12-22-21Z`
- **Format:** MongoDB Extended JSON v2 (canonical)
- **Contents:** 219 documents across 13 collections
- **Manifest checksum (SHA-256):** `7995f401022e5cb74c5f423d32a21610e675c73ef72c3e46874c361f6db4cc5a`

The export and reset commands are restricted to the `uniportal` database. No
other database or cluster was modified.

## Cleanup Performed

The confirmed demo database was cleared collection by collection and rebuilt
from the curated institutional seed. The reset removed:

| Collection | Removed |
| --- | ---: |
| Users | 36 |
| Student profiles | 31 |
| Faculties | 3 |
| Departments | 11 |
| Programs | 10 |
| Courses | 43 |
| Academic sessions | 3 |
| Enrollments | 44 |
| Academic records | 34 |
| Grading policies | 1 |
| Complaints | 2 |
| Exam clearances | 1 |
| Timetable entries | 0 |

This removed the malformed department `Stephen Hakim Joseph`, course
`commnity studies amd rural development`, student `Ngor Agook Kuol`, and all
other records outside the curated seed.

## Preserved Demo Scope

The clean seed recreates:

- Admin, Registrar, Lecturer, Dean/HOD, Finance, and Student demo accounts
- Three faculties, ten departments, ten programs, and 42 professional courses
- Three academic sessions with 2026/2027 Semester 1 active
- Thirty student profiles and 44 enrollment examples
- Thirty-two academic records
- Six Computer Science timetable entries
- Two student-service cases
- Three exam-clearance examples: Eligible, Pending, and Not Eligible
- A configurable institutional demo grading and promotion policy

### Examination Cohort

| Student | Standing | Release State |
| --- | --- | --- |
| Bol Mading | Pass | Released |
| Nyabuay Gatluak | Supplementary | Released |
| James Loku | Carry Over | Released |
| Adut Akech | Repeat | Released |
| Morris Wani | Discontinued | Released |
| Rebecca Deng | Pass | Dean/HOD Reviewed, intentionally unreleased |

## Final Database Counts

| Record Type | Count |
| --- | ---: |
| Total users | 35 |
| Students | 30 |
| Faculties | 3 |
| Departments | 10 |
| Programs | 10 |
| Courses | 42 |
| Enrollments | 44 |
| Academic records | 32 |
| Released examination results | 5 |
| Unreleased examination results | 1 |
| Timetable entries | 6 |
| Student-service cases | 2 |
| Exam-clearance records | 3 |

Progression counts are Pass 2, Supplementary 1, Carry Over 1, Repeat 1, and
Discontinued 1.

## Validation

- Backend tests: passed, 6/6
- Frontend lint: passed
- Production build: passed, 156 modules transformed
- Backup manifest and collection export: verified
- Seed integrity checks: passed
- Accidental named-record checks: passed
- Browser smoke test: passed
- Released result visibility: passed
- Unreleased result privacy: passed
- Timetable, complaints, and exam-clearance samples: passed

Browser evidence is available at
`outputs/uniportal-clean-demo-smoke.png`.

## Seed Commands

Create a backup:

```bash
cd server
npm run backup:demo
```

Reset the confirmed remote demo database:

```bash
CONFIRM_DEMO_DATABASE_RESET='RESET:uniportal-cluster.kfv0ozc.mongodb.net/uniportal' npm run seed:demo
```

The reset refuses databases other than `uniportal` and requires an exact
cluster/database confirmation token for remote targets.

## Known Limitations

- The examination workspace also contains clean draft academic records created
  from approved enrollments; presenters should select the curated 2025/2026
  Computer Science cohort.
- The result sheet displays the configured default institution name until
  `VITE_INSTITUTION_NAME` is set for the receiving university.
- Demo accounts use the stable shared password documented in
  `demo-login-fix-report.md`; environment variables can override it when needed.
- The Extended JSON backup is complete and type-preserving, but MongoDB
  Database Tools are not installed in this workspace.

## Readiness Confirmation

The UniPortal demo database is clean, internally consistent, and ready for a
guided university leadership presentation.
