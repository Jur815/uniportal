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
    generatedPasswords.set(envName, `Demo-${crypto.randomBytes(9).toString("base64url")}1!`);
  }

  return generatedPasswords.get(envName);
};

const demoAccounts = [
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
  {
    name: "John Garang",
    email: "john.student@uniportal.demo",
    password: getDemoPassword("DEMO_STUDENT_PASSWORD"),
    role: "student",
  },
  {
    name: "Amina Deng",
    email: "amina.student@uniportal.demo",
    password: getDemoPassword("DEMO_STUDENT_PASSWORD"),
    role: "student",
  },
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
  const computing = await Faculty.findOneAndUpdate(
    { code: "FOC" },
    {
      name: "Faculty of Computing",
      code: "FOC",
      description: "Computing, software, and information systems.",
      isActive: true,
    },
    { new: true, upsert: true, runValidators: true },
  );

  const business = await Faculty.findOneAndUpdate(
    { code: "FOB" },
    {
      name: "Faculty of Business",
      code: "FOB",
      description: "Business, management, accounting, and administration.",
      isActive: true,
    },
    { new: true, upsert: true, runValidators: true },
  );

  const computerScience = await Department.findOneAndUpdate(
    { code: "CS" },
    {
      name: "Department of Computer Science",
      code: "CS",
      faculty: computing._id,
      description: "Software engineering, systems, and computing foundations.",
      isActive: true,
    },
    { new: true, upsert: true, runValidators: true },
  );

  const informationTechnology = await Department.findOneAndUpdate(
    { code: "IT" },
    {
      name: "Department of Information Technology",
      code: "IT",
      faculty: computing._id,
      description: "Networking, IT operations, and applied systems.",
      isActive: true,
    },
    { new: true, upsert: true, runValidators: true },
  );

  const accounting = await Department.findOneAndUpdate(
    { code: "ACC" },
    {
      name: "Department of Accounting",
      code: "ACC",
      faculty: business._id,
      description: "Accounting, audit, and financial reporting.",
      isActive: true,
    },
    { new: true, upsert: true, runValidators: true },
  );

  const computerScienceProgram = await Program.findOneAndUpdate(
    { code: "BSC-CS", department: computerScience._id },
    {
      name: "BSc Computer Science",
      code: "BSC-CS",
      faculty: computing._id,
      department: computerScience._id,
      isActive: true,
    },
    { new: true, upsert: true, runValidators: true },
  );

  const informationTechnologyProgram = await Program.findOneAndUpdate(
    { code: "BSC-IT", department: informationTechnology._id },
    {
      name: "BSc Information Technology",
      code: "BSC-IT",
      faculty: computing._id,
      department: informationTechnology._id,
      isActive: true,
    },
    { new: true, upsert: true, runValidators: true },
  );

  const accountingProgram = await Program.findOneAndUpdate(
    { code: "BBA-ACC", department: accounting._id },
    {
      name: "BBA Accounting",
      code: "BBA-ACC",
      faculty: business._id,
      department: accounting._id,
      isActive: true,
    },
    { new: true, upsert: true, runValidators: true },
  );

  return {
    faculties: { computing, business },
    departments: { computerScience, informationTechnology, accounting },
    programs: {
      computerScienceProgram,
      informationTechnologyProgram,
      accountingProgram,
    },
  };
};

const upsertCourses = async ({ faculties, departments, programs }) => {
  const courseSeed = [
    {
      code: "CSC101",
      title: "Introduction to Computer Science",
      creditHours: 3,
      semester: 1,
      level: 1,
      department: departments.computerScience.name,
      program: programs.computerScienceProgram.name,
      facultyRef: faculties.computing._id,
      departmentRef: departments.computerScience._id,
      programRef: programs.computerScienceProgram._id,
    },
    {
      code: "CSC102",
      title: "Programming Fundamentals",
      creditHours: 3,
      semester: 1,
      level: 1,
      department: departments.computerScience.name,
      program: programs.computerScienceProgram.name,
      facultyRef: faculties.computing._id,
      departmentRef: departments.computerScience._id,
      programRef: programs.computerScienceProgram._id,
    },
    {
      code: "IT101",
      title: "Information Technology Essentials",
      creditHours: 3,
      semester: 1,
      level: 1,
      department: departments.informationTechnology.name,
      program: programs.informationTechnologyProgram.name,
      facultyRef: faculties.computing._id,
      departmentRef: departments.informationTechnology._id,
      programRef: programs.informationTechnologyProgram._id,
    },
    {
      code: "ACC101",
      title: "Principles of Accounting",
      creditHours: 3,
      semester: 1,
      level: 1,
      department: departments.accounting.name,
      program: programs.accountingProgram.name,
      facultyRef: faculties.business._id,
      departmentRef: departments.accounting._id,
      programRef: programs.accountingProgram._id,
    },
  ];

  const courses = {};

  for (const item of courseSeed) {
    courses[item.code] = await Course.findOneAndUpdate(
      { code: item.code },
      { ...item, isActive: true },
      { new: true, upsert: true, runValidators: true },
    );
  }

  return courses;
};

