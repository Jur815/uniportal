const dotenv = require("dotenv");
const crypto = require("crypto");
const mongoose = require("mongoose");
const path = require("path");

const AcademicRecord = require("../models/AcademicRecord");
const AcademicSession = require("../models/AcademicSession");
const Complaint = require("../models/Complaint");
const Course = require("../models/Course");
const Department = require("../models/departmentModel");
const Enrollment = require("../models/Enrollment");
const ExamClearance = require("../models/ExamClearance");
const Faculty = require("../models/facultyModel");
const GradingPolicy = require("../models/GradingPolicy");
const Program = require("../models/programModel");
const StudentProfile = require("../models/StudentProfile");
const TimetableEntry = require("../models/TimetableEntry");
const User = require("../models/User");
const {
  calculateSemesterResult,
  getPolicySnapshot,
} = require("../services/resultCalculationService");

dotenv.config({ path: path.join(__dirname, "..", "..", "config.env") });
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const requiredEnv = ["DATABASE"];
const missingEnv = requiredEnv.filter((name) => !process.env[name]);

if (
  process.env.DATABASE?.includes("<PASSWORD>") &&
  !process.env.DATABASE_PASSWORD
) {
  missingEnv.push("DATABASE_PASSWORD");
}

if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

const DB = process.env.DATABASE.includes("<PASSWORD>")
  ? process.env.DATABASE.replace(
      "<PASSWORD>",
      encodeURIComponent(process.env.DATABASE_PASSWORD),
    )
  : process.env.DATABASE;

