const DEFAULT_POLICY = {
  name: "Demo Policy - configurable per institution",
  gradeBands: [
    { minMark: 80, maxMark: 100, grade: "A", gradePoint: 4, isPass: true },
    { minMark: 70, maxMark: 79.99, grade: "B", gradePoint: 3, isPass: true },
    { minMark: 60, maxMark: 69.99, grade: "C", gradePoint: 2, isPass: true },
    { minMark: 50, maxMark: 59.99, grade: "D", gradePoint: 1, isPass: true },
    { minMark: 0, maxMark: 49.99, grade: "F", gradePoint: 0, isPass: false },
  ],
  promotionRules: {
    failedCourseThreshold: 1,
    carryOverThreshold: 2,
    repeatFailedCourseThreshold: 4,
    discontinueFailedCourseThreshold: 6,
    minimumGpa: 2,
    repeatGpaThreshold: 1.5,
    discontinueGpaThreshold: 1,
    minimumEarnedCredits: 12,
  },
};

const round = (value) => Math.round(Number(value || 0) * 100) / 100;

const getPolicySnapshot = (policy) => {
  if (!policy) return DEFAULT_POLICY;
  const plain = typeof policy.toObject === "function" ? policy.toObject() : policy;
  return {
    name: plain.name,
    gradeBands: plain.gradeBands,
    promotionRules: plain.promotionRules,
  };
};

const calculateCourseResult = (course, policy) => {
  if (course.marks === undefined || course.marks === null || course.marks === "") {
    return {
      ...course,
      marks: undefined,
      grade: "",
      gradePoint: undefined,
      status: "in-progress",
      isSupplementary: false,
      isCarryOver: false,
    };
  }

  const marks = Number(course.marks);
  const band = policy.gradeBands.find(
    (item) => marks >= Number(item.minMark) && marks <= Number(item.maxMark),
  );

  if (!band) {
    throw new Error(`No grading band is configured for mark ${marks}`);
  }

  return {
    ...course,
    marks,
    grade: band.grade,
    gradePoint: Number(band.gradePoint),
    status: band.isPass ? "passed" : "failed",
    isSupplementary: !band.isPass,
    isCarryOver: false,
  };
};

const calculateGpa = (courses) => {
  const graded = courses.filter((course) => typeof course.gradePoint === "number");
  const credits = graded.reduce(
    (sum, course) => sum + Number(course.creditHours || 0),
    0,
  );
  if (!credits) return 0;
  return round(
    graded.reduce(
      (sum, course) =>
        sum + Number(course.creditHours || 0) * Number(course.gradePoint || 0),
      0,
    ) / credits,
  );
};

const determineStanding = ({ failedCount, gpa, earnedCredits, rules }) => {
  if (
    failedCount >= Number(rules.discontinueFailedCourseThreshold) ||
    gpa < Number(rules.discontinueGpaThreshold)
  ) {
    return "Discontinued";
  }
  if (
    failedCount >= Number(rules.repeatFailedCourseThreshold) ||
    gpa < Number(rules.repeatGpaThreshold) ||
    earnedCredits < Number(rules.minimumEarnedCredits)
  ) {
    return "Repeat";
  }
  if (failedCount >= Number(rules.carryOverThreshold)) return "Carry Over";
  if (failedCount >= Number(rules.failedCourseThreshold)) return "Supplementary";
  return "Pass";
};

const calculateSemesterResult = (courses, policyInput) => {
  const policy = getPolicySnapshot(policyInput);
  const calculatedCourses = courses.map((course) =>
    calculateCourseResult(
      typeof course.toObject === "function" ? course.toObject() : course,
      policy,
    ),
  );
  const GPA = calculateGpa(calculatedCourses);
  const failedCourses = calculatedCourses.filter(
    (course) => course.status === "failed",
  );
  const earnedCredits = calculatedCourses
    .filter((course) => course.status === "passed")
    .reduce((sum, course) => sum + Number(course.creditHours || 0), 0);
  const academicStanding = determineStanding({
    failedCount: failedCourses.length,
    gpa: GPA,
    earnedCredits,
    rules: policy.promotionRules,
  });

  const withProgressionFlags = calculatedCourses.map((course) => ({
    ...course,
    isCarryOver:
      course.status === "failed" &&
      ["Carry Over", "Repeat", "Discontinued"].includes(academicStanding),
  }));

  return {
    courses: withProgressionFlags,
    GPA,
    earnedCredits,
    failedCourseCount: failedCourses.length,
    academicStanding,
    gradingPolicySnapshot: policy,
  };
};

const calculateCgpa = (records) => {
  const courses = records.flatMap((record) =>
    (record.courses || []).filter(
      (course) => typeof course.gradePoint === "number",
    ),
  );
  return calculateGpa(courses);
};

const verifyResultMetrics = (record, recordsForCgpa = [record]) => {
  const policy =
    record.gradingPolicySnapshot &&
    Array.isArray(record.gradingPolicySnapshot.gradeBands)
      ? record.gradingPolicySnapshot
      : DEFAULT_POLICY;
  const calculated = calculateSemesterResult(record.courses || [], policy);
  const supplementaryCourseCount = (record.courses || []).filter(
    (course) => course.isSupplementary,
  ).length;
  const carryOverCourseCount = (record.courses || []).filter(
    (course) => course.isCarryOver,
  ).length;
  const expectedCarryOverCount = calculated.courses.filter(
    (course) => course.isCarryOver,
  ).length;
  const expectedCgpa = calculateCgpa(recordsForCgpa);
  const checks = {
    completeMarks: (record.courses || []).every(
      (course) =>
        typeof course.marks === "number" &&
        typeof course.gradePoint === "number" &&
        Boolean(course.grade),
    ),
    GPA: round(record.GPA) === round(calculated.GPA),
    CGPA: round(record.CGPA) === round(expectedCgpa),
    earnedCredits:
      Number(record.earnedCredits || 0) === calculated.earnedCredits,
    failedCourses:
      Number(record.failedCourseCount || 0) === calculated.failedCourseCount,
    supplementaryCourses:
      supplementaryCourseCount === calculated.failedCourseCount,
    carryOverCourses: carryOverCourseCount === expectedCarryOverCount,
  };

  return {
    checks,
    isValid: Object.values(checks).every(Boolean),
    expected: {
      GPA: calculated.GPA,
      CGPA: expectedCgpa,
      earnedCredits: calculated.earnedCredits,
      failedCourseCount: calculated.failedCourseCount,
      supplementaryCourseCount: calculated.failedCourseCount,
      carryOverCourseCount: expectedCarryOverCount,
    },
  };
};

const validateResultForRelease = (record, recordsForCgpa = [record]) => {
  const verification = verifyResultMetrics(record, recordsForCgpa);
  const approvals = {
    lecturerSubmitted: Boolean(record.submittedBy),
    deanHodReviewed: Boolean(record.reviewedBy),
    registrarApproved: Boolean(record.finalizedBy),
    gradingPolicyCaptured: Boolean(
      record.gradingPolicySnapshot?.gradeBands?.length,
    ),
    registrarFinalizedStatus: record.workflowStatus === "registrar_finalized",
  };

  return {
    isValid:
      verification.isValid && Object.values(approvals).every(Boolean),
    approvals,
    verification,
  };
};

module.exports = {
  DEFAULT_POLICY,
  calculateCgpa,
  calculateSemesterResult,
  getPolicySnapshot,
  validateResultForRelease,
  verifyResultMetrics,
};
