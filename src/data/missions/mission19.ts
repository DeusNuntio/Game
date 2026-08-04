import type { GameState } from '@/gameplay/model/GameState';
import { MissionBuilder } from './builders';

/**
 * Underground data bunker: a three-step console sequence spread across the
 * facility unlocks the vault (the final step also opens it directly), or a
 * hidden keycard skips the whole puzzle, or just eliminate the garrison.
 */
export function createMission19(): GameState {
  const b = new MissionBuilder(12, 8);

  b.wallLine({ x: 4, y: 1 }, { x: 4, y: 6 }, [{ x: 4, y: 4 }]);
  b.door(4, 4, 'bunker_door1');
  b.wallLine({ x: 8, y: 1 }, { x: 8, y: 6 }, [{ x: 8, y: 4 }]);
  b.door(8, 4, 'bunker_vault_door', { requiresItemId: 'keycard_vault' });

  b.cover(3, 3, 'east', 'half');
  b.cover(5, 3, 'west', 'half');

  b.console(2, 2, 'console_seq0', { difficulty: 0.4, puzzleGroupId: 'bunker_seq', sequenceIndex: 0 });
  b.console(6, 2, 'console_seq1', { difficulty: 0.5, puzzleGroupId: 'bunker_seq', sequenceIndex: 1 });
  b.console(6, 6, 'console_seq2', {
    difficulty: 0.6,
    puzzleGroupId: 'bunker_seq',
    sequenceIndex: 2,
    linkedDoorId: 'bunker_vault_door',
  });
  b.groundItem(2, 5, 'keycard_vault');

  b.player({
    id: 'soldier',
    name: 'Soldier',
    template: 'soldier',
    coord: { x: 1, y: 2 },
    weaponId: 'rifle_mk1',
    armorId: 'vest_heavy',
  });
  b.player({ id: 'ghost', name: 'Ghost', template: 'ghost', coord: { x: 1, y: 5 }, weaponId: 'pistol_mk1' });

  b.enemy({
    id: 'heavy1',
    name: 'Bunkerwache',
    template: 'heavyGuard',
    coord: { x: 5, y: 4 },
    weaponId: 'smg_mk1',
    patrolRoute: [
      { x: 5, y: 4 },
      { x: 6, y: 4 },
    ],
  });
  b.enemy({
    id: 'heavy2',
    name: 'Bunkerwache',
    template: 'heavyGuard',
    coord: { x: 7, y: 3 },
    weaponId: 'smg_mk1',
    patrolRoute: [
      { x: 7, y: 3 },
      { x: 6, y: 3 },
    ],
  });
  b.enemy({
    id: 'elite1',
    name: 'Tresorwächter',
    template: 'elite',
    coord: { x: 9, y: 4 },
    weaponId: 'rifle_mk1',
    armorId: 'vest_heavy',
    patrolRoute: [
      { x: 9, y: 4 },
      { x: 10, y: 4 },
    ],
  });

  b.objective({ id: 'elim', type: 'eliminateAll', description: 'Alle Bunkerwachen ausschalten', complete: false });
  b.objective({
    id: 'unlock_vault',
    type: 'puzzleSequence',
    description: 'Die dreiteilige Konsolensequenz in Reihenfolge hacken',
    puzzleGroupId: 'bunker_seq',
    complete: false,
  });

  return b.build({
    id: 'mission19',
    name: 'Datenbunker',
    briefing:
      'Ein unterirdischer Bunker sichert die wertvollsten Datenbestände des Konzerns. Eine über die Anlage verteilte Konsolensequenz öffnet den Tresor — oder findet die versteckte Keycard, oder brecht mit Waffengewalt durch.',
  });
}