const assertDemoDatabaseResetIsAuthorized = () => {
  let target;
  try {
    target = new URL(DB);
  } catch {
    throw new Error("DATABASE must be a valid MongoDB connection URL.");
  }

  const localHosts = new Set(["127.0.0.1", "localhost", "::1"]);
  const databaseName = target.pathname.replace(/^\//, "");
  const confirmation = `RESET:${target.hostname}/${databaseName}`;
  const remoteResetConfirmed =
    process.env.CONFIRM_DEMO_DATABASE_RESET === confirmation;
  const localDemoDatabase =
    localHosts.has(target.hostname) && databaseName === "uniportal";

  if (
    databaseName !== "uniportal" ||
    (!localDemoDatabase && !remoteResetConfirmed)
  ) {
    throw new Error(
      `Refusing database reset. For this configured demo database, set CONFIRM_DEMO_DATABASE_RESET=${confirmation}.`,
    );
  }
};

const generatedPasswords = new Map();

const getDemoPassword = (envName) => {
  if (process.env[envName]) return process.env[envName];

  if (!generatedPasswords.has(envName)) {
    generatedPasswords.set(
      envName,
      `Demo-${crypto.randomBytes(9).toString("base64url")}1!`,
    );
  }

  return generatedPasswords.get(envName);
};

const adminAccounts = [
  {
    name: "Demo Admin",
    email: "admin@uniportal.demo",
    password: getDemoPassword("DEMO_ADMIN_PASSWORD"),
    role: "admin",
  },
  {
    name: "Demo Registrar",
    email: "registrar@uniportal.demo",
    password: getDemoPassword("DEMO_REGISTRAR_PASSWORD"),
    role: "registrar",
  },
];

const institutionalRoleAccounts = [
  {
    name: "Demo Finance Officer",
    email: "finance@uniportal.demo",
    password: getDemoPassword("DEMO_FINANCE_PASSWORD"),
    role: "finance",
  },
  {
    name: "Demo Lecturer",
    email: "lecturer@uniportal.demo",
    password: getDemoPassword("DEMO_LECTURER_PASSWORD"),
    role: "lecturer",
  },
  {
    name: "Demo Dean / HOD",
    email: "dean@uniportal.demo",
    password: getDemoPassword("DEMO_DEAN_PASSWORD"),
    role: "dean_hod",
  },
];

const studentSeed = [
  ["John Garang", "john.student@uniportal.demo", "UP-2026-0001", "REG-2026-CS-001", "BSC-CS", 1],
  ["Amina Deng", "amina.student@uniportal.demo", "UP-2026-0002", "REG-2026-IT-002", "BSC-IT", 1],
  ["Martha Nyandeng", "martha.student@uniportal.demo", "UP-2026-0003", "REG-2026-ACC-003", "BBA-ACC", 1],
  ["Peter Lado", "peter.student@uniportal.demo", "UP-2026-0004", "REG-2026-BBA-004", "BBA-MGT", 1],
  ["Grace Wani", "grace.student@uniportal.demo", "UP-2025-0005", "REG-2025-CS-005", "BSC-CS", 2],
  ["Samuel Chol", "samuel.student@uniportal.demo", "UP-2025-0006", "REG-2025-SE-006", "BSC-SE", 2],
  ["Nyanath Kuol", "nyanath.student@uniportal.demo", "UP-2025-0007", "REG-2025-IT-007", "BSC-IT", 2],
  ["David Mori", "david.student@uniportal.demo", "UP-2025-0008", "REG-2025-ACC-008", "BBA-ACC", 2],
  ["Elizabeth Abuk", "elizabeth.student@uniportal.demo", "UP-2024-0009", "REG-2024-CS-009", "BSC-CS", 3],
  ["Joseph Taban", "joseph.student@uniportal.demo", "UP-2024-0010", "REG-2024-NUR-010", "BSC-NUR", 3],
  ["Mary Achol", "mary.student@uniportal.demo", "UP-2024-0011", "REG-2024-PH-011", "BSC-PH", 3],
  ["Emmanuel Khamis", "emmanuel.student@uniportal.demo", "UP-2026-0012", "REG-2026-ECON-012", "BA-ECON", 1],
  ["Sarah Yar", "sarah.student@uniportal.demo", "UP-2026-0013", "REG-2026-ENG-013", "BA-ENG", 1],
  ["Daniel Majok", "daniel.student@uniportal.demo", "UP-2025-0014", "REG-2025-MED-014", "BSC-MEDLAB", 2],
  ["Rebecca Nyok", "rebecca.student@uniportal.demo", "UP-2025-0015", "REG-2025-BBA-015", "BBA-MGT", 2],
  ["Thomas Makuach", "thomas.student@uniportal.demo", "UP-2024-0016", "REG-2024-ECON-016", "BA-ECON", 3],
  ["Linda Apai", "linda.student@uniportal.demo", "UP-2026-0017", "REG-2026-SE-017", "BSC-SE", 1],
  ["Michael Atem", "michael.student@uniportal.demo", "UP-2026-0018", "REG-2026-PH-018", "BSC-PH", 1],
  ["Nancy Arop", "nancy.student@uniportal.demo", "UP-2025-0019", "REG-2025-ENG-019", "BA-ENG", 2],
  ["Isaac Deng", "isaac.student@uniportal.demo", "UP-2025-0020", "REG-2025-NUR-020", "BSC-NUR", 2],
  ["Hellen Wani", "hellen.student@uniportal.demo", "UP-2024-0021", "REG-2024-IT-021", "BSC-IT", 3],
  ["Paulino Lual", "paulino.student@uniportal.demo", "UP-2024-0022", "REG-2024-ACC-022", "BBA-ACC", 3],
  ["Agnes Kiden", "agnes.student@uniportal.demo", "UP-2026-0023", "REG-2026-MED-023", "BSC-MEDLAB", 1],
  ["Stephen Malual", "stephen.student@uniportal.demo", "UP-2025-0024", "REG-2025-ECON-024", "BA-ECON", 2],
  ["Bol Mading", "bol.cs@uniportal.demo", "UP-2025-CS25", "REG-2025-CS-025", "BSC-CS", 1],
  ["Nyabuay Gatluak", "nyabuay.cs@uniportal.demo", "UP-2025-CS26", "REG-2025-CS-026", "BSC-CS", 1],
  ["James Loku", "james.cs@uniportal.demo", "UP-2025-CS27", "REG-2025-CS-027", "BSC-CS", 1],
  ["Adut Akech", "adut.cs@uniportal.demo", "UP-2025-CS28", "REG-2025-CS-028", "BSC-CS", 1],
  ["Morris Wani", "morris.cs@uniportal.demo", "UP-2025-CS29", "REG-2025-CS-029", "BSC-CS", 1],
  ["Rebecca Deng", "rebecca.cs@uniportal.demo", "UP-2025-CS30", "REG-2025-CS-030", "BSC-CS", 1],
];

const faculties = [
  ["FOC", "Faculty of Computing", "Computing, software, data, and information systems."],
  ["FOB", "Faculty of Business and Humanities", "Business, accounting, economics, management, and communication."],
  ["FHS", "Faculty of Health Sciences", "Nursing, public health, and medical laboratory sciences."],
];

const departments = [
  ["CS", "Department of Computer Science", "FOC"],
  ["IT", "Department of Information Technology", "FOC"],
  ["SE", "Department of Software Engineering", "FOC"],
  ["ACC", "Department of Accounting", "FOB"],
  ["MGT", "Department of Management", "FOB"],
  ["NUR", "Department of Nursing", "FHS"],
  ["PH", "Department of Public Health", "FHS"],
  ["MLAB", "Department of Medical Laboratory Sciences", "FHS"],
  ["ECON", "Department of Economics", "FOB"],
  ["ENG", "Department of English and Communication", "FOB"],
];

const programs = [
  ["BSC-CS", "BSc Computer Science", "FOC", "CS"],
  ["BSC-IT", "BSc Information Technology", "FOC", "IT"],
  ["BSC-SE", "BSc Software Engineering", "FOC", "SE"],
  ["BBA-ACC", "BBA Accounting", "FOB", "ACC"],
  ["BBA-MGT", "BBA Management", "FOB", "MGT"],
  ["BSC-NUR", "BSc Nursing", "FHS", "NUR"],
  ["BSC-PH", "BSc Public Health", "FHS", "PH"],
  ["BSC-MEDLAB", "BSc Medical Laboratory Sciences", "FHS", "MLAB"],
  ["BA-ECON", "BA Economics", "FOB", "ECON"],
  ["BA-ENG", "BA English and Communication", "FOB", "ENG"],
];

const courseSeed = [
  ["CSC101", "Introduction to Computer Science", 3, 1, 1, "BSC-CS"],
  ["CSC102", "Programming Fundamentals", 3, 1, 1, "BSC-CS"],
  ["CSC103", "Discrete Mathematics", 3, 1, 1, "BSC-CS"],
  ["CSC104", "Computer Systems Fundamentals", 3, 1, 1, "BSC-CS"],
  ["CSC105", "Mathematics for Computing", 3, 1, 1, "BSC-CS"],
  ["CSC106", "Academic Communication for Computing", 3, 1, 1, "BSC-CS"],
  ["CSC201", "Data Structures and Algorithms", 4, 1, 2, "BSC-CS"],
  ["CSC301", "Database Systems", 3, 1, 3, "BSC-CS"],
  ["CSC302", "Operating Systems", 3, 1, 3, "BSC-CS"],
  ["IT101", "Information Technology Essentials", 3, 1, 1, "BSC-IT"],
  ["IT102", "Computer Networks I", 3, 1, 1, "BSC-IT"],
  ["IT201", "Systems Administration", 3, 1, 2, "BSC-IT"],
  ["IT301", "Information Security", 3, 1, 3, "BSC-IT"],
  ["IT302", "Cloud Infrastructure", 3, 1, 3, "BSC-IT"],
  ["SWE101", "Software Engineering Principles", 3, 1, 1, "BSC-SE"],
  ["SWE102", "Web Application Development", 3, 1, 1, "BSC-SE"],
  ["SWE201", "Object-Oriented Analysis and Design", 3, 1, 2, "BSC-SE"],
  ["SWE301", "Software Project Management", 3, 1, 3, "BSC-SE"],
  ["ACC101", "Principles of Accounting", 3, 1, 1, "BBA-ACC"],
  ["ACC102", "Business Mathematics", 3, 1, 1, "BBA-ACC"],
  ["ACC201", "Financial Accounting I", 3, 1, 2, "BBA-ACC"],
  ["ACC301", "Auditing Principles", 3, 1, 3, "BBA-ACC"],
  ["MGT101", "Principles of Management", 3, 1, 1, "BBA-MGT"],
  ["MGT201", "Organizational Behaviour", 3, 1, 2, "BBA-MGT"],
  ["MGT301", "Strategic Management", 3, 1, 3, "BBA-MGT"],
  ["NUR101", "Foundations of Nursing", 4, 1, 1, "BSC-NUR"],
  ["NUR201", "Medical Surgical Nursing I", 4, 1, 2, "BSC-NUR"],
  ["NUR301", "Community Health Nursing", 4, 1, 3, "BSC-NUR"],
  ["NUR302", "Maternal and Child Health Nursing", 4, 1, 3, "BSC-NUR"],
  ["PH101", "Introduction to Public Health", 3, 1, 1, "BSC-PH"],
  ["PH201", "Epidemiology I", 3, 1, 2, "BSC-PH"],
  ["PH301", "Health Systems Management", 3, 1, 3, "BSC-PH"],
  ["MLS101", "Introduction to Medical Laboratory Science", 4, 1, 1, "BSC-MEDLAB"],
  ["MLS201", "Clinical Chemistry I", 4, 1, 2, "BSC-MEDLAB"],
  ["MLS301", "Microbiology and Parasitology", 4, 1, 3, "BSC-MEDLAB"],
  ["MLS302", "Hematology and Blood Transfusion", 4, 1, 3, "BSC-MEDLAB"],
  ["ECO101", "Principles of Microeconomics", 3, 1, 1, "BA-ECON"],
  ["ECO201", "Macroeconomic Theory", 3, 1, 2, "BA-ECON"],
  ["ECO301", "Development Economics", 3, 1, 3, "BA-ECON"],
  ["ENG101", "Academic Writing and Communication", 3, 1, 1, "BA-ENG"],
  ["ENG201", "Introduction to Linguistics", 3, 1, 2, "BA-ENG"],
  ["ENG301", "Media and Professional Communication", 3, 1, 3, "BA-ENG"],
];

const historicalCourseCodes = [
  "CSC101",
  "CSC102",
  "IT101",
  "ACC101",
  "MGT101",
  "NUR101",
  "PH101",
  "ECO101",
  "ENG101",
];

const examinationDemoCohort = [
  {
    email: "bol.cs@uniportal.demo",
    standing: "Pass",
    marks: [78, 72, 68, 65, 61, 58],
    workflowStatus: "released",
  },
  {
    email: "nyabuay.cs@uniportal.demo",
    standing: "Supplementary",
    marks: [75, 68, 62, 58, 55, 45],
    workflowStatus: "released",
  },
  {
    email: "james.cs@uniportal.demo",
    standing: "Carry Over",
    marks: [78, 72, 68, 55, 45, 42],
    workflowStatus: "released",
  },
  {
    email: "adut.cs@uniportal.demo",
    standing: "Repeat",
    marks: [85, 82, 45, 40, 35, 30],
    workflowStatus: "released",
  },
  {
    email: "morris.cs@uniportal.demo",
    standing: "Discontinued",
    marks: [45, 42, 38, 35, 30, 25],
    workflowStatus: "released",
  },
  {
    email: "rebecca.cs@uniportal.demo",
    standing: "Pass",
    marks: [81, 76, 69, 64, 60, 56],
    workflowStatus: "dean_hod_reviewed",
  },
];

const examinationCourseCodes = [
  "CSC101",
  "CSC102",
  "CSC103",
  "CSC104",
  "CSC105",
  "CSC106",
];

const resetDemoDatabase = async () => {
  const collections = [
    AcademicRecord,
    Enrollment,
    Complaint,
    ExamClearance,
    TimetableEntry,
    StudentProfile,
    GradingPolicy,
    Course,
    Program,
    Department,
    Faculty,
    AcademicSession,
    User,
  ];
  const removed = {};

  for (const Model of collections) {
    const result = await Model.deleteMany({});
    removed[Model.collection.collectionName] = result.deletedCount;
  }

  return removed;
};

const ensureUser = async ({ name, email, password, role }) => {
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({ name, email, password, role, status: "active" });
    return user;
  }

  user.name = name;
  user.role = role;
  user.status = "active";
  user.password = password;
  await user.save();
  return user;
};

