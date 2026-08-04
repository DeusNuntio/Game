import type { GameState } from '@/gameplay/model/GameState';
import { MissionBuilder } from './builders';

/**
 * R&D lab theft: a two-step console bypass unlocks the prototype vault, but
 * eliminating the lab's defenders works just as well.
 */
export function createMission15(): GameState {
  const b = new MissionBuilder(12, 8);

  b.wallLine({ x: 4, y: 1 }, { x: 4, y: 6 }, [{ x: 4, y: 4 }]);
  b.door(4, 4, 'lab_door1');
  b.wallLine({ x: 8, y: 1 }, { x: 8, y: 6 }, [{ x: 8, y: 4 }]);
  b.door(8, 4, 'vault_door');

  b.cover(3, 3, 'east', 'half');
  b.cover(5, 3, 'west', 'half');

  b.console(5, 2, 'console_bypass1', { difficulty: 0.5, puzzleGroupId: 'lab_seq', sequenceIndex: 0 });
  b.console(6, 6, 'console_bypass2', {
    difficulty: 0.6,
    puzzleGroupId: 'lab_seq',
    sequenceIndex: 1,
    linkedDoorId: 'vault_door',
  });
  b.groundItem(9, 4, 'prototype_core');

  b.player({ id: 'ghost', name: 'Ghost', template: 'ghost', coord: { x: 1, y: 3 }, weaponId: 'pistol_mk1' });
  b.player({ id: 'runner', name: 'Runner', template: 'runner', coord: { x: 1, y: 5 }, weaponId: 'smg_mk1' });

  b.enemy({
    id: 'drone1',
    name: 'Laborwächter',
    template: 'drone',
    coord: { x: 5, y: 5 },
    patrolRoute: [
      { x: 5, y: 5 },
      { x: 6, y: 5 },
    ],
  });
  b.enemy({
    id: 'elite1',
    name: 'Prototyp-Wächter',
    template: 'elite',
    coord: { x: 9, y: 3 },
    weaponId: 'smg_mk1',
    armorId: 'vest_heavy',
    patrolRoute: [
      { x: 9, y: 3 },
      { x: 9, y: 5 },
    ],
  });

  b.objective({ id: 'elim', type: 'eliminateAll', description: 'Die Laborwachen ausschalten', complete: false });
  b.objective({
    id: 'grab_prototype',
    type: 'retrieveItem',
    description: 'Den KI-Prototypkern bergen',
    itemId: 'prototype_core',
    complete: false,
  });

  return b.build({
    id: 'mission15',
    name: 'Prototyp-Diebstahl',
    briefing:
      'Ein Forschungslabor entwickelt eine gefährliche KI. Umgeht den Tresor über die zwei Bypass-Konsolen in korrekter Reihenfolge, oder schaltet die Wachen einfach aus.',
  });
}
