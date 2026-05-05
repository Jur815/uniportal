const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const app = require("./app");

// Load local env files without overriding deployed environment variables.
dotenv.config({ path: path.join(__dirname, "..", "config.env") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const requiredEnv = ["DATABASE", "JWT_SECRET", "JWT_EXPIRES_IN"];
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

mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => {
    console.error("DB connection error:", err.message);
    process.exit(1);
  });

// mongoose
//   .connect(process.env.DATABASE_LOCAL)
//   .then(() => console.log("DB connected successfully"))
//   .catch((err) => console.log("DB error:", err));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