const upsertStudentProfile = async (student, profile) =>
  StudentProfile.findOneAndUpdate(
    { user: student._id },
    { ...profile, user: student._id, academicVerified: true },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

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
  const decisionAuditLog =
    status === "approved"
      ? [
          {
            decidedBy: registrar._id,
            decidedAt: new Date(),
            previousStatus: "pending",
            newStatus: "approved",
            reason: "Demo approved enrollment.",
          },
        ]
      : [];

  return Enrollment.findOneAndUpdate(
    { student: student._id, academicYear, semester },
    {
      student: student._id,
      academicYear,
      semester,
      courses: courses.map((course) => course._id),
      totalCredits,
      status,
      decisionAuditLog,
      rejectionReason: undefined,
      decisionReasonType: undefined,
    },
    { new: true, upsert: true, runValidators: true },
  );
};

const upsertAcademicRecord = async (enrollment, courses) => {
  const recordCourses = courses.map((course, index) => ({
    course: course._id,
    code: course.code,
    title: course.title,
    creditHours: course.creditHours,
    grade: index === 0 ? "A" : "B+",
    gradePoint: index === 0 ? 4 : 3.5,
    status: "passed",
  }));
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

const seedDemo = async () => {
  await mongoose.connect(DB);

  const accounts = {};
  for (const account of demoAccounts) {
    accounts[account.email] = await ensureUser(account);
  }

  const structure = await upsertAcademicStructure();
  const courses = await upsertCourses(structure);
  const academicYear = "2026/2027";
  const semester = 1;

  await AcademicSession.findOneAndUpdate(
    { academicYear, semester },
    {
      academicYear,
      semester,
      enrollmentStatus: "open",
      registrationOpen: true,
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-12-15"),
      isActive: true,
      notes: "Demo academic session for institutional presentation.",
    },
    { new: true, upsert: true, runValidators: true },
  );

  const john = accounts["john.student@uniportal.demo"];
  const amina = accounts["amina.student@uniportal.demo"];
  const registrar = accounts["registrar@uniportal.demo"];

  await upsertStudentProfile(john, {
    studentId: "UP-2026-0001",
    registrationNumber: "REG-2026-CS-001",
    faculty: "Faculty of Computing",
    department: "Department of Computer Science",
    program: "BSc Computer Science",
    level: 1,
    yearOfStudy: 1,
    intakeYear: 2026,
    phone: "+211900000001",
    guardianName: "Mary Garang",
    guardianPhone: "+211900000101",
  });

  await upsertStudentProfile(amina, {
    studentId: "UP-2026-0002",
    registrationNumber: "REG-2026-IT-002",
    faculty: "Faculty of Computing",
    department: "Department of Information Technology",
    program: "BSc Information Technology",
    level: 1,
    yearOfStudy: 1,
    intakeYear: 2026,
    phone: "+211900000002",
    guardianName: "Deng Arop",
    guardianPhone: "+211900000102",
  });

  const approvedEnrollment = await upsertEnrollment({
    student: john,
    courses: [courses.CSC101, courses.CSC102],
    status: "approved",
    registrar,
    academicYear,
    semester,
  });

  await upsertEnrollment({
    student: amina,
    courses: [courses.IT101],
    status: "pending",
    registrar,
    academicYear,
    semester,
  });

  await upsertAcademicRecord(approvedEnrollment, [courses.CSC101, courses.CSC102]);

  await mongoose.disconnect();

  console.log("UniPortal demo seed completed successfully.");
  console.log("\nDemo accounts:");
  for (const account of demoAccounts) {
    console.log(`${account.role}: ${account.email} / ${account.password}`);
  }
  console.log("\nOpen enrollment session: 2026/2027 Semester 1");
};

seedDemo().catch(async (error) => {
  console.error("UniPortal demo seed failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
