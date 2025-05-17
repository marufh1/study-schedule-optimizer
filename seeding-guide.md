# Study Schedule Optimizer - Data Seeding Guide

This guide explains how to populate your MongoDB database with realistic sample data for the Study Schedule Optimizer.

## Prerequisites

- Node.js and npm installed
- MongoDB running (locally or via MongoDB Atlas)
- Project dependencies installed

## Installation

1. Make sure you have Faker.js installed for generating realistic data:

```bash
npm install @faker-js/faker --save-dev
```

2. Add the seed files to your project:

   - `data-seed.service.ts`
   - `seed.module.ts`
   - `seed-cli.ts`

3. Update your app.module.ts to include the SeedModule:

```typescript
import { SeedModule } from "./seed.module";

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI),
    UserModule,
    ActivityModule,
    ScheduleModule,
    OptimizerModule,
    SeedModule, // Add this line
  ],
})
export class AppModule {}
```

## Seeding Your Database

### Option 1: Using the API

Send a request to the seed endpoint:

```bash
# Using curl with default settings
curl -X POST http://localhost:3000/api/seed

# Using curl with custom settings
curl -X POST http://localhost:3000/api/seed \
  -H "Content-Type: application/json" \
  -d '{
    "userCount": 10,
    "weeksOfData": 12,
    "activitiesPerDay": 5,
    "clearExistingData": true
  }'

# Using GET with query parameters
curl "http://localhost:3000/api/seed?users=5&weeks=8&activities=4"
```

### Option 2: Using the Command Line Tool

For direct seeding without starting the server:

```bash
# Basic usage (default settings)
npx ts-node src/seed-cli.ts

# With custom settings
npx ts-node src/seed-cli.ts --users=10 --weeks=12 --activities=5

# Keep existing data (don't clear database)
npx ts-node src/seed-cli.ts --keep

# Show help
npx ts-node src/seed-cli.ts --help
```

## Configuration Options

| Parameter         | Description                                   | Default |
| ----------------- | --------------------------------------------- | ------- |
| userCount         | Number of users to create                     | 5       |
| weeksOfData       | Number of weeks of data to generate           | 8       |
| activitiesPerDay  | Average number of study activities per day    | 4       |
| clearExistingData | Whether to clear existing data before seeding | true    |

## Generated Data

The seeding process creates:

### 1. Users with Energy Patterns

- Realistic user profiles with names and email addresses
- Energy patterns for each day of the week
- Different patterns for weekdays vs weekends

### 2. Work Activities

- 9-5 work schedule on weekdays
- Variety of work titles and descriptions

### 3. Class Activities

- 2-3 evening classes per week
- Different subjects with realistic scheduling

### 4. Study Activities

- Mix of study sessions and assignments
- Varying complexity and priority levels
- Some with fixed times, others for the optimizer to schedule
- Realistic deadlines for assignments

### 5. Weekly Schedules

- One schedule per week
- Links to all relevant activities

## Examples

### Energy Pattern Data

The energy patterns represent productivity levels (1-10) for each hour of the day:

```javascript
energyPatterns: [
  {
    dayOfWeek: 1, // Monday
    hourlyEnergy: [2, 1, 1, 1, 1, 2, 3, 5, 7, 9, 8, 7, 6, 5, 5, 6, 7, 7, 6, 5, 4, 3, 3, 2],
  },
  // Other days...
];
```

### Sample Activities

Work activity:

```javascript
{
  title: "Work - Acme Corporation",
  description: "Regular work hours for project development",
  type: "work",
  startTime: "2023-05-15T09:00:00.000Z",
  endTime: "2023-05-15T17:00:00.000Z",
  complexity: "moderate",
  priority: "high",
  isCompleted: false
}
```

Study activity:

```javascript
{
  title: "Database Reading",
  description: "Study task for Database Systems",
  type: "study",
  startTime: "2023-05-15T19:00:00.000Z",
  endTime: "2023-05-15T21:00:00.000Z",
  complexity: "moderate",
  priority: "medium",
  isCompleted: false
}
```

Assignment:

```javascript
{
  title: "Machine Learning Assignment - Project Work",
  description: "Study task for Machine Learning",
  type: "assignment",
  startTime: "2023-05-16T18:00:00.000Z",
  endTime: "2023-05-16T20:00:00.000Z",
  complexity: "complex",
  priority: "high",
  isCompleted: false,
  deadline: "2023-05-28T23:59:59.999Z"
}
```

## Troubleshooting

If you encounter issues:

1. Check that MongoDB is running and accessible
2. Verify your MongoDB connection string in `.env`
3. Make sure all required modules are imported
4. Check console for detailed error messages

## Extending the Seeder

To add more types of activities or customize the generation:

1. Modify the generation methods in `data-seed.service.ts`
2. Add new helper methods for specific activity types
3. Update the configuration options if needed

For more realistic data, consider enhancing:

- Work patterns (part-time, full-time)
- Class schedules (morning, afternoon, evening)
- Study patterns based on different student profiles
