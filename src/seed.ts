// Create a file: src/seed.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DataSeedService } from "./data-seed.service";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(DataSeedService);
  await seedService.seedDatabase();
  await app.close();
}
bootstrap();
