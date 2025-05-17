# Study Schedule Optimizer - Architecture

This document outlines the architecture of the Study Schedule Optimizer, describing its components, their relationships, and the design patterns used.

## 1. Overall System Architecture

The Study Schedule Optimizer uses a modern NestJS-based architecture with MongoDB as the database:

```
┌─────────────────┐
│                 │        HTTP/REST
│  Client (React) ◄────────────────────┐
│                 │                     │
└─────────────────┘                     │
                                       ▼
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                    NestJS Application                    │
│                                                          │
│  ┌────────────┐   ┌────────────┐   ┌─────────────────┐   │
│  │            │   │            │   │                 │   │
│  │ Controllers│◄──│  Services  │◄──│  Repositories   │   │
│  │            │   │            │   │                 │   │
│  └────────────┘   └────────────┘   └────────┬────────┘   │
│                                             │            │
└─────────────────────────────────────────────┼────────────┘
                                              │
                                              ▼
                                     ┌─────────────────┐
                                     │                 │
                                     │    MongoDB      │
                                     │                 │
                                     └─────────────────┘
```

## 2. Module Structure

The system is organized into feature modules following NestJS patterns:

```
┌─────────────────┐
│                 │
│   AppModule     │
│                 │
└───┬─────┬───────┘
    │     │
┌───▼─┐ ┌─▼────┐  ┌───────┐  ┌─────────────┐
│User │ │Activ.│  │Schedu.│  │Optimizer    │
│Mod. │ │Mod.  │  │Module │  │Module       │
└─────┘ └──────┘  └───────┘  └─────────────┘
```

Each module contains related controllers, services, schemas, and DTOs.

## 3. Core Data Models

### User Model

```typescript
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: [] })
  energyPatterns: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    hourlyEnergy: number[]; // 0-23 hours, energy level from 1-10
  }[];
}
```

### Activity Model

```typescript
export class Activity {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ActivityType })
  type: ActivityType; // WORK, CLASS, STUDY, ASSIGNMENT, OTHER

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ enum: ActivityPriority, default: ActivityPriority.MEDIUM })
  priority: ActivityPriority; // LOW, MEDIUM, HIGH

  @Prop({ enum: ActivityComplexity, default: ActivityComplexity.MODERATE })
  complexity: ActivityComplexity; // EASY, MODERATE, COMPLEX

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop()
  deadline: Date;
}
```

### Schedule Model

```typescript
export class Schedule {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }] })
  activities: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: Object })
  optimizedBlocks: {
    date: Date;
    blocks: {
      activityId: mongoose.Schema.Types.ObjectId;
      startTime: Date;
      endTime: Date;
      type: string;
      title: string;
    }[];
  }[];
}
```

## 4. Optimizer Architecture

The core of the system is the optimization engine, which uses a genetic algorithm to create optimized study schedules.

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                 OptimizerService                    │
│                                                     │
│  ┌─────────────────┐       ┌─────────────────────┐  │
│  │                 │       │                     │  │
│  │ ScheduleService │◄──────┤ ActivityService     │  │
│  │                 │       │                     │  │
│  └─────────────────┘       └─────────────────────┘  │
│           ▲                          ▲              │
│           │                          │              │
│           │                          │              │
│  ┌────────┴──────────┐     ┌─────────┴────────────┐ │
│  │                   │     │                      │ │
│  │  UserService      │     │ GeneticAlgorithm     │ │
│  │                   │     │                      │ │
│  └───────────────────┘     └──────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### The Genetic Algorithm Implementation

The GeneticAlgorithm class is the heart of the optimization process:

