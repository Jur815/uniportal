const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const app = require("./app");

// Load env reliably
dotenv.config({ path: path.join(__dirname, "..", "config.env") });

// const DB = process.env.DATABASE.replace(
//   "<PASSWORD>",
//   encodeURIComponent(process.env.DATABASE_PASSWORD),
// );

// mongoose
//   .connect(DB)
//   .then(() => console.log("DB connection successful!"))
//   .catch((err) => {
//     console.error("DB connection error:", err.message);
//     process.exit(1);
//   });

mongoose
  .connect(process.env.DATABASE_LOCAL)
  .then(() => console.log("DB connected successfully"))
  .catch((err) => console.log("DB error:", err));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
