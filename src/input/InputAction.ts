import type { Coord } from '@/gameplay/model/Grid';

/**
 * Device-agnostic user intent. UI code turns these (plus current selection
 * state) into GameActions and calls GameEngine.dispatch. Never dispatched
 * directly by InputManager itself — that would couple input to gameplay.
 */
export type InputAction =
  | { type: 'pointerSelect'; coord: Coord }
  | { type: 'confirm' }
  | { type: 'cancel' }
  | { type: 'endTurn' };
