const test = require("node:test");
const assert = require("node:assert/strict");

const {
  calculateCgpa,
  calculateSemesterResult,
  validateResultForRelease,
  verifyResultMetrics,
} = require("./resultCalculationService");

const policy = {
  name: "Test policy",
  gradeBands: [
    { minMark: 70, maxMark: 100, grade: "A", gradePoint: 4, isPass: true },
    { minMark: 60, maxMark: 69.99, grade: "B", gradePoint: 3, isPass: true },
    { minMark: 50, maxMark: 59.99, grade: "C", gradePoint: 2, isPass: true },
    { minMark: 0, maxMark: 49.99, grade: "F", gradePoint: 0, isPass: false },
  ],
  promotionRules: {
    failedCourseThreshold: 1,
    carryOverThreshold: 2,
    repeatFailedCourseThreshold: 4,
    discontinueFailedCourseThreshold: 5,
    minimumGpa: 2,
    repeatGpaThreshold: 1,
    discontinueGpaThreshold: 0.5,
    minimumEarnedCredits: 3,
  },
};

test("calculates grades, GPA, credits, and supplementary standing", () => {
  const result = calculateSemesterResult(
    [
      { course: "a", creditHours: 3, marks: 75 },
      { course: "b", creditHours: 3, marks: 45 },
    ],
    policy,
  );

  assert.equal(result.courses[0].grade, "A");
  assert.equal(result.courses[1].status, "failed");
  assert.equal(result.courses[1].isSupplementary, true);
  assert.equal(result.GPA, 2);
  assert.equal(result.earnedCredits, 3);
  assert.equal(result.academicStanding, "Supplementary");
});

test("marks multiple failed courses as carry-over", () => {
  const result = calculateSemesterResult(
    [
      { course: "a", creditHours: 3, marks: 45 },
      { course: "b", creditHours: 3, marks: 40 },
      { course: "c", creditHours: 3, marks: 65 },
    ],
    policy,
  );

  assert.equal(result.academicStanding, "Carry Over");
  assert.equal(
    result.courses.filter((course) => course.isCarryOver).length,
    2,
  );
});

test("calculates CGPA across finalized semester records", () => {
  const cgpa = calculateCgpa([
    { courses: [{ creditHours: 3, gradePoint: 4 }] },
    { courses: [{ creditHours: 3, gradePoint: 2 }] },
  ]);
  assert.equal(cgpa, 3);
});

test("verifies GPA, CGPA, credits, failures, supplementary, and carry-over", () => {
  const calculated = calculateSemesterResult(
    [
      { course: "a", creditHours: 3, marks: 45 },
      { course: "b", creditHours: 3, marks: 40 },
      { course: "c", creditHours: 3, marks: 65 },
    ],
    policy,
  );
  const record = {
    ...calculated,
    CGPA: calculated.GPA,
    gradingPolicySnapshot: policy,
  };
  const verification = verifyResultMetrics(record, [record]);

  assert.equal(verification.isValid, true);
  assert.deepEqual(verification.checks, {
    completeMarks: true,
    GPA: true,
    CGPA: true,
    earnedCredits: true,
    failedCourses: true,
    supplementaryCourses: true,
    carryOverCourses: true,
  });
});

test("blocks release when course marks or approvals are incomplete", () => {
  const calculated = calculateSemesterResult(
    [
      { course: "a", creditHours: 3, marks: 75 },
      { course: "b", creditHours: 3 },
    ],
    policy,
  );
  const record = {
    ...calculated,
    CGPA: calculated.GPA,
    gradingPolicySnapshot: policy,
    workflowStatus: "registrar_finalized",
    submittedBy: "lecturer",
    finalizedBy: "registrar",
  };
  const validation = validateResultForRelease(record, [record]);

  assert.equal(validation.isValid, false);
  assert.equal(validation.verification.checks.completeMarks, false);
  assert.equal(validation.approvals.deanHodReviewed, false);
});

test("permits release only after complete calculation and approval checks", () => {
  const calculated = calculateSemesterResult(
    [
      { course: "a", creditHours: 3, marks: 75 },
      { course: "b", creditHours: 3, marks: 65 },
    ],
    policy,
  );
  const record = {
    ...calculated,
    CGPA: calculated.GPA,
    gradingPolicySnapshot: policy,
    workflowStatus: "registrar_finalized",
    submittedBy: "lecturer",
    reviewedBy: "dean",
    finalizedBy: "registrar",
  };

  assert.equal(validateResultForRelease(record, [record]).isValid, true);
});
