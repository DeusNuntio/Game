import type { GameState } from '@/gameplay/model/GameState';
import { MissionBuilder } from './builders';

/**
 * Showcase mission: a three-room siege ring with four independent solutions —
 * eliminate everyone, hack the ring console, grab the override chip, or just
 * sprint to the extraction zone.
 */
export function createMission18(): GameState {
  const b = new MissionBuilder(13, 9);

  b.wallLine({ x: 4, y: 1 }, { x: 4, y: 7 }, [{ x: 4, y: 4 }]);
  b.door(4, 4, 'ring_door1');
  b.wallLine({ x: 8, y: 1 }, { x: 8, y: 7 }, [{ x: 8, y: 4 }]);
  b.door(8, 4, 'ring_door2');

  b.cover(3, 3, 'east', 'full');
  b.cover(3, 5, 'east', 'full');
  b.cover(5, 3, 'west', 'half');
  b.cover(5, 5, 'west', 'half');
  b.cover(7, 3, 'east', 'full');
  b.cover(7, 5, 'east', 'full');
  b.cover(9, 3, 'west', 'half');
  b.cover(9, 5, 'west', 'half');

  b.console(6, 2, 'console_ring', { difficulty: 0.5 });
  b.groundItem(10, 3, 'override_chip');
  b.extraction(10, 6, 'ring_exit');

  b.player({
    id: 'soldier',
    name: 'Soldier',
    template: 'soldier',
    coord: { x: 1, y: 2 },
    weaponId: 'rifle_mk1',
    armorId: 'vest_heavy',
  });
  b.player({ id: 'ghost', name: 'Ghost', template: 'ghost', coord: { x: 1, y: 4 }, weaponId: 'pistol_mk1' });
  b.player({ id: 'runner', name: 'Runner', template: 'runner', coord: { x: 1, y: 6 }, weaponId: 'smg_mk1' });

  b.enemy({
    id: 'guard1',
    name: 'Ringwache',
    template: 'guard',
    coord: { x: 5, y: 2 },
    weaponId: 'pistol_mk1',
    patrolRoute: [
      { x: 5, y: 2 },
      { x: 5, y: 3 },
    ],
  });
  b.enemy({
    id: 'guard2',
    name: 'Ringwache',
    template: 'guard',
    coord: { x: 7, y: 5 },
    weaponId: 'pistol_mk1',
    patrolRoute: [
      { x: 7, y: 5 },
      { x: 6, y: 5 },
    ],
  });
  b.enemy({
    id: 'heavy1',
    name: 'Kernwache',
    template: 'heavyGuard',
    coord: { x: 9, y: 2 },
    weaponId: 'smg_mk1',
    patrolRoute: [
      { x: 9, y: 2 },
      { x: 9, y: 3 },
    ],
  });
  b.enemy({
    id: 'sniper1',
    name: 'Kernscharfschütze',
    template: 'sniperEnemy',
    coord: { x: 11, y: 3 },
    weaponId: 'rifle_mk1',
    patrolRoute: [
      { x: 11, y: 3 },
      { x: 11, y: 4 },
    ],
  });

  b.objective({ id: 'elim', type: 'eliminateAll', description: 'Alle Wachen ausschalten', complete: false });
  b.objective({
    id: 'hack_ring',
    type: 'hackConsole',
    description: 'Die Ringkonsole hacken',
    consoleId: 'console_ring',
    complete: false,
  });
  b.objective({
    id: 'grab_override',
    type: 'retrieveItem',
    description: 'Den Sicherheits-Override-Chip bergen',
    itemId: 'override_chip',
    complete: false,
  });
  b.objective({
    id: 'reach_exit',
    type: 'reachExtraction',
    description: 'Den Ringausgang erreichen',
    extractionZoneId: 'ring_exit',
    complete: false,
  });

  return b.build({
    id: 'mission18',
    name: 'Belagerungsring',
    briefing:
      'Ein dreifach gesicherter Konzern-Außenposten bietet vier Wege zum Erfolg: Feuergefecht, Hack, Diebstahl oder schlichte Flucht. Wählt, was zu eurem Team passt.',
  });
}
