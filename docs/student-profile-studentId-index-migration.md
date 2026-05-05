# StudentProfile `studentId` Index Migration

## Context

`StudentProfile.studentId` was changed from a required unique field to an
optional sparse unique field:

```js
studentId: { type: String, unique: true, sparse: true, trim: true }
```

This lets first-time student profile creation work before a `studentId` has
been assigned, while still preventing duplicate real student IDs.

Existing MongoDB deployments may still have a non-sparse unique index on
`studentId`. The model change alone does not always update an existing index.

## Current Model Indexes

Mongoose creates these indexes for `StudentProfile`:

- `user_1`: unique, from `user: { unique: true }`
- `studentId_1`: unique and sparse, from `studentId: { unique: true, sparse: true }`

The collection name created by this model is normally `studentprofiles`.

## Safety Rules

- Do not delete any documents for this migration.
- Take an Atlas backup or snapshot before changing indexes.
- Run the checks below before dropping or recreating any index.
- Prefer a short maintenance window or temporarily pause writes to
  `studentprofiles` while replacing the index.
- Dropping an index does not delete data, but it briefly removes uniqueness
  enforcement until the sparse unique index is recreated.

## Check Existing Indexes

In MongoDB Atlas, open the database shell for the target database and run:

```js
db.studentprofiles.getIndexes()
```

Look for the `studentId_1` index. A correct sparse unique index should include:

```js
{
  key: { studentId: 1 },
  name: "studentId_1",
  unique: true,
  sparse: true
}
```

If `unique: true` exists but `sparse: true` is missing, the deployment still has
the old non-sparse unique index.

## Check Existing Data Before Migration

Check for duplicate non-empty `studentId` values:

```js
db.studentprofiles.aggregate([
  {
    $match: {
      studentId: { $exists: true, $nin: [null, ""] }
    }
  },
  {
    $group: {
      _id: "$studentId",
      count: { $sum: 1 },
      ids: { $push: "$_id" }
    }
  },
  {
    $match: {
      count: { $gt: 1 }
    }
  }
])
```

This should return no rows. If it returns duplicates, stop and resolve those
records manually before changing the index.

Check how many profiles are missing `studentId`:

```js
db.studentprofiles.countDocuments({
  $or: [
    { studentId: { $exists: false } },
    { studentId: null }
  ]
})
```

Missing or `null` `studentId` values are expected and safe with a sparse index.

Check for empty string values:

```js
db.studentprofiles.countDocuments({ studentId: "" })
```

Empty strings are still indexed by a sparse index. If more than one document has
`studentId: ""`, the unique sparse index cannot be created until those values
are unset or corrected.

## Migration Commands

Only run these after taking a backup and completing the checks above.

```js
db.studentprofiles.dropIndex("studentId_1")

db.studentprofiles.createIndex(
  { studentId: 1 },
  {
    unique: true,
    sparse: true,
    name: "studentId_1"
  }
)
```

These commands replace the index only. They do not delete existing documents.

## Verify After Migration

Run:

```js
db.studentprofiles.getIndexes()
```

Confirm `studentId_1` has both:

```js
unique: true
sparse: true
```

Then test safely with the app:

1. Log in as a student who does not yet have a `StudentProfile`.
2. Save the profile without a `studentId`.
3. Confirm the save succeeds.
4. Assign a real `studentId` to one profile.
5. Confirm attempting to reuse that same `studentId` fails with a duplicate key
   error.

## MongoDB Atlas UI Verification

1. Open MongoDB Atlas.
2. Go to the target cluster.
3. Open `Browse Collections`.
4. Select the UniPortal database.
5. Select the `studentprofiles` collection.
6. Open the `Indexes` tab.
7. Find `studentId_1`.
8. Confirm it is unique and sparse.

If Atlas shows `studentId_1` as unique but not sparse, use the migration
commands above during a safe maintenance window.
