import type { GameState } from '@/gameplay/model/GameState';
import { MissionBuilder } from './builders';

/** Radio tower: eliminate the rooftop garrison, or hack the transmitter console directly. */
export function createMission04(): GameState {
  const b = new MissionBuilder(9, 7);

  b.console(7, 2, 'console_tower', { difficulty: 0.6 });

  b.player({ id: 'ghost', name: 'Ghost', template: 'ghost', coord: { x: 1, y: 2 }, weaponId: 'pistol_mk1' });
  b.player({ id: 'runner', name: 'Runner', template: 'runner', coord: { x: 1, y: 4 }, weaponId: 'smg_mk1' });

  b.enemy({
    id: 'sniper1',
    name: 'Dachwache',
    template: 'sniperEnemy',
    coord: { x: 6, y: 4 },
    weaponId: 'rifle_mk1',
    patrolRoute: [
      { x: 6, y: 4 },
      { x: 5, y: 4 },
    ],
  });
  b.enemy({
    id: 'drone1',
    name: 'Sicherheitsdrohne',
    template: 'drone',
    coord: { x: 4, y: 2 },
    patrolRoute: [
      { x: 4, y: 2 },
      { x: 3, y: 2 },
    ],
  });

  b.objective({ id: 'elim', type: 'eliminateAll', description: 'Die Turmbesatzung ausschalten', complete: false });
  b.objective({
    id: 'hack_tower',
    type: 'hackConsole',
    description: 'Die Sendekonsole hacken',
    consoleId: 'console_tower',
    complete: false,
  });

  return b.build({
    id: 'mission04',
    name: 'Senderturm',
    briefing:
      'Ein Konzern-Sendemast strahlt Propaganda über den Distrikt. Schaltet die Besatzung aus oder hackt die Konsole direkt, um die Sendung zu kapern.',
  });
}
