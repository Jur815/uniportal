const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");

const User = require("../models/User");

dotenv.config({ path: path.join(__dirname, "..", "..", "config.env") });
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

if (!process.env.DATABASE) {
  console.error("Missing required environment variable: DATABASE");
  process.exit(1);
}

if (
  process.env.DATABASE.includes("<PASSWORD>") &&
  !process.env.DATABASE_PASSWORD
) {
  console.error("Missing required environment variable: DATABASE_PASSWORD");
  process.exit(1);
}

const DB = process.env.DATABASE.includes("<PASSWORD>")
  ? process.env.DATABASE.replace(
      "<PASSWORD>",
      encodeURIComponent(process.env.DATABASE_PASSWORD),
    )
  : process.env.DATABASE;
const DEMO_PASSWORD =
  process.env.DEMO_SHARED_PASSWORD || process.env.DEMO_PASSWORD || "UniPortal123";

const assertDemoDatabaseIsAuthorized = () => {
  const target = new URL(DB);
  const databaseName = target.pathname.replace(/^\//, "");
  const confirmation = `RESET-PASSWORDS:${target.hostname}/${databaseName}`;
  const localHosts = new Set(["127.0.0.1", "localhost", "::1"]);
  const localDemoDatabase =
    localHosts.has(target.hostname) && databaseName === "uniportal";

  if (
    databaseName !== "uniportal" ||
    (!localDemoDatabase &&
      process.env.CONFIRM_DEMO_PASSWORD_RESET !== confirmation)
  ) {
    throw new Error(
      `Refusing password reset. Set CONFIRM_DEMO_PASSWORD_RESET=${confirmation}.`,
    );
  }
};

const resetDemoPasswords = async () => {
  assertDemoDatabaseIsAuthorized();
  await mongoose.connect(DB);

  const users = await User.find({
    email: { $regex: /@uniportal\.demo$/i },
  }).sort({ role: 1, email: 1 });

  for (const user of users) {
    user.password = DEMO_PASSWORD;
    user.status = "active";
    await user.save();
  }

  const verified = [];
  for (const user of users) {
    const stored = await User.findById(user._id).select("+password");
    const passwordMatches = await stored.correctPassword(
      DEMO_PASSWORD,
      stored.password,
    );
    if (!passwordMatches || !stored.password.startsWith("$2")) {
      throw new Error(`Password verification failed for ${stored.email}.`);
    }
    verified.push({
      name: stored.name,
      email: stored.email,
      role: stored.role,
    });
  }

  await mongoose.disconnect();
  console.log(
    JSON.stringify(
      {
        status: "success",
        updatedUsers: verified.length,
        passwordHashVerified: true,
        accounts: verified,
      },
      null,
      2,
    ),
  );
};

resetDemoPasswords().catch(async (error) => {
  console.error("UniPortal demo password reset failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