```
┌────────────────────────────────────────────────────────┐
│                GeneticAlgorithm                        │
│                                                        │
│  ┌─────────────────────┐     ┌────────────────────┐    │
│  │ Population          │     │ Fitness Function   │    │
│  │ - initializePopulation    │ - calculateFitness │    │
│  │ - evolvePopulation  │     │ - getEnergyLevel   │    │
│  └─────────────────────┘     │ - getActivityAlign │    │
│                              │ - getTimeDistributi│    │
│  ┌─────────────────────┐     │ - getDeadlineProxi │    │
│  │ Chromosome          │     └────────────────────┘    │
│  │ - generateRandom    │                               │
│  │ - calculateTimeSlots│     ┌────────────────────┐    │
│  └─────────────────────┘     │ Genetic Operators  │    │
│                              │ - selection        │    │
│  ┌─────────────────────┐     │ - crossover        │    │
│  │ Conflict Resolution │     │ - mutation         │    │
│  │ - resolveTimeConflicts    └────────────────────┘    │
│  │ - removeTimeOverlap │                               │
│  └─────────────────────┘                               │
│                                                        │
│         optimize() ─► Daily study schedule             │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Genetic Algorithm Key Components

1. **Chromosome Representation**:

   - Each chromosome represents a complete schedule
   - Study blocks are assigned to specific time slots
   - Activities are organized by time and priority

2. **Fitness Function Components**:

   - Energy level alignment (40%)
   - Activity-complexity alignment (25%)
   - Time distribution (15%)
   - Deadline proximity (20%)

3. **Genetic Operators**:

   - Selection: Tournament selection (k=3)
   - Crossover: Uniform crossover with conflict resolution
   - Mutation: Time shifting, duration adjustment, block swapping

4. **Conflict Resolution**:
   - Detects time slot overlaps
   - Finds alternative time slots
   - Prioritizes based on activity properties

## 5. Optimization Process Flow

```
┌───────────────┐     ┌─────────────────┐     ┌───────────────────┐
│ Client Request│────►│OptimizerService │────►│ScheduleController │
└───────┬───────┘     └────────┬────────┘     └─────────┬─────────┘
        │                      │                        │
        │                      ▼                        │
        │             ┌─────────────────┐               │
        │             │ Data Collection │               │
        │             │ - User patterns │               │
        │             │ - Activities    │               │
        │             │ - Fixed blocks  │               │
        │             └────────┬────────┘               │
        │                      │                        │
        │                      ▼                        │
        │             ┌─────────────────┐               │
        │             │Genetic Algorithm│               │
        │             │ - Initialization│               │
        │             │ - Evolution     │               │
        │             │ - Selection     │               │
        │             └────────┬────────┘               │
        │                      │                        │
        │                      ▼                        │
        │             ┌─────────────────┐               │
        │             │ Schedule Update │               │
        │             └────────┬────────┘               │
        │                      │                        │
        ▼                      ▼                        ▼
┌───────────────┐     ┌─────────────────┐     ┌───────────────────┐
│ Optimized     │     │ Updated DB      │     │ Response to client │
│ Schedule      │     │ Schedule        │     │                   │
└───────────────┘     └─────────────────┘     └───────────────────┘
```

## 6. Optimization Strategies

The system supports multiple optimization strategies:

```
┌───────────────────────────────────────┐
│                                       │
│        OptimizationStrategy           │
│                                       │
└───────────────┬───────────────────────┘
                │
        ┌───────┴──────┬────────────────┐
        │              │                │
        ▼              ▼                ▼
┌───────────────┐ ┌──────────────┐ ┌──────────────┐
│ Energy-Based  │ │Deadline-Based│ │   Balanced   │
│ Strategy      │ │Strategy      │ │   Strategy   │
└───────────────┘ └──────────────┘ └──────────────┘
```

1. **Energy-Based**: Focuses on matching tasks with user's peak energy times
2. **Deadline-Based**: Prioritizes tasks with approaching deadlines
3. **Balanced**: Combines energy patterns with deadline priorities

## 7. Data Seeding Architecture

The data seeding system provides test data for development and demonstration:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│               DataSeedService                       │
│                                                     │
│  ┌────────────────────┐    ┌────────────────────┐   │
│  │                    │    │                    │   │
│  │ createUsers        │    │ createActivities   │   │
│  │ generateEnergyPatt │    │ generateWork       │   │
│  │                    │    │ generateClass      │   │
│  └────────────────────┘    │ generateStudy      │   │
│                            │                    │   │
│  ┌────────────────────┐    └────────────────────┘   │
│  │                    │                              │
│  │ createSchedules    │                              │
│  │                    │                              │
│  └────────────────────┘                              │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Access Methods:

```
┌────────────────────┐     ┌────────────────────┐
│                    │     │                    │
│ REST API Endpoint  │────►│ SeedController     │
│                    │     │                    │
└────────────────────┘     └────────┬───────────┘
                                    │
┌────────────────────┐     ┌────────▼───────────┐
│                    │     │                    │
│ Command Line Tool  │────►│ DataSeedService    │
│                    │     │                    │
└────────────────────┘     └────────────────────┘
```

## 8. Key Design Patterns

1. **Module Pattern**: NestJS modules group related functionality
2. **Dependency Injection**: Services and dependencies are injected
3. **Repository Pattern**: Data access through model repositories
4. **Strategy Pattern**: Different optimization approaches
5. **Factory Pattern**: Creating algorithm components

## 9. Scalability Considerations

- Stateless service design allows horizontal scaling
- Genetic algorithm parameters are configurable for performance
- MongoDB can be scaled through sharding and replication
- Clear separation of modules allows for easier feature additions
