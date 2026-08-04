import type { GameState } from '@/gameplay/model/GameState';
import { MissionBuilder } from './builders';

/** Chemical plant: eliminate the crew, or hack both valve consoles in the correct order to vent the line. */
export function createMission09(): GameState {
  const b = new MissionBuilder(10, 8);

  b.wallLine({ x: 5, y: 1 }, { x: 5, y: 6 }, [{ x: 5, y: 4 }]);
  b.door(5, 4, 'valve_room_door');

  b.cover(4, 3, 'east', 'full');
  b.cover(4, 5, 'east', 'full');
  b.cover(6, 3, 'west', 'half');
  b.cover(6, 5, 'west', 'half');

  b.console(7, 2, 'console_valve1', { difficulty: 0.4, puzzleGroupId: 'valve_seq', sequenceIndex: 0 });
  b.console(7, 6, 'console_valve2', { difficulty: 0.5, puzzleGroupId: 'valve_seq', sequenceIndex: 1 });

  b.player({ id: 'runner', name: 'Runner', template: 'runner', coord: { x: 1, y: 3 }, weaponId: 'smg_mk1' });
  b.player({ id: 'ghost', name: 'Ghost', template: 'ghost', coord: { x: 1, y: 5 }, weaponId: 'pistol_mk1' });

  b.enemy({
    id: 'guard1',
    name: 'Werkschutz',
    template: 'guard',
    coord: { x: 8, y: 2 },
    weaponId: 'pistol_mk1',
    patrolRoute: [
      { x: 8, y: 2 },
      { x: 8, y: 3 },
    ],
  });
  b.enemy({
    id: 'drone1',
    name: 'Wartungsdrohne',
    template: 'drone',
    coord: { x: 8, y: 6 },
    patrolRoute: [
      { x: 8, y: 6 },
      { x: 8, y: 5 },
    ],
  });

  b.objective({ id: 'elim', type: 'eliminateAll', description: 'Die Werksbesatzung ausschalten', complete: false });
  b.objective({
    id: 'vent_line',
    type: 'puzzleSequence',
    description: 'Beide Ventilkonsolen in korrekter Reihenfolge hacken',
    puzzleGroupId: 'valve_seq',
    complete: false,
  });

  return b.build({
    id: 'mission09',
    name: 'Chemiefabrik',
    briefing:
      'Ein Konzern-Chemiewerk leitet Giftstoffe illegal in den Fluss. Hackt die beiden Ventilkonsolen in der richtigen Reihenfolge, um die Linie zu entlüften — ein falscher Griff löst den Alarm aus.',
  });
}
