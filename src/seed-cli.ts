import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DataSeedService } from "./data-seed.service";

/**
 * Simple CLI tool for database seeding
 * Run with: npx ts-node src/seed-cli.ts [options]
 */
async function bootstrap() {
  const logger = new Logger("SeedCLI");

  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const config: any = {};

    // Help option
    if (args.includes("--help") || args.includes("-h")) {
      console.log(`
Study Schedule Optimizer - Database Seeder

Usage: npx ts-node src/seed-cli.ts [options]

Options:
  --users=N         Number of users to create (default: 5)
  --weeks=N         Number of weeks of data to generate (default: 8)
  --activities=N    Activities per day (default: 4)
  --keep            Don't clear existing data before seeding
  --help, -h        Show this help message
      `);
      process.exit(0);
    }

    // Parse other arguments
    args.forEach((arg) => {
      if (arg.startsWith("--users=")) {
        config.userCount = parseInt(arg.split("=")[1], 10);
      } else if (arg.startsWith("--weeks=")) {
        config.weeksOfData = parseInt(arg.split("=")[1], 10);
      } else if (arg.startsWith("--activities=")) {
        config.activitiesPerDay = parseInt(arg.split("=")[1], 10);
      } else if (arg === "--keep") {
        config.clearExistingData = false;
      }
    });

    logger.log("Starting database seed with config: " + JSON.stringify(config));

    // Create NestJS application context (no HTTP server)
    const app = await NestFactory.createApplicationContext(AppModule);

    // Get the seed service
    const seedService = app.get(DataSeedService);

    // Run the seeder
    await seedService.seedDatabase();

    // Close the application when done
    await app.close();

    logger.log("Database seeding completed successfully!");
  } catch (error) {
    logger.error("Error seeding database:", error);
    process.exit(1);
  }
}

bootstrap();
