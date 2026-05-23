const dotenv = require("dotenv");
const crypto = require("crypto");
const mongoose = require("mongoose");
const path = require("path");

const AcademicRecord = require("../models/AcademicRecord");
const AcademicSession = require("../models/AcademicSession");
const Course = require("../models/Course");
const Department = require("../models/departmentModel");
const Enrollment = require("../models/Enrollment");
const Faculty = require("../models/facultyModel");
const Program = require("../models/programModel");
const StudentProfile = require("../models/StudentProfile");
const User = require("../models/User");

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
      { new: true, upsert: true, runValidators: true },
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
      { new: true, upsert: true, runValidators: true },
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
      { new: true, upsert: true, runValidators: true },
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
      { new: true, upsert: true, runValidators: true },
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
      { new: true, upsert: true, runValidators: true },
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
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
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
    { new: true, upsert: true, runValidators: true },
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
    { new: true, upsert: true, runValidators: true },
  );
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
  await mongoose.connect(DB);

  const accounts = {};
  for (const account of adminAccounts) {
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

  await mongoose.disconnect();

  console.log("UniPortal institutional demo seed completed successfully.");
  console.log("\nPrimary demo accounts:");
  for (const account of adminAccounts) {
    console.log(`${account.role}: ${account.email} / ${account.password}`);
  }
  console.log(`student: john.student@uniportal.demo / ${studentPassword}`);
  console.log(`student: amina.student@uniportal.demo / ${studentPassword}`);
  console.log("\nSeeded data summary:");
  console.log(`${faculties.length} faculties`);
  console.log(`${departments.length} departments`);
  console.log(`${programs.length} programs`);
  console.log(`${courseSeed.length} courses`);
  console.log(`${studentSeed.length} student profiles`);
  console.log("Current session: 2026/2027 Semester 1 open");
  console.log("Historical session: 2025/2026 Semester 2 closed");
};

seedDemo().catch(async (error) => {
  console.error("UniPortal demo seed failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
