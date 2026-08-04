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

/** Any living player unit must be carrying this item (picked up via PickupItemAction). */
export interface RetrieveItemObjective {
  id: string;
  type: 'retrieveItem';
  description: string;
  itemId: string;
  complete: boolean;
}

/** Any living player unit must be standing on a tile whose extractionZoneId matches. */
export interface ReachExtractionObjective {
  id: string;
  type: 'reachExtraction';
  description: string;
  extractionZoneId: string;
  complete: boolean;
}

/** Every console sharing this puzzleGroupId must be hacked (order enforced by ConsoleSystem, wrong order alarms). */
export interface PuzzleSequenceObjective {
  id: string;
  type: 'puzzleSequence';
  description: string;
  puzzleGroupId: string;
  complete: boolean;
}

/**
 * Additive union: further mission types (escort, timed, defense, ...) plug in
 * here later without touching ObjectiveTracker/WinLoseEvaluator's shape.
 */
export type Objective =
  | EliminateAllObjective
  | HackConsoleObjective
  | RetrieveItemObjective
  | ReachExtractionObjective
  | PuzzleSequenceObjective;

export type MissionStatus = 'ongoing' | 'won' | 'lost';

export interface Mission {
  id: string;
  name: string;
  /** Short flavor text shown before/during the mission (briefing). */
  briefing: string;
  /** Any single objective completing wins the mission — this is what gives a mission multiple solutions. */
  objectives: Objective[];
  status: MissionStatus;
  /**
   * Missions start unalarmed: enemies patrol and won't engage. Once true
   * (spotted, gunfire, a botched hack, ...), enemies switch to full combat AI.
   * This is what keeps "not played in combat mode unless the alarm goes off" true.
   */
  alarmActive: boolean;
}