const upsertAcademicStructure = async () => {
  const facultyByCode = {};
  const departmentByCode = {};
  const programByCode = {};

  for (const [code, name, description] of faculties) {
    facultyByCode[code] = await Faculty.findOneAndUpdate(
      { code },
      { code, name, description, isActive: true },
      { returnDocument: "after", upsert: true, runValidators: true },
    );
  }

  for (const [code, name, facultyCode] of departments) {
    departmentByCode[code] = await Department.findOneAndUpdate(
      { code },
      {
        code,
        name,
        faculty: facultyByCode[facultyCode]._id,
        description: `${name} academic department.`,
        isActive: true,
      },
      { returnDocument: "after", upsert: true, runValidators: true },
    );
  }

  for (const [code, name, facultyCode, departmentCode] of programs) {
    programByCode[code] = await Program.findOneAndUpdate(
      { code, department: departmentByCode[departmentCode]._id },
      {
        code,
        name,
        faculty: facultyByCode[facultyCode]._id,
        department: departmentByCode[departmentCode]._id,
        description: `${name} undergraduate program.`,
        isActive: true,
      },
      { returnDocument: "after", upsert: true, runValidators: true },
    );
  }

  return { facultyByCode, departmentByCode, programByCode };
};

const upsertCourses = async ({ facultyByCode, departmentByCode, programByCode }) => {
  const programMeta = new Map(
    programs.map(([programCode, , facultyCode, departmentCode]) => [
      programCode,
      { facultyCode, departmentCode },
    ]),
  );
  const courses = {};

  for (const [code, title, creditHours, semester, level, programCode] of courseSeed) {
    const meta = programMeta.get(programCode);
    const department = departmentByCode[meta.departmentCode];
    const program = programByCode[programCode];

    courses[code] = await Course.findOneAndUpdate(
      { code },
      {
        code,
        title,
        creditHours,
        semester,
        level,
        department: department.name,
        program: program.name,
        facultyRef: facultyByCode[meta.facultyCode]._id,
        departmentRef: department._id,
        programRef: program._id,
        isActive: true,
      },
      { returnDocument: "after", upsert: true, runValidators: true },
    );
  }

  return courses;
};

