export interface TimeSlot {
  startTime: Date;
  endTime: Date;
}

export interface StudyBlock {
  activityId: string;
  startTime: Date;
  endTime: Date;
  title: string;
  type: string;
}

export interface DailySchedule {
  date: Date;
  blocks: StudyBlock[];
}

export interface Individual {
  chromosome: StudyBlock[];
  fitness: number;
}

export class GeneticAlgorithm {
  private populationSize: number = 50;
  private mutationRate: number = 0.1;
  private crossoverRate: number = 0.8;
  private elitismCount: number = 5;
  private maxGenerations: number = 100;

  // Fixed activities (work, class, etc.)
  private fixedActivities: any[];
  // Study activities that need to be scheduled
  private studyActivities: any[];
  // Available time slots for study
  private availableTimeSlots: TimeSlot[];
  // User energy patterns
  private energyPatterns: any;
  // Date range
  private startDate: Date;
  private endDate: Date;

  constructor(
    fixedActivities: any[],
    studyActivities: any[],
    energyPatterns: any,
    startDate: Date,
    endDate: Date,
  ) {
    this.fixedActivities = fixedActivities;
    this.studyActivities = studyActivities;
    this.energyPatterns = energyPatterns;
    this.startDate = startDate;
    this.endDate = endDate;

    // Calculate available time slots
    this.availableTimeSlots = this.calculateAvailableTimeSlots();
  }

  // Generate initial population
  private initializePopulation(): Individual[] {
    const population: Individual[] = [];

    for (let i = 0; i < this.populationSize; i++) {
      // Create a random chromosome (schedule)
      const chromosome = this.generateRandomChromosome();

      // Calculate fitness
      const fitness = this.calculateFitness(chromosome);

      population.push({
        chromosome,
        fitness,
      });
    }

    return population;
  }

  // Generate a random chromosome (schedule)
  private generateRandomChromosome(): StudyBlock[] {
    const chromosome: StudyBlock[] = [];

    // Clone study activities
    const activitiesToSchedule = [...this.studyActivities];

    // Randomly assign activities to available time slots
    while (
      activitiesToSchedule.length > 0 &&
      this.availableTimeSlots.length > 0
    ) {
      // Pick a random activity
      const randomActivityIndex = Math.floor(
        Math.random() * activitiesToSchedule.length,
      );
      const activity = activitiesToSchedule[randomActivityIndex];

      // Pick a random time slot
      const randomSlotIndex = Math.floor(
        Math.random() * this.availableTimeSlots.length,
      );
      const timeSlot = this.availableTimeSlots[randomSlotIndex];

      // Calculate duration needed for this activity (in hours)
      const durationNeeded = 2; // Default 2 hours for study blocks

      // Check if the time slot is long enough
      const slotDuration =
        (timeSlot.endTime.getTime() - timeSlot.startTime.getTime()) /
        (1000 * 60 * 60);

      if (slotDuration >= durationNeeded) {
        // Create end time (start time + 2 hours)
        const endTime = new Date(
          timeSlot.startTime.getTime() + durationNeeded * 60 * 60 * 1000,
        );

        // Add to chromosome
        chromosome.push({
          activityId: activity._id.toString(),
          startTime: new Date(timeSlot.startTime),
          endTime: endTime,
          title: activity.title,
          type: activity.type,
        });

        // Update the time slot (reduce its size)
        this.availableTimeSlots[randomSlotIndex] = {
          startTime: endTime,
          endTime: timeSlot.endTime,
        };

        // Remove time slot if it became too small
        if (
          (timeSlot.endTime.getTime() - endTime.getTime()) / (1000 * 60 * 60) <
          1
        ) {
          this.availableTimeSlots.splice(randomSlotIndex, 1);
        }

        // Remove the activity from the list
        activitiesToSchedule.splice(randomActivityIndex, 1);
      } else {
        // If slot is too small, remove it
        this.availableTimeSlots.splice(randomSlotIndex, 1);
      }
    }

    return chromosome;
  }

