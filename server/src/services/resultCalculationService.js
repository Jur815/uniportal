const DEFAULT_POLICY = {
  name: "Demo Policy - configurable per institution",
  gradeBands: [
    { minMark: 80, maxMark: 100, grade: "A", gradePoint: 4, isPass: true },
    { minMark: 75, maxMark: 79.99, grade: "B+", gradePoint: 3.5, isPass: true },
    { minMark: 70, maxMark: 74.99, grade: "B", gradePoint: 3, isPass: true },
    { minMark: 65, maxMark: 69.99, grade: "C+", gradePoint: 2.5, isPass: true },
    { minMark: 60, maxMark: 64.99, grade: "C", gradePoint: 2, isPass: true },
    { minMark: 50, maxMark: 59.99, grade: "D", gradePoint: 1, isPass: true },
    { minMark: 0, maxMark: 49.99, grade: "F", gradePoint: 0, isPass: false },
  ],
  specialResultCodes: [
    { code: "AbsF", label: "Absent", progressionEffect: "failed", gradePoint: 0, isActive: true },
    { code: "BarF", label: "Barred", progressionEffect: "failed", gradePoint: 0, isActive: true },
    { code: "Incom", label: "Incomplete", progressionEffect: "incomplete", isActive: true },
    { code: "CR", label: "Conditional Repeat", progressionEffect: "carry_over", gradePoint: 0, isActive: true },
    { code: "Sus", label: "Suspension", progressionEffect: "suspended", isActive: true },
    { code: "Substitute", label: "Substitute Result", progressionEffect: "none", isActive: true },
    { code: "Cheating Case", label: "Cheating Case", progressionEffect: "failed", gradePoint: 0, isActive: true },
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
    deansListEnabled: true,
    deansListGpaThreshold: 3.5,
    deansListMinimumEarnedCredits: 18,
  },
};

const round = (value) => Math.round(Number(value || 0) * 100) / 100;

const normalizePolicy = (policy) => {
  const plain =
    policy && typeof policy.toObject === "function" ? policy.toObject() : policy;
  return {
    name: plain?.name || DEFAULT_POLICY.name,
    gradeBands:
      Array.isArray(plain?.gradeBands) && plain.gradeBands.length
        ? plain.gradeBands
        : DEFAULT_POLICY.gradeBands,
    specialResultCodes: Array.isArray(plain?.specialResultCodes)
      ? plain.specialResultCodes
      : DEFAULT_POLICY.specialResultCodes,
    promotionRules: {
      ...DEFAULT_POLICY.promotionRules,
      ...(plain?.promotionRules || {}),
    },
  };
};

const getPolicySnapshot = (policy) => {
  return normalizePolicy(policy);
};

