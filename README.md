# Study Schedule Optimizer for Working Students

A **NestJS-based application** designed to help working students optimize their study time by creating personalized schedules based on energy patterns, assignment deadlines, and work commitments.

---

## ✨ Features

- **🧠 Smart Scheduling Algorithm** – Uses genetic algorithms to create optimized study blocks.
- **⚡ Energy Pattern Recognition** – Learns and adapts to your daily productivity levels.
- **🛠️ Conflict Resolution** – Automatically avoids overlaps with work and class commitments.
- **📅 Priority-Based Scheduling** – Focuses on high-priority tasks and upcoming deadlines.
- **🎯 Multiple Optimization Strategies** – Choose between:
  - `energy_based`
  - `deadline_priority`
  - `balanced`

---

## 🛠 Tech Stack

| Layer          | Tech                                       |
| -------------- | ------------------------------------------ |
| **Backend**    | [NestJS](https://nestjs.com/) + TypeScript |
| **Database**   | MongoDB (via Mongoose)                     |
| **Algorithms** | Genetic Algorithm Implementation           |
| **Frontend**   | React-ready (Sample will be Provided)      |

---

## 🚀 Project Architecture

study-schedule-optimizer/
├── src/
│ ├── app.module.ts
│ ├── main.ts
│ ├── seed-cli.ts # CLI tool for database seeding
│ ├── data-seed.service.ts # Database seeding service
│ ├── seed.module.ts # Module for database seeding
│ ├── user/ # User management
│ ├── activity/ # Activity management
│ ├── schedule/ # Schedule management
│ └── optimizer/ # Schedule optimization
│ ├── optimizer.module.ts
│ ├── optimizer.service.ts
│ └── algorithms/
│ ├── genetic-algorithm.ts
│ └── energy-pattern-analyzer.ts
├── test/
├── .env
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md

## 🚀 Getting Started

### 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- `npm` or `yarn`

### 🔧 Installation

```bash
git clone https://github.com/marufh1/study-schedule-optimizer.git
cd study-schedule-optimizer
npm install
```
