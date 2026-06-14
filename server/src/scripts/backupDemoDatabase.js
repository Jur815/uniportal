const dotenv = require("dotenv");
const fs = require("fs/promises");
const mongoose = require("mongoose");
const path = require("path");
const { EJSON } = require("bson");

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

const target = new URL(DB);
const databaseName = target.pathname.replace(/^\//, "");
if (databaseName !== "uniportal") {
  console.error("Refusing to export any database other than uniportal.");
  process.exit(1);
}

const timestamp = new Date()
  .toISOString()
  .replace(/\.\d{3}Z$/, "Z")
  .replaceAll(":", "-");
const backupName = `uniportal-demo-backup-${timestamp}`;
const backupRoot = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "outputs",
  "backups",
  backupName,
);

const backupDatabase = async () => {
  await mongoose.connect(DB);
  await fs.mkdir(backupRoot, { recursive: true });

  const collections = await mongoose.connection.db
    .listCollections({}, { nameOnly: true })
    .toArray();
  const exported = [];

  for (const { name } of collections.sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    const documents = await mongoose.connection.db
      .collection(name)
      .find({})
      .toArray();
    const filename = `${name}.json`;
    await fs.writeFile(
      path.join(backupRoot, filename),
      `${EJSON.stringify(documents, { relaxed: false, indent: 2 })}\n`,
      "utf8",
    );
    exported.push({ collection: name, documents: documents.length, filename });
  }

  const manifest = {
    backupName,
    createdAt: new Date().toISOString(),
    source: {
      host: target.hostname,
      database: databaseName,
    },
    format: "MongoDB Extended JSON v2 (canonical)",
    collections: exported,
    totalDocuments: exported.reduce(
      (total, item) => total + item.documents,
      0,
    ),
  };
  await fs.writeFile(
    path.join(backupRoot, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  await mongoose.disconnect();
  console.log(JSON.stringify({ backupRoot, ...manifest }, null, 2));
};

backupDatabase().catch(async (error) => {
  console.error("UniPortal demo backup failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