  // Calculate available time slots
  private calculateAvailableTimeSlots(): TimeSlot[] {
    const timeSlots: TimeSlot[] = [];

    // Create day-by-day slots from start date to end date
    const currentDate = new Date(this.startDate);

    while (currentDate <= this.endDate) {
      // Initialize day as fully available (00:00 to 23:59)
      let daySlots: TimeSlot[] = [
        {
          startTime: new Date(currentDate.setHours(0, 0, 0, 0)),
          endTime: new Date(currentDate.setHours(23, 59, 59, 999)),
        },
      ];

      // Remove fixed activities from available slots
      for (const activity of this.fixedActivities) {
        const activityDate = new Date(activity.startTime);

        // Only consider activities on this day
        if (activityDate.toDateString() === currentDate.toDateString()) {
          daySlots = this.removeTimeOverlap(daySlots, {
            startTime: new Date(activity.startTime),
            endTime: new Date(activity.endTime),
          });
        }
      }

      // Add remaining slots to the list
      timeSlots.push(...daySlots);

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return timeSlots;
  }

  // Remove time overlap from available slots
  private removeTimeOverlap(slots: TimeSlot[], busy: TimeSlot): TimeSlot[] {
    const newSlots: TimeSlot[] = [];

    for (const slot of slots) {
      // Check if there's an overlap
      if (busy.startTime >= slot.endTime || busy.endTime <= slot.startTime) {
        // No overlap, keep the slot intact
        newSlots.push(slot);
      } else {
        // There's an overlap, split the slot

        // Add the part before the busy time (if exists)
        if (busy.startTime > slot.startTime) {
          newSlots.push({
            startTime: slot.startTime,
            endTime: busy.startTime,
          });
        }

        // Add the part after the busy time (if exists)
        if (busy.endTime < slot.endTime) {
          newSlots.push({
            startTime: busy.endTime,
            endTime: slot.endTime,
          });
        }
      }
    }

    return newSlots;
  }

  // Calculate fitness for a chromosome
  private calculateFitness(chromosome: StudyBlock[]): number {
    let fitness = 0;

    for (const block of chromosome) {
      // 1. Energy level fitness (higher is better)
      const energyFitness = this.getEnergyLevel(block.startTime);

      // 2. Activity-time alignment (match complex activities with high energy times)
      const alignmentFitness = this.getActivityTimeAlignment(block);

      // 3. Time distribution (prefer evenly distributed study sessions)
      const distributionFitness = this.getTimeDistributionScore(
        chromosome,
        block,
      );

      // 4. Deadline proximity (prioritize activities with closer deadlines)
      const deadlineFitness = this.getDeadlineProximityScore(block);

      // Weighted sum
      const blockFitness =
        energyFitness * 0.4 +
        alignmentFitness * 0.25 +
        distributionFitness * 0.15 +
        deadlineFitness * 0.2;

      fitness += blockFitness;
    }

    // Normalize by number of blocks
    return chromosome.length > 0 ? fitness / chromosome.length : 0;
  }

  // Get energy level for a specific time
  private getEnergyLevel(time: Date): number {
    const dayOfWeek = time.getDay(); // 0-6 (Sunday-Saturday)
    const hour = time.getHours(); // 0-23

    // Find the energy pattern for this day
    const dayPattern = this.energyPatterns.find(
      (p) => p.dayOfWeek === dayOfWeek,
    );

    if (
      dayPattern &&
      dayPattern.hourlyEnergy &&
      dayPattern.hourlyEnergy[hour] !== undefined
    ) {
      return dayPattern.hourlyEnergy[hour] / 10; // Normalize to 0-1
    }

    // Default energy level if pattern not found
    return 0.5;
  }

  // Get activity-time alignment score
  private getActivityTimeAlignment(block: StudyBlock): number {
    // Find the corresponding activity
    const activity = this.studyActivities.find(
      (a) => a._id.toString() === block.activityId,
    );

    if (!activity) return 0.5;

    const energyLevel = this.getEnergyLevel(block.startTime);
    const complexity = this.getComplexityValue(activity.complexity);

    // Higher score when high energy aligns with complex tasks
    // or when low energy aligns with simple tasks
    return 1 - Math.abs(energyLevel - complexity);
  }

  // Get complexity value (0-1)
  private getComplexityValue(complexity: string): number {
    switch (complexity) {
      case 'easy':
        return 0.25;
      case 'moderate':
        return 0.5;
      case 'complex':
        return 1.0;
      default:
        return 0.5;
    }
  }

  // Get time distribution score
  private getTimeDistributionScore(
    chromosome: StudyBlock[],
    block: StudyBlock,
  ): number {
    // Find all blocks for the same activity
    const activityBlocks = chromosome.filter(
      (b) => b.activityId === block.activityId,
    );

    if (activityBlocks.length <= 1) return 1.0; // Only one block, perfect distribution

    // Calculate time gaps between consecutive sessions
    let totalGapVariance = 0;
    let idealGap = 0;

    // Sort blocks by start time
    const sortedBlocks = [...activityBlocks].sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );

    // Calculate ideal gap (total time span / number of blocks)
    const totalTimeSpan =
      sortedBlocks[sortedBlocks.length - 1].startTime.getTime() -
      sortedBlocks[0].startTime.getTime();
    idealGap = totalTimeSpan / (sortedBlocks.length - 1);

    // Calculate variance from ideal gap
    for (let i = 1; i < sortedBlocks.length; i++) {
      const actualGap =
        sortedBlocks[i].startTime.getTime() -
        sortedBlocks[i - 1].startTime.getTime();
      const gapDifference = Math.abs(actualGap - idealGap);
      totalGapVariance += gapDifference;
    }

    // Normalize variance (lower is better)
    const maxPossibleVariance = totalTimeSpan;
    const normalizedVariance = totalGapVariance / maxPossibleVariance;

    // Convert to score (higher is better)
    return 1 - Math.min(normalizedVariance, 1);
  }

