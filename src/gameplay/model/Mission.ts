export interface EliminateAllObjective {
  id: string;
  type: 'eliminateAll';
  description: string;
  complete: boolean;
}

export interface HackConsoleObjective {
  id: string;
  type: 'hackConsole';
  description: string;
  consoleId: string;
  complete: boolean;
}

/**
 * Additive union: further mission types (escort, timed, defense, VIP rescue, ...)
 * plug in here later without touching ObjectiveTracker/WinLoseEvaluator's shape.
 */
export type Objective = EliminateAllObjective | HackConsoleObjective;

export type MissionStatus = 'ongoing' | 'won' | 'lost';

export interface Mission {
  id: string;
  name: string;
  /** Any single objective completing wins the mission — this is what gives a mission multiple solutions. */
  objectives: Objective[];
  status: MissionStatus;
}