const upsertAcademicSessions = async () => {
  await AcademicSession.updateMany({}, { isActive: false });

  const sessions = [
    {
      academicYear: "2026/2027",
      semester: 1,
      enrollmentStatus: "open",
      registrationOpen: true,
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-12-15"),
      isActive: true,
      notes: "Active demo registration window for institutional presentation.",
    },
    {
      academicYear: "2025/2026",
      semester: 2,
      enrollmentStatus: "closed",
      registrationOpen: false,
      startDate: new Date("2026-01-15"),
      endDate: new Date("2026-05-30"),
      isActive: false,
      notes: "Closed historical session with approved academic records.",
    },
    {
      academicYear: "2025/2026",
      semester: 1,
      enrollmentStatus: "closed",
      registrationOpen: false,
      startDate: new Date("2025-08-01"),
      endDate: new Date("2025-12-15"),
      isActive: false,
      notes: "Previous registration cycle for reporting context.",
    },
  ];

  for (const session of sessions) {
    await AcademicSession.findOneAndUpdate(
      { academicYear: session.academicYear, semester: session.semester },
      session,
      { returnDocument: "after", upsert: true, runValidators: true },
    );
  }
};

const upsertStudentProfile = async (student, seed, programByCode, departmentByCode) => {
  const [name, , studentId, registrationNumber, programCode, level] = seed;
  const program = programByCode[programCode];
  const [, , facultyCode, departmentCode] = programs.find(
    ([code]) => code === programCode,
  );
  const department = departmentByCode[departmentCode];
  const phoneSuffix = studentId.slice(-4);

  return StudentProfile.findOneAndUpdate(
    { user: student._id },
    {
      user: student._id,
      studentId,
      registrationNumber,
      faculty: faculties.find(([code]) => code === facultyCode)[1],
      department: department.name,
      program: program.name,
      level,
      yearOfStudy: level,
      intakeYear: 2027 - level,
      phone: `+21190000${phoneSuffix}`,
      guardianName: `${name.split(" ")[0]} Guardian`,
      guardianPhone: `+21190100${phoneSuffix}`,
      academicVerified: true,
    },
    { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
};

const buildDecisionAudit = (status, registrar) => {
  if (status === "pending") return [];

  const reasonMap = {
    approved: "Demo enrollment approved after academic profile verification.",
    rejected: "Wrong semester selection for selected courses.",
    correction_required: "Missing profile information before final registration.",
  };

  return [
    {
      decidedBy: registrar._id,
      decidedAt: new Date(),
      previousStatus: "pending",
      newStatus: status,
      decisionReasonType:
        status === "approved" ? undefined : "Academic verification incomplete",
      reason: reasonMap[status],
    },
  ];
};

const upsertEnrollment = async ({
  student,
  courses,
  status,
  registrar,
  academicYear,
  semester,
}) => {
  const totalCredits = courses.reduce(
    (sum, course) => sum + Number(course.creditHours || 0),
    0,
  );

  return Enrollment.findOneAndUpdate(
    { student: student._id, academicYear, semester },
    {
      student: student._id,
      academicYear,
      semester,
      courses: courses.map((course) => course._id),
      totalCredits,
      status,
      decisionAuditLog: buildDecisionAudit(status, registrar),
      rejectionReason:
        status === "rejected" || status === "correction_required"
          ? buildDecisionAudit(status, registrar)[0].reason
          : undefined,
      decisionReasonType:
        status === "rejected" || status === "correction_required"
          ? "Academic verification incomplete"
          : undefined,
    },
    { returnDocument: "after", upsert: true, runValidators: true },
  );
};

const upsertAcademicRecord = async (enrollment, courses, index = 0) => {
  const gradeSet = [
    ["A", 4],
    ["B+", 3.5],
    ["B", 3],
    ["C+", 2.5],
  ];
  const recordCourses = courses.map((course, courseIndex) => {
    const [grade, gradePoint] = gradeSet[(index + courseIndex) % gradeSet.length];
    return {
      course: course._id,
      code: course.code,
      title: course.title,
      creditHours: course.creditHours,
      grade,
      gradePoint,
      status: gradePoint >= 2 ? "passed" : "incomplete",
    };
  });
  const totalCredits = recordCourses.reduce(
    (sum, course) => sum + Number(course.creditHours || 0),
    0,
  );
  const weightedPoints = recordCourses.reduce(
    (sum, course) => sum + course.creditHours * course.gradePoint,
    0,
  );

  return AcademicRecord.findOneAndUpdate(
    { enrollment: enrollment._id },
    {
      student: enrollment.student,
      enrollment: enrollment._id,
      academicYear: enrollment.academicYear,
      semester: enrollment.semester,
      courses: recordCourses,
      totalCredits,
      GPA: Math.round((weightedPoints / totalCredits) * 100) / 100,
      remarks: "Demo academic record generated from approved enrollment.",
    },
    { returnDocument: "after", upsert: true, runValidators: true },
  );
};

const upsertDemoGradingPolicy = async (admin) => {
  await GradingPolicy.updateMany(
    { isActive: true },
    { $set: { isActive: false, updatedBy: admin._id } },
  );
  return GradingPolicy.findOneAndUpdate(
    { name: "Demo Policy - configurable per institution" },
    {
      name: "Demo Policy - configurable per institution",
      isActive: true,
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
      createdBy: admin._id,
      updatedBy: admin._id,
    },
    { returnDocument: "after", upsert: true, runValidators: true },
  );
};

const buildResultAudit = ({
  courses,
  lecturer,
  dean,
  registrar,
  workflowStatus,
  timestamp,
}) => {
  const auditLog = courses.map((course) => ({
    action: "marks_updated",
    actor: lecturer._id,
    actorRole: lecturer.role,
    occurredAt: timestamp,
    course: course.course,
    previousValue: {},
    newValue: {
      marks: course.marks,
      grade: course.grade,
      gradePoint: course.gradePoint,
      status: course.status,
    },
    note: "Seeded Computer Science marks for institutional demonstration.",
  }));
  auditLog.push(
    {
      action: "workflow_submit",
      actor: lecturer._id,
      actorRole: lecturer.role,
      occurredAt: timestamp,
      previousValue: { workflowStatus: "draft" },
      newValue: { workflowStatus: "lecturer_submitted" },
      note: "Lecturer submitted complete course marks.",
    },
    {
      action: "workflow_review",
      actor: dean._id,
      actorRole: dean.role,
      occurredAt: timestamp,
      previousValue: { workflowStatus: "lecturer_submitted" },
      newValue: { workflowStatus: "dean_hod_reviewed" },
      note: "Dean/HOD reviewed the semester result.",
    },
  );

  if (["registrar_finalized", "released"].includes(workflowStatus)) {
    auditLog.push({
      action: "workflow_finalize",
      actor: registrar._id,
      actorRole: registrar.role,
      occurredAt: timestamp,
      previousValue: { workflowStatus: "dean_hod_reviewed" },
      newValue: { workflowStatus: "registrar_finalized" },
      note: "Registrar approved the academic standing.",
    });
  }
  if (workflowStatus === "released") {
    auditLog.push({
      action: "workflow_release",
      actor: registrar._id,
      actorRole: registrar.role,
      occurredAt: timestamp,
      previousValue: { workflowStatus: "registrar_finalized" },
      newValue: { workflowStatus: "released" },
      note: "Registrar released the result to the student portal.",
    });
  }
  return auditLog;
};

const seedExaminationDemo = async ({
  accounts,
  courses,
  policy,
  registrar,
}) => {
  const lecturer = accounts["lecturer@uniportal.demo"];
  const dean = accounts["dean@uniportal.demo"];
  const csCourses = examinationCourseCodes.map((code) => courses[code]);
  const timestamp = new Date("2026-06-01T09:00:00.000Z");

  for (const item of examinationDemoCohort) {
    const student = accounts[item.email];
    const enrollment = await upsertEnrollment({
      student,
      courses: csCourses,
      status: "approved",
      registrar,
      academicYear: "2025/2026",
      semester: 2,
    });
    const baseCourses = csCourses.map((course, index) => ({
      course: course._id,
      code: course.code,
      title: course.title,
      creditHours: course.creditHours,
      marks: item.marks[index],
      attemptNumber: 1,
    }));
    const calculated = calculateSemesterResult(baseCourses, policy);
    if (calculated.academicStanding !== item.standing) {
      throw new Error(
        `${item.email} expected ${item.standing}, calculated ${calculated.academicStanding}`,
      );
    }
    const isReleased = item.workflowStatus === "released";
    const update = {
      student: student._id,
      enrollment: enrollment._id,
      academicYear: enrollment.academicYear,
      semester: enrollment.semester,
      courses: calculated.courses,
      totalCredits: csCourses.reduce(
        (sum, course) => sum + Number(course.creditHours),
        0,
      ),
      GPA: calculated.GPA,
      CGPA: calculated.GPA,
      earnedCredits: calculated.earnedCredits,
      failedCourseCount: calculated.failedCourseCount,
      academicStanding: item.standing,
      workflowStatus: item.workflowStatus,
      gradingPolicy: policy._id,
      gradingPolicySnapshot: getPolicySnapshot(policy),
      submittedBy: lecturer._id,
      submittedAt: timestamp,
      reviewedBy: dean._id,
      reviewedAt: timestamp,
      finalizedBy: isReleased ? registrar._id : undefined,
      finalizedAt: isReleased ? timestamp : undefined,
      releasedBy: isReleased ? registrar._id : undefined,
      releasedAt: isReleased ? timestamp : undefined,
      approvalNote: isReleased
        ? "Released Computer Science result for institutional demo."
        : "Reviewed result intentionally not released for visibility testing.",
      remarks: `${item.standing} demonstration record.`,
      auditLog: buildResultAudit({
        courses: calculated.courses,
        lecturer,
        dean,
        registrar,
        workflowStatus: item.workflowStatus,
        timestamp,
      }),
    };
    await AcademicRecord.findOneAndUpdate(
      { enrollment: enrollment._id },
      update,
      { returnDocument: "after", upsert: true, runValidators: true },
    );
  }
};

const seedTimetableDemo = async ({ courses, structure }) => {
  const computingFaculty = structure.facultyByCode.FOC;
  const computerScienceDepartment = structure.departmentByCode.CS;
  const computerScienceProgram = structure.programByCode["BSC-CS"];
  const entries = [
    ["CSC101", "Monday", "08:30", "10:00", "Computing Lab 1"],
    ["CSC102", "Tuesday", "10:15", "11:45", "Computing Lab 2"],
    ["CSC103", "Wednesday", "08:30", "10:00", "Lecture Hall B"],
    ["CSC104", "Thursday", "10:15", "11:45", "Computing Lab 1"],
    ["CSC105", "Friday", "08:30", "10:00", "Lecture Hall B"],
    ["CSC106", "Friday", "10:15", "11:45", "Seminar Room 2"],
  ];

  await TimetableEntry.insertMany(
    entries.map(([courseCode, dayOfWeek, startTime, endTime, venue]) => ({
      course: courses[courseCode]._id,
      faculty: computingFaculty._id,
      department: computerScienceDepartment._id,
      program: computerScienceProgram._id,
      academicYear: "2026/2027",
      semester: 1,
      dayOfWeek,
      startTime,
      endTime,
      venue,
      lecturerName: "Demo Lecturer",
      isActive: true,
    })),
  );
};

const seedStudentServicesDemo = async ({ accounts, registrar }) => {
  await Complaint.insertMany([
    {
      student: accounts["john.student@uniportal.demo"]._id,
      complaintType: "registration_issue",
      subject: "Registration approval confirmation",
      description:
        "Requesting confirmation that the approved semester registration is reflected on the student portal.",
      status: "resolved",
      response:
        "Registration was verified and the approved enrollment is available on the student portal.",
      handledBy: registrar._id,
    },
    {
      student: accounts["amina.student@uniportal.demo"]._id,
      complaintType: "profile_issue",
      subject: "Student profile verification",
      description:
        "Requesting review of the academic profile before semester registration closes.",
      status: "in_review",
      response: "The Registrar's Office is reviewing the submitted profile information.",
      handledBy: registrar._id,
    },
  ]);
};

const seedExamClearanceDemo = async ({ accounts, registrar }) => {
  await ExamClearance.insertMany([
    {
      student: accounts["john.student@uniportal.demo"]._id,
      academicYear: "2026/2027",
      semester: 1,
      status: "eligible",
      attendancePercentage: 91,
      financialClearanceStatus: "cleared",
      remarks: "Eligible for the scheduled semester examinations.",
      reviewedBy: registrar._id,
      reviewedAt: new Date("2026-06-10T09:00:00.000Z"),
    },
    {
      student: accounts["hellen.student@uniportal.demo"]._id,
      academicYear: "2026/2027",
      semester: 1,
      status: "pending",
      attendancePercentage: 82,
      financialClearanceStatus: "pending",
      remarks: "Pending final financial clearance confirmation.",
    },
    {
      student: accounts["elizabeth.student@uniportal.demo"]._id,
      academicYear: "2026/2027",
      semester: 1,
      status: "not_eligible",
      attendancePercentage: 68,
      financialClearanceStatus: "cleared",
      remarks: "Attendance review required before examination eligibility.",
      reviewedBy: registrar._id,
      reviewedAt: new Date("2026-06-10T09:15:00.000Z"),
    },
  ]);
};

const verifyAndSummarizeDemo = async () => {
  const [
    totalUsers,
    totalStudents,
    totalFaculties,
    totalDepartments,
    totalPrograms,
    totalCourses,
    totalEnrollments,
    totalAcademicRecords,
    totalReleasedResults,
    totalUnreleasedResults,
    timetableEntries,
    complaints,
    examClearances,
    progressionRows,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "student" }),
    Faculty.countDocuments(),
    Department.countDocuments(),
    Program.countDocuments(),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    AcademicRecord.countDocuments(),
    AcademicRecord.countDocuments({ workflowStatus: "released" }),
    AcademicRecord.countDocuments({
      gradingPolicy: { $exists: true },
      workflowStatus: { $ne: "released" },
    }),
    TimetableEntry.countDocuments(),
    Complaint.countDocuments(),
    ExamClearance.countDocuments(),
    AcademicRecord.aggregate([
      { $match: { gradingPolicy: { $exists: true } } },
      { $group: { _id: "$academicStanding", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const progressionStatusCounts = Object.fromEntries(
    progressionRows.map(({ _id, count }) => [_id, count]),
  );
  const expectedProgressionCounts = {
    Pass: 2,
    Supplementary: 1,
    "Carry Over": 1,
    Repeat: 1,
    Discontinued: 1,
  };
  for (const [status, expected] of Object.entries(expectedProgressionCounts)) {
    if (progressionStatusCounts[status] !== expected) {
      throw new Error(
        `Expected ${expected} ${status} examination record(s), found ${progressionStatusCounts[status] || 0}.`,
      );
    }
  }

  const rebecca = await User.findOne({ email: "rebecca.cs@uniportal.demo" });
  const rebeccaResult = await AcademicRecord.findOne({
    student: rebecca._id,
    gradingPolicy: { $exists: true },
  });
  if (rebeccaResult?.workflowStatus !== "dean_hod_reviewed") {
    throw new Error("Rebecca Deng's result must remain reviewed and unreleased.");
  }

  const accidentalRecords = await Promise.all([
    Department.countDocuments({
      $or: [{ name: /Stephen Hakim Joseph/i }, { code: "001" }],
    }),
    Course.countDocuments({
      $or: [{ title: /commnity studies amd rural development/i }, { code: "001" }],
    }),
    User.countDocuments({ name: /Ngor Agook Kuol/i }),
  ]);
  if (accidentalRecords.some(Boolean)) {
    throw new Error("Accidental test records remain after the demo reset.");
  }

  return {
    totalUsers,
    totalStudents,
    totalFaculties,
    totalDepartments,
    totalPrograms,
    totalCourses,
    totalEnrollments,
    totalAcademicRecords,
    totalReleasedResults,
    totalUnreleasedResults,
    progressionStatusCounts,
    timetableEntries,
    complaints,
    examClearances,
  };
};

const getCoursesForProgramLevel = (courses, programCode, level) =>
  courseSeed
    .filter(([, , , , courseLevel, seedProgramCode]) => {
      return seedProgramCode === programCode && courseLevel === level;
    })
    .map(([code]) => courses[code])
    .filter(Boolean)
    .slice(0, 3);

const getFallbackCourses = (courses, level) =>
  courseSeed
    .filter(([, , , , courseLevel]) => courseLevel === level)
    .map(([code]) => courses[code])
    .filter(Boolean)
    .slice(0, 3);

const seedDemo = async () => {
  assertDemoDatabaseResetIsAuthorized();
  await mongoose.connect(DB);
  const removed = await resetDemoDatabase();

  const accounts = {};
  for (const account of [...adminAccounts, ...institutionalRoleAccounts]) {
    accounts[account.email] = await ensureUser(account);
  }

  const studentPassword = getDemoPassword("DEMO_STUDENT_PASSWORD");
  for (const [name, email] of studentSeed) {
    accounts[email] = await ensureUser({
      name,
      email,
      password: studentPassword,
      role: "student",
    });
  }

  const structure = await upsertAcademicStructure();
  const courses = await upsertCourses(structure);
  await upsertAcademicSessions();

  for (const seed of studentSeed) {
    const [, email] = seed;
    await upsertStudentProfile(
      accounts[email],
      seed,
      structure.programByCode,
      structure.departmentByCode,
    );
  }

  const registrar = accounts["registrar@uniportal.demo"];
  const statuses = [
    "approved",
    "pending",
    "approved",
    "correction_required",
    "approved",
    "rejected",
    "pending",
    "approved",
    "approved",
    "pending",
    "approved",
    "correction_required",
    "pending",
    "approved",
    "rejected",
    "approved",
    "approved",
    "pending",
    "correction_required",
    "approved",
    "approved",
    "rejected",
    "pending",
    "approved",
    "approved",
    "approved",
    "approved",
    "approved",
    "approved",
    "approved",
  ];

  for (let index = 0; index < studentSeed.length; index += 1) {
    const [, email, , , programCode, level] = studentSeed[index];
    const student = accounts[email];
    const selectedCourses =
      getCoursesForProgramLevel(courses, programCode, level) ||
      getFallbackCourses(courses, level);
    const currentCourses =
      selectedCourses.length > 0 ? selectedCourses : Object.values(courses).slice(0, 2);

    const enrollment = await upsertEnrollment({
      student,
      courses: currentCourses,
      status: statuses[index],
      registrar,
      academicYear: "2026/2027",
      semester: 1,
    });

    if (statuses[index] === "approved") {
      await upsertAcademicRecord(enrollment, currentCourses, index);
    }

    if (index < 8) {
      const historicalCourses = historicalCourseCodes
        .map((code) => courses[code])
        .filter(Boolean)
        .slice(index % 3, (index % 3) + 2);
      const historicalEnrollment = await upsertEnrollment({
        student,
        courses: historicalCourses,
        status: "approved",
        registrar,
        academicYear: "2025/2026",
        semester: 2,
      });
      await upsertAcademicRecord(historicalEnrollment, historicalCourses, index + 1);
    }
  }

  const policy = await upsertDemoGradingPolicy(
    accounts["admin@uniportal.demo"],
  );
  await seedExaminationDemo({
    accounts,
    courses,
    policy,
    registrar,
  });
  await seedTimetableDemo({ courses, structure });
  await seedStudentServicesDemo({ accounts, registrar });
  await seedExamClearanceDemo({ accounts, registrar });

  const summary = await verifyAndSummarizeDemo();

  console.log("UniPortal institutional demo seed completed successfully.");
  console.log("\nRemoved records:");
  for (const [collection, count] of Object.entries(removed)) {
    console.log(`${collection}: ${count}`);
  }
  console.log("\nPrimary demo accounts:");
  for (const account of adminAccounts) {
    console.log(`${account.role}: ${account.email} / ${account.password}`);
  }
  console.log("\nPilot institutional role accounts:");
  for (const account of institutionalRoleAccounts) {
    console.log(`${account.role}: ${account.email} / ${account.password}`);
  }
  console.log(`student: john.student@uniportal.demo / ${studentPassword}`);
  console.log(`student: amina.student@uniportal.demo / ${studentPassword}`);
  console.log("\nSeeded data summary:");
  console.log(`total users: ${summary.totalUsers}`);
  console.log(`total students: ${summary.totalStudents}`);
  console.log(`total faculties: ${summary.totalFaculties}`);
  console.log(`total departments: ${summary.totalDepartments}`);
  console.log(`total programs: ${summary.totalPrograms}`);
  console.log(`total courses: ${summary.totalCourses}`);
  console.log(`total enrollments: ${summary.totalEnrollments}`);
  console.log(`total academic records: ${summary.totalAcademicRecords}`);
  console.log(`total released results: ${summary.totalReleasedResults}`);
  console.log(`total unreleased results: ${summary.totalUnreleasedResults}`);
  console.log(
    `progression status counts: ${JSON.stringify(summary.progressionStatusCounts)}`,
  );
  console.log(`timetable entries: ${summary.timetableEntries}`);
  console.log(`student service requests: ${summary.complaints}`);
  console.log(`exam clearance records: ${summary.examClearances}`);
  console.log("Current session: 2026/2027 Semester 1 open");
  console.log("Historical session: 2025/2026 Semester 2 closed");

  await mongoose.disconnect();
};

seedDemo().catch(async (error) => {
  console.error("UniPortal demo seed failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
