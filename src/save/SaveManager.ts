import type { GameState } from '@/gameplay/model/GameState';
import type { StorageAdapter } from './StorageAdapter';
import { CURRENT_SAVE_VERSION, type SaveGame } from './SaveSchema';

const KEY_PREFIX = 'cyberpunk-tactics:save:';

/**
 * Serializes/deserializes GameState as versioned JSON. GameState is designed to
 * be plain data (no class instances, no Map/Set) specifically so this is a
 * trivial JSON.stringify/parse round trip with no custom (de)serializer needed.
 */
export class SaveManager {
  constructor(private readonly storage: StorageAdapter) {}

  save(slot: string, state: GameState): void {
    const saveGame: SaveGame = { version: CURRENT_SAVE_VERSION, timestamp: Date.now(), state };
    this.storage.setItem(KEY_PREFIX + slot, JSON.stringify(saveGame));
  }

  /** Returns null if there's no save in this slot, or it's from an incompatible version. */
  load(slot: string): GameState | null {
    const raw = this.storage.getItem(KEY_PREFIX + slot);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as SaveGame;
    if (parsed.version !== CURRENT_SAVE_VERSION) {
      // No migrations exist yet (v1 is the only version). A future bump adds a
      // migrate(parsed) step here instead of discarding the save.
      return null;
    }
    return parsed.state;
  }

  hasSave(slot: string): boolean {
    return this.storage.getItem(KEY_PREFIX + slot) !== null;
  }

  deleteSave(slot: string): void {
    this.storage.removeItem(KEY_PREFIX + slot);
  }
}
