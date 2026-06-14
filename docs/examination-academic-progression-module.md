# Examination & Academic Progression Module

## Scope

The module extends approved enrollment-generated `AcademicRecord` documents. It
does not replace enrollment, exam clearance, timetable, or existing academic
record routes.

## Result Workflow

1. Lecturer, Admin, or Registrar enters marks while the record is `draft` or
   `returned`.
2. Grades, grade points, GPA, earned credits, failed courses, and recommended
   academic standing are calculated from the active grading policy.
3. Lecturer submits marks.
4. Dean/HOD reviews or returns the result.
5. Registrar finalizes the academic standing.
6. Registrar releases the result to the student.

Students can only access records with `workflowStatus: "released"`.

## Academic Standing

Supported values:

- Pass
- Supplementary
- Carry Over
- Repeat
- Discontinued
- Suspended

The calculated standing uses configurable failed-course, GPA, and earned-credit
thresholds. Admin or Registrar may apply a documented standing override during
finalization.

## Grading Policy

The active policy stores:

- Mark ranges
- Letter grades
- Grade points
- Pass/fail outcome
- Failed-course thresholds
- GPA thresholds
- Minimum earned credits
- Repeat and discontinue conditions

Each result stores a policy snapshot so later policy changes do not rewrite the
historical calculation basis.

## API

Base route: `/api/v1/examinations`

- `GET /records`
- `PATCH /records/:id/marks`
- `POST /records/:id/workflow`
- `GET /my-results`
- `GET /reports`
- `GET /policy`
- `PUT /policy` (Admin only)

## Audit and Reporting

Every marks edit and workflow transition records the actor, role, timestamp,
previous value, new value, course where applicable, and optional note.

Released-result reports include pass, supplementary, carry-over,
repeat/discontinued, and department performance summaries.