  // Get deadline proximity score
  private getDeadlineProximityScore(block: StudyBlock): number {
    // Find the corresponding activity
    const activity = this.studyActivities.find(
      (a) => a._id.toString() === block.activityId,
    );

    if (!activity || !activity.deadline) return 0.5;

    // Calculate days until deadline
    const daysUntilDeadline =
      (activity.deadline.getTime() - block.startTime.getTime()) /
      (1000 * 60 * 60 * 24);

    // If deadline has passed, return low score
    if (daysUntilDeadline < 0) return 0.1;

    // Map days to score (closer deadline = higher score)
    // 0 days = 1.0, 7+ days = 0.2
    return Math.max(0.2, Math.min(1.0, 1 - (daysUntilDeadline / 7) * 0.8));
  }

  // Selection: Tournament selection
  private selection(population: Individual[]): Individual {
    // Select k individuals randomly
    const k = 3;
    const selected: Individual[] = [];

    for (let i = 0; i < k; i++) {
      const randomIndex = Math.floor(Math.random() * population.length);
      selected.push(population[randomIndex]);
    }

    // Return the fittest individual
    return selected.reduce((fittest, current) =>
      current.fitness > fittest.fitness ? current : fittest,
    );
  }

  // Crossover: Uniform crossover
  private crossover(parent1: Individual, parent2: Individual): Individual[] {
    if (Math.random() > this.crossoverRate) {
      // No crossover, return copies of parents
      return [
        { chromosome: [...parent1.chromosome], fitness: 0 },
        { chromosome: [...parent2.chromosome], fitness: 0 },
      ];
    }

    // Create child chromosomes
    const child1Chromosome: StudyBlock[] = [];
    const child2Chromosome: StudyBlock[] = [];

    // Create activity ID sets for tracking
    const parent1ActivityIds = new Set(
      parent1.chromosome.map((block) => block.activityId),
    );
    const parent2ActivityIds = new Set(
      parent2.chromosome.map((block) => block.activityId),
    );
    const allActivityIds = new Set([
      ...parent1ActivityIds,
      ...parent2ActivityIds,
    ]);

    // For each activity that needs scheduling
    for (const activityId of allActivityIds) {
      // Get blocks from each parent for this activity
      const parent1Blocks = parent1.chromosome.filter(
        (block) => block.activityId === activityId,
      );
      const parent2Blocks = parent2.chromosome.filter(
        (block) => block.activityId === activityId,
      );

      // If only one parent has this activity, add to both children
      if (parent1Blocks.length === 0) {
        child1Chromosome.push(...parent2Blocks);
        child2Chromosome.push(...parent2Blocks);
        continue;
      }

      if (parent2Blocks.length === 0) {
        child1Chromosome.push(...parent1Blocks);
        child2Chromosome.push(...parent1Blocks);
        continue;
      }

      // Both parents have this activity, perform crossover
      // Randomly select blocks from each parent
      for (
        let i = 0;
        i < Math.max(parent1Blocks.length, parent2Blocks.length);
        i++
      ) {
        if (Math.random() < 0.5) {
          // Add from parent 1 to child 1, parent 2 to child 2
          if (i < parent1Blocks.length) child1Chromosome.push(parent1Blocks[i]);
          if (i < parent2Blocks.length) child2Chromosome.push(parent2Blocks[i]);
        } else {
          // Add from parent 2 to child 1, parent 1 to child 2
          if (i < parent2Blocks.length) child1Chromosome.push(parent2Blocks[i]);
          if (i < parent1Blocks.length) child2Chromosome.push(parent1Blocks[i]);
        }
      }
    }

    // Check for time conflicts and resolve them
    const child1Fixed = this.resolveTimeConflicts(child1Chromosome);
    const child2Fixed = this.resolveTimeConflicts(child2Chromosome);

    // Calculate fitness
    const child1Fitness = this.calculateFitness(child1Fixed);
    const child2Fitness = this.calculateFitness(child2Fixed);

    return [
      { chromosome: child1Fixed, fitness: child1Fitness },
      { chromosome: child2Fixed, fitness: child2Fitness },
    ];
  }

