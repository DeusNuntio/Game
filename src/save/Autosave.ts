import type { GameEngine } from '@/gameplay/GameEngine';
import type { SaveManager } from './SaveManager';

export const AUTOSAVE_SLOT = 'autosave';

/**
 * Subscribes to the engine's event bus and autosaves at natural checkpoints:
 * the start of each round, and mission end. Decoupled from every other system —
 * it only listens to GameEvents and calls SaveManager, never touches state.
 */
export function wireAutosave(
  engine: GameEngine,
  saveManager: SaveManager,
  slot: string = AUTOSAVE_SLOT,
): () => void {
  const save = () => saveManager.save(slot, engine.getState());

  const unsubscribers = [
    engine.events.on('roundStarted', save),
    engine.events.on('missionWon', save),
    engine.events.on('missionLost', save),
  ];

  return () => unsubscribers.forEach((unsub) => unsub());
}
