# Study Schedule Optimizer for Working Students

A NestJS-based application designed to help working students optimize their study time by creating personalized schedules based on energy patterns, assignment deadlines, and work commitments.

## Features

- **Smart Scheduling Algorithm**: Uses genetic algorithms to create optimized study blocks
- **Energy Pattern Recognition**: Learns your productivity patterns throughout the day
- **Conflict Resolution**: Automatically works around fixed commitments like work and classes
- **Priority-based Scheduling**: Focuses on high-priority tasks and upcoming deadlines
- **Multiple Optimization Strategies**: Choose between energy-based, deadline-priority, or balanced approaches

## Tech Stack

- **Backend**: NestJS with TypeScript
- **Database**: MongoDB with Mongoose
- **Algorithms**: Genetic algorithm implementation for schedule optimization
- **Frontend**: Integration-ready with React components (sample provided)

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (local instance or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/study-schedule-optimizer.git
   cd study-schedule-optimizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost/study-scheduler
   PORT=3000
   ```

4. Add the Seed Module to your app.module.ts:
   ```typescript
   import { SeedModule } from './seed.module';
   
   @Module({
     imports: [
       MongooseModule.forRoot(process.env.MONGODB_URI),
       UserModule,
       ActivityModule,
       ScheduleModule,
       OptimizerModule,
       SeedModule,
     ],
   })
   export class AppModule {}
   ```

5. Start the application:
   ```bash
   npm run start:dev
   ```

## Populating Your Database

### Option 1: Using the API

Send a POST request to the seed endpoint with your desired configuration:

```bash
curl -X POST http://localhost:3000/api/seed \
  -H "Content-Type: application/json" \
  -d '{
    "userCount": 2,
    "weeksOfData": 4,
    "activitiesPerDay": 3,
    "clearExistingData": true
  }'
```

### Option 2: Using the CLI Tool

The application includes a command-line tool for seeding the database:

```bash
# Basic usage (uses default settings)
npx ts-node src/seed-cli.ts

# Generate data for 3 users
npx ts-node src/seed-cli.ts --users=3

# Generate 8 weeks of data
npx ts-node src/seed-cli.ts --weeks=8

# More activities per day
npx ts-node src/seed-cli.ts --activities=5

# Keep existing data
npx ts-node src/seed-cli.ts --keep-existing

# Show all options
npx ts-node src/seed-cli.ts --help
```

### Data Seeding Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| userCount | Number of users to create | 1 |
| weeksOfData | Number of weeks of data to generate | 4 |
| activitiesPerDay | Average number of study activities per day | 3 |
| startDate | Starting date for generated data | Current date |
| clearExistingData | Whether to clear existing data before seeding | true |

## API Endpoints

### User Management

- `POST /users` - Create a new user
- `GET /users` - Get all users
- `GET /users/:id` - Get a specific user
- `PUT /users/:id` - Update a user
- `PUT /users/:id/energy-patterns` - Update a user's energy patterns
- `DELETE /users/:id` - Delete a user

### Activity Management

- `POST /activities` - Create a new activity
- `GET /activities` - Get all activities
- `GET /activities/user/:userId` - Get activities for a specific user
- `GET /activities/date-range?userId=&startDate=&endDate=` - Get activities within a date range
- `GET /activities/:id` - Get a specific activity
- `PUT /activities/:id` - Update an activity
- `DELETE /activities/:id` - Delete an activity

### Schedule Management

- `POST /schedules` - Create a new schedule
- `GET /schedules` - Get all schedules
- `GET /schedules/user/:userId` - Get schedules for a specific user
- `GET /schedules/:id` - Get a specific schedule
- `PUT /schedules/:id` - Update a schedule
- `DELETE /schedules/:id` - Delete a schedule
- `PUT /schedules/:id/activities/:activityId` - Add an activity to a schedule
- `DELETE /schedules/:id/activities/:activityId` - Remove an activity from a schedule
- `POST /schedules/:id/optimize` - Optimize a schedule

## Schedule Optimization

The schedule optimization endpoint accepts the following parameters:

```json
{
  "strategy": "energy_based", // "energy_based", "deadline_priority", or "balanced"
  "prioritizeActivities": ["activityId1", "activityId2"] // Optional - activities to prioritize
}
```

## Data Models

### User

```typescript
{
  name: string;
  email: string;
  energyPatterns: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    hourlyEnergy: number[]; // 0-23 hours, energy level from 1-10
  }[];
}
```

### Activity

```typescript
{
  title: string;
  description: string;
  type: "work" | "class" | "study" | "assignment" | "other";
  startTime: Date;
  endTime: Date;
  priority: "low" | "medium" | "high";
  complexity: "easy" | "moderate" | "complex";
  isRecurring: boolean;
  recurrencePattern: string; // e.g., 'WEEKLY' or 'DAILY'
  userId: ObjectId;
  isCompleted: boolean;
  deadline: Date;
}
```

### Schedule

```typescript
{
  name: string;
  startDate: Date;
  endDate: Date;
  userId: ObjectId;
  activities: ObjectId[];
  optimizedBlocks: {
    date: Date;
    blocks: {
      activityId: ObjectId;
      startTime: Date;
      endTime: Date;
      type: string;
      title: string;
    }[];
  }[];
}
```

## Genetic Algorithm Details

The schedule optimization uses a genetic algorithm with the following components:

### Chromosome Representation
Each chromosome represents a complete schedule with study blocks assigned to specific time slots.

### Fitness Function
The fitness of a schedule is calculated based on:
- Energy level during study blocks (40%)
- Alignment of complex tasks with high-energy periods (25%)
- Even distribution of study sessions (15%)
- Proximity to deadlines (20%)

### Genetic Operators
- **Selection**: Tournament selection (k=3)
- **Crossover**: Uniform crossover with conflict resolution
- **Mutation**: Time shifting, duration adjustment, and block swapping

### Evolution Process
- Population size: 50 individuals
- Mutation rate: 10%
- Crossover rate: 80%
- Elitism: Top 5 individuals preserved
- Maximum generations: 100

## Frontend Integration

While this project focuses on the backend implementation, a sample React component (`ScheduleCalendar.jsx`) is provided as a starting point for frontend integration. The component demonstrates:

- Fetching and displaying schedule data
- Selecting optimization strategies
- Visualizing study blocks in a weekly calendar view
- Color-coding different activity types

To use the component, install it in your React application and include the necessary dependencies:

```bash
npm install axios date-fns
```

## Development

### Project Structure

```
study-schedule-optimizer/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── seed-cli.ts           # CLI tool for database seeding
│   ├── data-seed.service.ts  # Database seeding service
│   ├── seed.module.ts        # Module for database seeding
│   ├── user/                 # User management
│   ├── activity/             # Activity management
│   ├── schedule/             # Schedule management
│   └── optimizer/            # Schedule optimization
│       ├── optimizer.module.ts
│       ├── optimizer.service.ts
│       └── algorithms/
│           ├── genetic-algorithm.ts
│           └── energy-pattern-analyzer.ts
├── test/
├── .env
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Future Enhancements

- User authentication and authorization
- Machine learning component to predict optimal study times
- Mobile app integration
- Calendar synchronization (Google Calendar, Outlook)
- Notifications and reminders
- Social features for group study planning

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
