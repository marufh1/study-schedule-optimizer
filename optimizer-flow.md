# Study Schedule Optimizer Flow

This document explains the operational flow of the Study Schedule Optimizer from data initialization to schedule optimization.

---

## 1. System Initialization Flow

┌─────────────┐ ┌─────────────┐ ┌───────────────────────────┐
│ Application │──────► Data Seeding │──────► Database Ready │
│ Startup │ │ Process │ │ for Usage │
└─────────────┘ └─────────────┘ └───────────────────────────┘

### 1.1 Application Startup

- NestJS application initializes
- MongoDB connection established
- Modules and services registered

### 1.2 Data Seeding Process

- Seed command triggered (API or CLI)
- User profiles with energy patterns generated
- Work, class, and study activities created
- Weekly schedules initialized

### 1.3 Database Ready for Usage

- MongoDB populated with realistic data
- System ready to handle optimization requests

---

## 2. User Activity Management Flow

┌─────────┐ ┌───────────────┐ ┌──────────────────┐
│ Create │──────► View/Update/ │──────► Activity │
│ Activity│ │Delete Activity│ │ Repository │
└─────────┘ └───────────────┘ └──────────────────┘

### 2.1 Create Activity

- User creates work, class, study or assignment activity
- System validates time slots and properties
- Activity saved to database

### 2.2 View/Update/Delete Activity

- User can view all activities or filter by type/date
- Update activity details, times, or properties
- Delete activities no longer needed

### 2.3 Activity Repository

- MongoDB stores all activity data
- Maintains relationships with users and schedules
- Provides quick retrieval for optimization

---

## 3. Schedule Optimization Flow

                                       ┌───────────────┐
                                  ┌────► Energy-Based  │
                                  │    └───────────────┘

┌──────────────┐ ┌────────────┐┐ ┌─────────────────────┐
│ Optimization │────►Optimization│├────►Deadline-Based │
│ Request │ │ Strategy ││ └────────────────────────────┘
└──────────────┘ └────────────┘┘ ┌─────────────────────┐
└────► Balanced │
└───────────────┘

       │                  │                   │
       ▼                  ▼                   ▼

┌──────────────┐ ┌────────────┐ ┌──────────────┐
│ Data Loading │───►│ Genetic │───►│ Optimized │
│ │ │ Algorithm │ │ Schedule │
└──────────────┘ └────────────┘ └──────────────┘

### 3.1 Optimization Request

- User selects a schedule to optimize
- Chooses optimization strategy
- Optionally sets priority activities

### 3.2 Optimization Strategy Selection

- **Energy-Based**: Matches tasks with user's peak energy times
- **Deadline-Based**: Prioritizes activities with approaching deadlines
- **Balanced**: Combines energy levels and deadline priorities

### 3.3 Data Loading

- User's energy patterns retrieved
- Fixed activities identified (work, classes)
- Study activities gathered for scheduling
- Available time slots calculated

### 3.4 Genetic Algorithm Execution

- **Initialization**: Creates initial population of possible schedules
- **Evaluation**: Calculates fitness based on strategy criteria
- **Selection**: Chooses best schedules as parents
- **Crossover**: Combines parent schedules to create new ones
- **Mutation**: Introduces random changes to schedules
- **Resolution**: Detects and fixes scheduling conflicts
- **Evolution**: Repeats process for multiple generations
- **Finalization**: Selects best schedule as solution

### 3.5 Optimized Schedule Generation

- Study blocks assigned to optimal time slots
- Schedule stored in database
- Returned to user interface for display

---

## 4. Feedback and Adaptation Flow

┌─────────────┐ ┌────────────────┐ ┌──────────────────────┐
│ Completion │───►│ Energy Pattern │───►│ Improved Future │
│ Status │ │ Analysis │ │ Optimization │
└─────────────┘ └────────────────┘ └──────────────────────┘

### 4.1 Completion Status

- User marks activities as completed
- System records completion time and status

### 4.2 Energy Pattern Analysis

- System analyzes completion data against energy patterns
- Refines understanding of user's productivity patterns
- Updates energy pattern profiles

### 4.3 Improved Future Optimization

- Future schedule optimizations use refined energy patterns
- Algorithm adapts to user's actual productivity trends
- Schedules become increasingly personalized over time

---

## 5. User Interaction Flow

┌───────────┐ ┌─────────────┐ ┌────────────────┐ ┌────────────┐
│ Profile │───►│ Schedule │───►│ Optimization │───►│ Daily │
│ Setup │ │ Creation │ │ Request │ │ View │
└───────────┘ └─────────────┘ └────────────────┘ └────────────┘

### 5.1 Profile Setup

- User creates account
- Provides initial preferences
- Default energy patterns established

### 5.2 Schedule Creation

- User adds work commitments
- Adds class schedule
- Creates study tasks and assignments

### 5.3 Optimization Request

- User selects week to optimize
- Chooses optimization strategy
- System processes and returns optimized schedule

### 5.4 Daily View

- User views today's optimized schedule
- Marks tasks as completed
- Adjusts schedule as needed