  // Resolve time conflicts in a chromosome
  private resolveTimeConflicts(chromosome: StudyBlock[]): StudyBlock[] {
    // Sort blocks by start time
    const sortedBlocks = [...chromosome].sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );
    const resolvedBlocks: StudyBlock[] = [];

    for (const block of sortedBlocks) {
      // Check if this block conflicts with any already resolved block
      let hasConflict = false;

      for (const resolvedBlock of resolvedBlocks) {
        // Check for time overlap
        if (
          !(
            block.endTime <= resolvedBlock.startTime ||
            block.startTime >= resolvedBlock.endTime
          )
        ) {
          hasConflict = true;
          break;
        }
      }

      if (!hasConflict) {
        // No conflict, add to resolved list
        resolvedBlocks.push(block);
      } else {
        // Has conflict, try to find a new time slot

        // Find available time slots for this day
        const blockDate = new Date(block.startTime);
        blockDate.setHours(0, 0, 0, 0);

        const dayEnd = new Date(blockDate);
        dayEnd.setHours(23, 59, 59, 999);

        // Create initial day slot
        let availableSlots: TimeSlot[] = [
          {
            startTime: blockDate,
            endTime: dayEnd,
          },
        ];

        // Remove fixed activities
        for (const activity of this.fixedActivities) {
          const activityDate = new Date(activity.startTime);
          activityDate.setHours(0, 0, 0, 0);

          // Only consider activities on this day
          if (activityDate.getTime() === blockDate.getTime()) {
            availableSlots = this.removeTimeOverlap(availableSlots, {
              startTime: new Date(activity.startTime),
              endTime: new Date(activity.endTime),
            });
          }
        }

        // Remove already scheduled blocks
        for (const resolvedBlock of resolvedBlocks) {
          availableSlots = this.removeTimeOverlap(availableSlots, {
            startTime: resolvedBlock.startTime,
            endTime: resolvedBlock.endTime,
          });
        }

        // Find a slot for this block
        for (const slot of availableSlots) {
          const slotDuration =
            (slot.endTime.getTime() - slot.startTime.getTime()) /
            (1000 * 60 * 60);
          const blockDuration =
            (block.endTime.getTime() - block.startTime.getTime()) /
            (1000 * 60 * 60);

          if (slotDuration >= blockDuration) {
            // Found a slot, reschedule the block
            const newEndTime = new Date(
              slot.startTime.getTime() + blockDuration * 60 * 60 * 1000,
            );

            resolvedBlocks.push({
              ...block,
              startTime: new Date(slot.startTime),
              endTime: newEndTime,
            });

            break;
          }
        }
      }
    }

