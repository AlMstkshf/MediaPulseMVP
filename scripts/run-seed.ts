import { seedDatabase } from "../server/seed";

async function main() {
  try {
    console.log("Running database seeding script...");
    await seedDatabase();
    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error while seeding database:", error);
    process.exit(1);
  }
  process.exit(0);
}

main();