import type { GameState } from '@/gameplay/model/GameState';
import { MissionBuilder } from './builders';

/**
 * Server farm sabotage: two separate consoles remotely open two separate doors
 * into the core room — pick whichever route avoids the currently-patrolling
 * drone — or just eliminate everything and walk straight in.
 */
export function createMission08(): GameState {
  const b = new MissionBuilder(13, 9);

  b.wallLine({ x: 5, y: 1 }, { x: 5, y: 7 }, [
    { x: 5, y: 2 },
    { x: 5, y: 6 },
  ]);
  b.door(5, 2, 'door_a');
  b.door(5, 6, 'door_b');

  b.cover(4, 2, 'east', 'half');
  b.cover(6, 2, 'west', 'half');
  b.cover(4, 6, 'east', 'half');
  b.cover(6, 6, 'west', 'half');

  b.console(2, 2, 'console_a', { difficulty: 0.5, linkedDoorId: 'door_a' });
  b.console(2, 6, 'console_b', { difficulty: 0.5, linkedDoorId: 'door_b' });
  b.extraction(10, 4, 'core_exit');

  b.player({ id: 'runner', name: 'Runner', template: 'runner', coord: { x: 1, y: 3 }, weaponId: 'smg_mk1' });
  b.player({ id: 'ghost', name: 'Ghost', template: 'ghost', coord: { x: 1, y: 5 }, weaponId: 'pistol_mk1' });

  b.enemy({
    id: 'drone1',
    name: 'Serverdrohne',
    template: 'drone',
    coord: { x: 7, y: 3 },
    patrolRoute: [
      { x: 7, y: 3 },
      { x: 8, y: 3 },
    ],
  });
  b.enemy({
    id: 'drone2',
    name: 'Serverdrohne',
    template: 'drone',
    coord: { x: 9, y: 6 },
    patrolRoute: [
      { x: 9, y: 6 },
      { x: 8, y: 6 },
    ],
  });

  b.objective({ id: 'elim', type: 'eliminateAll', description: 'Alle Drohnen ausschalten', complete: false });
  b.objective({
    id: 'reach_core',
    type: 'reachExtraction',
    description: 'Den Serverkern erreichen',
    extractionZoneId: 'core_exit',
    complete: false,
  });

  return b.build({
    id: 'mission08',
    name: 'Serverfarm-Sabotage',
    briefing:
      'Eine gesicherte Serverfarm bewacht den Kern eines Konzern-Datennetzes. Zwei separate Konsolen öffnen zwei separate Türen — wählt eure Route, oder walzt einfach durch.',
  });
}
