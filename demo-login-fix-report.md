# UniPortal Demo Login Fix Report

**Completed:** June 14, 2026  
**Database:** Confirmed Atlas `uniportal` demo database

## Working Demo Credentials

All seeded `@uniportal.demo` accounts now use:

**Password:** `UniPortal123`

| Demo Role | Email / Username | Browser Login |
| --- | --- | --- |
| Admin | `admin@uniportal.demo` | Passed |
| Registrar | `registrar@uniportal.demo` | Passed |
| Student | `john.student@uniportal.demo` | Passed |
| Lecturer | `lecturer@uniportal.demo` | Passed |
| Dean/HOD | `dean@uniportal.demo` | Passed |
| Finance | `finance@uniportal.demo` | Passed |

The same password was applied to all 30 seeded student accounts, including the
six Computer Science examination cohort accounts.

## Issue Found

The seed script used randomly generated fallback passwords whenever
`DEMO_*_PASSWORD` environment variables were absent. Therefore, every database
reset created new credentials. Password hashing itself was functioning
correctly, but previously known demo passwords no longer matched the new
hashes.

## Authentication Verification

- The `User` model hashes modified passwords with bcrypt before saving.
- Stored credentials were verified as bcrypt hashes.
- Each stored hash was compared successfully with `UniPortal123`.
- The login controller retrieves the protected password field and uses
  `bcrypt.compare` through `correctPassword`.
- All 35 seeded demo accounts were reset and verified.
- API login returned HTTP `200` and the correct role for all six presentation
  roles.
- Browser login and role-specific dashboard routing passed for all six roles.

## Permanent Seed Fix

The institutional demo seed now uses `UniPortal123` as its stable fallback
password. `DEMO_SHARED_PASSWORD` or the existing role-specific
`DEMO_*_PASSWORD` variables can override it when required.

A safe credential repair command was also added:

```bash
cd server
CONFIRM_DEMO_PASSWORD_RESET='RESET-PASSWORDS:uniportal-cluster.kfv0ozc.mongodb.net/uniportal' \
DEMO_SHARED_PASSWORD='UniPortal123' \
npm run reset:demo-passwords
```

The command is restricted to the `uniportal` database and only updates users
whose email ends with `@uniportal.demo`.

## Demo Confirmation

Leadership presentation logins are working for Admin, Registrar, Student,
Lecturer, Dean/HOD, and Finance.
