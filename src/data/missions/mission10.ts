import type { GameState } from '@/gameplay/model/GameState';
import { MissionBuilder } from './builders';

/**
 * Watchtower infiltration: three stacked floors, climbing via horizontal
 * divides. The top hatch is keycard-locked — find the card on the ground
 * floor, or just fight your way up.
 */
export function createMission10(): GameState {
  const b = new MissionBuilder(9, 9);

  b.wallLine({ x: 1, y: 3 }, { x: 7, y: 3 }, [{ x: 4, y: 3 }]);
  b.door(4, 3, 'tower_door1');
  b.wallLine({ x: 1, y: 6 }, { x: 7, y: 6 }, [{ x: 4, y: 6 }]);
  b.door(4, 6, 'tower_door2', { requiresItemId: 'keycard_exec' });

  b.cover(3, 2, 'south', 'full');
  b.cover(5, 2, 'south', 'full');
  b.cover(3, 4, 'north', 'half');
  b.cover(5, 4, 'north', 'half');

  b.groundItem(2, 2, 'keycard_exec');
  b.extraction(4, 7, 'tower_top');

  b.player({
    id: 'soldier',
    name: 'Soldier',
    template: 'soldier',
    coord: { x: 2, y: 1 },
    weaponId: 'rifle_mk1',
    armorId: 'vest_heavy',
  });
  b.player({ id: 'runner', name: 'Runner', template: 'runner', coord: { x: 6, y: 1 }, weaponId: 'smg_mk1' });

  b.enemy({
    id: 'guard1',
    name: 'Turmwache',
    template: 'guard',
    coord: { x: 3, y: 4 },
    weaponId: 'pistol_mk1',
    patrolRoute: [
      { x: 3, y: 4 },
      { x: 5, y: 4 },
    ],
  });
  b.enemy({
    id: 'sniper1',
    name: 'Turmscharfschütze',
    template: 'sniperEnemy',
    coord: { x: 3, y: 7 },
    weaponId: 'rifle_mk1',
    patrolRoute: [
      { x: 3, y: 7 },
      { x: 5, y: 7 },
    ],
  });

  b.objective({ id: 'elim', type: 'eliminateAll', description: 'Die Turmbesatzung ausschalten', complete: false });
  b.objective({
    id: 'reach_top',
    type: 'reachExtraction',
    description: 'Die Turmspitze zum Sabotieren erreichen',
    extractionZoneId: 'tower_top',
    complete: false,
  });

  return b.build({
    id: 'mission10',
    name: 'Wachturm-Infiltration',
    briefing:
      'Ein Überwachungsturm blickt über den gesamten Distrikt. Die oberste Luke ist versperrt — findet die Keycard im Erdgeschoss, oder erkämpft euch den Weg nach oben.',
  });
}
