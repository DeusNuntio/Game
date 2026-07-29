import type { GameState } from '@/gameplay/model/GameState';

export const CURRENT_SAVE_VERSION = 1;

export interface SaveGame {
  version: number;
  timestamp: number;
  state: GameState;
}