    return resolvedBlocks;
  }

  // Mutation
  private mutate(individual: Individual): Individual {
    if (
      Math.random() > this.mutationRate ||
      individual.chromosome.length === 0
    ) {
      return individual;
    }

    // Clone chromosome
    const newChromosome = [...individual.chromosome];

    // Pick a random block to mutate
    const randomIndex = Math.floor(Math.random() * newChromosome.length);
    const blockToMutate = newChromosome[randomIndex];

    // Mutation types:
    // 1. Shift time (50% chance)
    // 2. Change duration (25% chance)
    // 3. Swap with another block (25% chance)

    const mutationType = Math.random();

    if (mutationType < 0.5) {
      // Shift time (up to ±3 hours)
      const shiftHours = Math.random() * 6 - 3; // -3 to +3 hours

      const newStartTime = new Date(
        blockToMutate.startTime.getTime() + shiftHours * 60 * 60 * 1000,
      );
      const newEndTime = new Date(
        blockToMutate.endTime.getTime() + shiftHours * 60 * 60 * 1000,
      );

      // Check if new times are within the day
      const dayStart = new Date(blockToMutate.startTime);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      if (newStartTime >= dayStart && newEndTime <= dayEnd) {
        newChromosome[randomIndex] = {
          ...blockToMutate,
          startTime: newStartTime,
          endTime: newEndTime,
        };
      }
    } else if (mutationType < 0.75) {
      // Change duration (±30 minutes)
      const durationChange = (Math.random() * 60 - 30) * 60 * 1000; // -30 to +30 minutes in milliseconds

      // Ensure minimum 1 hour duration
      const currentDuration =
        blockToMutate.endTime.getTime() - blockToMutate.startTime.getTime();
      const newDuration = Math.max(
        60 * 60 * 1000,
        currentDuration + durationChange,
      );

      const newEndTime = new Date(
        blockToMutate.startTime.getTime() + newDuration,
      );

      // Check if new end time is within the day
      const dayEnd = new Date(blockToMutate.startTime);
      dayEnd.setHours(23, 59, 59, 999);

      if (newEndTime <= dayEnd) {
        newChromosome[randomIndex] = {
          ...blockToMutate,
          endTime: newEndTime,
        };
      }
    } else {
      // Swap with another block if possible
      if (newChromosome.length > 1) {
        let swapIndex;
        do {
          swapIndex = Math.floor(Math.random() * newChromosome.length);
        } while (swapIndex === randomIndex);

        const blockToSwap = newChromosome[swapIndex];

        // Swap start and end times
        const tempStart = blockToMutate.startTime;
        const tempEnd = blockToMutate.endTime;

        newChromosome[randomIndex] = {
          ...blockToMutate,
          startTime: blockToSwap.startTime,
          endTime: blockToSwap.endTime,
        };

        newChromosome[swapIndex] = {
          ...blockToSwap,
          startTime: tempStart,
          endTime: tempEnd,
        };
      }
    }

    // Resolve any time conflicts
    const resolvedChromosome = this.resolveTimeConflicts(newChromosome);

    // Calculate new fitness
    const newFitness = this.calculateFitness(resolvedChromosome);

    return {
      chromosome: resolvedChromosome,
      fitness: newFitness,
    };
  }

  // Run the genetic algorithm
  public optimize(): DailySchedule[] {
    // Initialize population
    let population = this.initializePopulation();

    // Sort population by fitness (descending)
    population.sort((a, b) => b.fitness - a.fitness);

    // Main loop
    for (let generation = 0; generation < this.maxGenerations; generation++) {
      // Create new population
      const newPopulation: Individual[] = [];

      // Elitism: Keep the best individuals
      for (let i = 0; i < this.elitismCount; i++) {
        newPopulation.push(population[i]);
      }

      // Fill the rest with crossover and mutation
      while (newPopulation.length < this.populationSize) {
        // Selection
        const parent1 = this.selection(population);
        const parent2 = this.selection(population);

        // Crossover
        const [child1, child2] = this.crossover(parent1, parent2);

        // Mutation
        const mutatedChild1 = this.mutate(child1);
        const mutatedChild2 = this.mutate(child2);

        newPopulation.push(mutatedChild1);
        if (newPopulation.length < this.populationSize) {
          newPopulation.push(mutatedChild2);
        }
      }

      // Update population
      population = newPopulation;

      // Sort population by fitness (descending)
      population.sort((a, b) => b.fitness - a.fitness);
    }

    // Get the best solution
    const bestSolution = population[0];

    // Convert to daily schedules
    return this.convertToDailySchedules(bestSolution.chromosome);
  }

  // Convert chromosome to daily schedules
  private convertToDailySchedules(chromosome: StudyBlock[]): DailySchedule[] {
    const dailySchedules: { [key: string]: DailySchedule } = {};

    // Sort blocks by start time
    const sortedBlocks = [...chromosome].sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );

    // Group blocks by day
    for (const block of sortedBlocks) {
      const dateStr = block.startTime.toDateString();

      if (!dailySchedules[dateStr]) {
        dailySchedules[dateStr] = {
          date: new Date(block.startTime.setHours(0, 0, 0, 0)),
          blocks: [],
        };
      }

      dailySchedules[dateStr].blocks.push(block);
    }

    // Add fixed activities to the schedules
    for (const activity of this.fixedActivities) {
      const dateStr = new Date(activity.startTime).toDateString();

      if (!dailySchedules[dateStr]) {
        dailySchedules[dateStr] = {
          date: new Date(new Date(activity.startTime).setHours(0, 0, 0, 0)),
          blocks: [],
        };
      }

      dailySchedules[dateStr].blocks.push({
        activityId: activity._id.toString(),
        startTime: new Date(activity.startTime),
        endTime: new Date(activity.endTime),
        title: activity.title,
        type: activity.type,
      });
    }

    // Sort each day's blocks by start time
    Object.values(dailySchedules).forEach((daySchedule) => {
      daySchedule.blocks.sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime(),
      );
    });

    // Convert to array and sort by date
    return Object.values(dailySchedules).sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
  }
}