const calculateCourseResult = (course, policy) => {
  const resultCode = String(course.resultCode || "").trim();
  if (resultCode) {
    const configuredCode = (policy.specialResultCodes || []).find(
      (item) => item.isActive !== false && item.code === resultCode,
    );
    if (!configuredCode) {
      throw new Error(`Result code ${resultCode} is not active in the grading policy`);
    }
    const failed = ["failed", "carry_over"].includes(
      configuredCode.progressionEffect,
    );
    return {
      ...course,
      marks: undefined,
      grade: resultCode,
      gradePoint:
        typeof configuredCode.gradePoint === "number"
          ? Number(configuredCode.gradePoint)
          : undefined,
      resultCode,
      status: failed ? "failed" : "incomplete",
      isSupplementary: failed,
      isCarryOver: configuredCode.progressionEffect === "carry_over",
      specialResultEffect: configuredCode.progressionEffect,
    };
  }

  if (course.marks === undefined || course.marks === null || course.marks === "") {
    return {
      ...course,
      marks: undefined,
      grade: "",
      gradePoint: undefined,
      status: "in-progress",
      isSupplementary: false,
      isCarryOver: false,
      resultCode: undefined,
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
    resultCode: undefined,
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

const determineStanding = ({
  failedCount,
  gpa,
  earnedCredits,
  rules,
  specialEffects = [],
}) => {
  if (specialEffects.includes("suspended")) return "Suspended";
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
  if (specialEffects.includes("carry_over")) return "Carry Over";
  if (failedCount >= Number(rules.carryOverThreshold)) return "Carry Over";
  if (failedCount >= Number(rules.failedCourseThreshold)) return "Supplementary";
  return "Pass";
};

const formatInstitutionalRemark = ({
  academicStanding,
  failedCount,
  isDeansList,
  specialEffects = [],
  specialCodes = [],
}) => {
  if (specialEffects.includes("incomplete")) return "Incom";
  if (specialEffects.includes("none") && specialCodes.length) {
    return specialCodes.join(" + ");
  }
  if (isDeansList) return "DL";
  if (academicStanding === "Supplementary") return `Supp ${failedCount}F`;
  if (academicStanding === "Carry Over") {
    return `Supp ${failedCount}F + C.O`;
  }
  if (academicStanding === "Repeat") return "Repeat + C.O";
  if (academicStanding === "Discontinued") return "Discont. + C.O";
  if (academicStanding === "Suspended") return "Sus";
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
  const specialEffects = calculatedCourses
    .map((course) => course.specialResultEffect)
    .filter(Boolean);
  const academicStanding = determineStanding({
    failedCount: failedCourses.length,
    gpa: GPA,
    earnedCredits,
    rules: policy.promotionRules,
    specialEffects,
  });

  const withProgressionFlags = calculatedCourses.map((course) => ({
    ...course,
    isCarryOver:
      course.isCarryOver ||
      (course.status === "failed" &&
        ["Carry Over", "Repeat", "Discontinued"].includes(academicStanding)),
  }));
  const hasIncompleteResult = withProgressionFlags.some(
    (course) =>
      ["incomplete", "none"].includes(course.specialResultEffect) ||
      course.status === "in-progress",
  );
  const isDeansList =
    Boolean(policy.promotionRules.deansListEnabled) &&
    academicStanding === "Pass" &&
    failedCourses.length === 0 &&
    !hasIncompleteResult &&
    GPA >= Number(policy.promotionRules.deansListGpaThreshold) &&
    earnedCredits >=
      Number(policy.promotionRules.deansListMinimumEarnedCredits);
  const institutionalRemark = formatInstitutionalRemark({
    academicStanding,
    failedCount: failedCourses.length,
    isDeansList,
    specialEffects,
    specialCodes: withProgressionFlags
      .map((course) => course.resultCode)
      .filter(Boolean),
  });

  return {
    courses: withProgressionFlags,
    GPA,
    earnedCredits,
    failedCourseCount: failedCourses.length,
    academicStanding,
    isDeansList,
    institutionalRemark,
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
      (course) => isCourseResultComplete(course, policy),
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

const isCourseResultEntered = (course, policyInput) => {
  const policy = normalizePolicy(policyInput);
  if (typeof course.marks === "number") return true;
  const code = String(course.resultCode || "").trim();
  return (policy.specialResultCodes || []).some(
    (item) => item.isActive !== false && item.code === code,
  );
};

const isCourseResultComplete = (course, policyInput) => {
  const policy = normalizePolicy(policyInput);
  if (
    typeof course.marks === "number" &&
    typeof course.gradePoint === "number" &&
    Boolean(course.grade)
  ) {
    return true;
  }
  const code = (policy.specialResultCodes || []).find(
    (item) =>
      item.isActive !== false &&
      item.code === String(course.resultCode || "").trim(),
  );
  return Boolean(
    code &&
      !["none", "incomplete"].includes(code.progressionEffect) &&
      typeof course.gradePoint === "number",
  );
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
  formatInstitutionalRemark,
  getPolicySnapshot,
  isCourseResultComplete,
  isCourseResultEntered,
  validateResultForRelease,
  verifyResultMetrics,
};
