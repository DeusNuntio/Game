import type { GameState } from '@/gameplay/model/GameState';
import { MissionBuilder } from './builders';

/**
 * Maintenance shaft: two doors lead into the same objective room — the guarded
 * main hatch, or a keycard-locked shortcut that skips the patrol entirely.
 */
export function createMission17(): GameState {
  const b = new MissionBuilder(12, 7);

  b.wallLine({ x: 3, y: 1 }, { x: 3, y: 5 }, [
    { x: 3, y: 2 },
    { x: 3, y: 4 },
  ]);
  b.door(3, 2, 'shaft_main_door');
  b.door(3, 4, 'shaft_shortcut_door', { requiresItemId: 'keycard_maintenance' });

  b.extraction(9, 3, 'shaft_end');
  b.groundItem(1, 4, 'keycard_maintenance');

  b.player({ id: 'runner', name: 'Runner', template: 'runner', coord: { x: 1, y: 2 }, weaponId: 'smg_mk1' });
  b.player({ id: 'ghost', name: 'Ghost', template: 'ghost', coord: { x: 1, y: 3 }, weaponId: 'pistol_mk1' });

  b.enemy({
    id: 'guard1',
    name: 'Wartungswache',
    template: 'guard',
    coord: { x: 5, y: 2 },
    weaponId: 'pistol_mk1',
    patrolRoute: [
      { x: 5, y: 2 },
      { x: 6, y: 2 },
    ],
  });
  b.enemy({
    id: 'heavy1',
    name: 'Wartungswache',
    template: 'heavyGuard',
    coord: { x: 5, y: 3 },
    weaponId: 'smg_mk1',
    patrolRoute: [
      { x: 5, y: 3 },
      { x: 6, y: 3 },
    ],
  });

  b.objective({ id: 'elim', type: 'eliminateAll', description: 'Die Wartungswachen ausschalten', complete: false });
  b.objective({
    id: 'reach_end',
    type: 'reachExtraction',
    description: 'Das Ende des Wartungsschachts erreichen',
    extractionZoneId: 'shaft_end',
    complete: false,
  });

  return b.build({
    id: 'mission17',
    name: 'Wartungsschacht',
    briefing:
      'Zwei Wege führen durch die Wartungsebene: der bewachte Haupteingang, oder eine keycard-gesicherte Abkürzung, die der Patrouille komplett ausweicht.',
  });
}
