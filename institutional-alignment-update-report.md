# UniPortal Institutional Alignment Update Report

**Date:** 14 June 2026  
**Scope:** Examination & Academic Progression demo refinement

## Summary

UniPortal now presents a closer institutional alignment with the reviewed
University of Juba manual results format while preserving the existing
examination architecture, approval workflow, RBAC controls, and honest
prototype positioning.

## Changes Implemented

- Expanded the configurable demonstration grading scale to include A, B+, B,
  C+, C, D, and F.
- Added optional policy-controlled result codes for AbsF, BarF, Incom, CR, Sus,
  Substitute, and Cheating Case.
- Added configurable progression effects for each special code. Codes only
  affect standing when their active policy configuration specifies an effect.
- Added policy-driven Dean's List recognition using GPA, earned-credit, and
  no-failure conditions.
- Added institutional result remarks including `DL`, `Supp 1F`,
  `Supp 2F + C.O`, `Repeat + C.O`, `Discont. + C.O`, `Incom`, and `Pass`.
- Updated result entry, verification, audit records, and the printable student
  result sheet to display special codes and institutional remarks.
- Preserved release validation: incomplete results cannot be released.
- Updated the Computer Science demonstration cohort with B+, C+, AbsF,
  supplementary, carry-over, incomplete, and Dean's List examples.

## Configurable Institutional Items

The grade boundaries, grade points, pass indicators, special-code activation,
special-code progression effects, promotion thresholds, and Dean's List
thresholds remain configurable per institution. The demonstration policy is
explicitly labelled as configurable and is not presented as an approved
University of Juba regulation.

## Intentionally Postponed

- Exact University of Juba policy replication pending formal policy review.
- Full landscape cohort master-results sheet.
- Deficit-point and Dean's List ranking reports.
- Institution-specific examination-board signatures, stamps, and approval
  templates.
- More detailed case-management workflows for barred, cheating, substitute,
  and ceased-registration decisions.

## Demo Data and Backup

Before reseeding, the confirmed `uniportal` demo database was exported as:

`uniportal-demo-backup-2026-06-14T19-00-41Z`

The final seed contains 35 users, 30 students, 42 courses, 44 enrollments,
32 academic records, five released examination results, and one intentionally
unreleased result.

## Validation

- Backend tests: **10 passed**
- Frontend lint: **passed**
- Production build: **passed**
- Browser verification: **passed**
- Released Dean's List result: visible to Bol Mading
- AbsF supplementary result: calculated and displayed correctly
- Incomplete result: verification warning shown and release blocked
- Unreleased result: hidden from Rebecca Deng's student portal

## Readiness

UniPortal remains demo-ready. These changes improve institutional credibility
without claiming exact University of Juba compliance or expanding beyond the
current pilot examination scope.
