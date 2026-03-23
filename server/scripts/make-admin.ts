import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";
if (!MONGO_URI) {
  console.error("❌  MONGO_URI not set in .env");
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error("Usage: npx tsx scripts/make-admin.ts <email>");
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected to MongoDB");

  const result = await mongoose.connection
    .collection("users")
    .updateOne({ email }, { $set: { role: "admin" } });

  if (result.matchedCount === 0) {
    console.error(`❌  No user found with email: ${email}`);
  } else {
    console.log(`✅  User "${email}" is now an admin!`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
