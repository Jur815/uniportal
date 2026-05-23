const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");

const Department = require("../models/departmentModel");
const Faculty = require("../models/facultyModel");
const Program = require("../models/programModel");

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

const faculties = [
  {
    name: "Faculty of Computing",
    code: "FOC",
    description: "Computing, software, and information systems.",
  },
  {
    name: "Faculty of Business",
    code: "FOB",
    description: "Business, management, accounting, and administration.",
  },
];

const departments = [
  {
    name: "Department of Computer Science",
    code: "CS",
    facultyCode: "FOC",
  },
  {
    name: "Department of Information Technology",
    code: "IT",
    facultyCode: "FOC",
  },
  {
    name: "Department of Accounting",
    code: "ACC",
    facultyCode: "FOB",
  },
];

const programs = [
  {
    name: "BSc Computer Science",
    code: "BSC-CS",
    departmentCode: "CS",
    facultyCode: "FOC",
  },
  {
    name: "BSc Information Technology",
    code: "BSC-IT",
    departmentCode: "IT",
    facultyCode: "FOC",
  },
  {
    name: "BBA Accounting",
    code: "BBA-ACC",
    departmentCode: "ACC",
    facultyCode: "FOB",
  },
];

const seedAcademicSetup = async () => {
  await mongoose.connect(DB);

  const facultyByCode = {};
  for (const item of faculties) {
    const faculty = await Faculty.findOneAndUpdate(
      { code: item.code },
      item,
      { returnDocument: "after", upsert: true, runValidators: true },
    );
    facultyByCode[item.code] = faculty;
  }

  const departmentByCode = {};
  for (const item of departments) {
    const faculty = facultyByCode[item.facultyCode];
    const department = await Department.findOneAndUpdate(
      { code: item.code, faculty: faculty._id },
      {
        name: item.name,
        code: item.code,
        faculty: faculty._id,
      },
      { returnDocument: "after", upsert: true, runValidators: true },
    );
    departmentByCode[item.code] = department;
  }

  for (const item of programs) {
    const faculty = facultyByCode[item.facultyCode];
    const department = departmentByCode[item.departmentCode];
    await Program.findOneAndUpdate(
      { code: item.code, department: department._id },
      {
        name: item.name,
        code: item.code,
        faculty: faculty._id,
        department: department._id,
        isActive: true,
      },
      { returnDocument: "after", upsert: true, runValidators: true },
    );
  }

  await mongoose.disconnect();
  console.log("Academic setup seed completed successfully.");
};

seedAcademicSetup().catch(async (error) => {
  console.error("Academic setup seed failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
