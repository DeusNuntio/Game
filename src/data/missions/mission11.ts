import type { GameState } from '@/gameplay/model/GameState';
import { MissionBuilder } from './builders';

/** Subway tunnel dash: eliminate the patrol, or just outrun it to the far platform. */
export function createMission11(): GameState {
  const b = new MissionBuilder(14, 6);

  b.wall(6, 1);
  b.wall(6, 4);

  b.extraction(12, 2, 'tunnel_end');

  b.player({ id: 'runner', name: 'Runner', template: 'runner', coord: { x: 1, y: 2 }, weaponId: 'smg_mk1' });
  b.player({ id: 'ghost', name: 'Ghost', template: 'ghost', coord: { x: 1, y: 3 }, weaponId: 'pistol_mk1' });

  b.enemy({
    id: 'drone1',
    name: 'Tunneldrohne',
    template: 'drone',
    coord: { x: 4, y: 2 },
    patrolRoute: [
      { x: 4, y: 2 },
      { x: 4, y: 3 },
    ],
  });
  b.enemy({
    id: 'guard1',
    name: 'Tunnelwache',
    template: 'guard',
    coord: { x: 7, y: 2 },
    weaponId: 'pistol_mk1',
    patrolRoute: [
      { x: 7, y: 2 },
      { x: 8, y: 2 },
    ],
  });
  b.enemy({
    id: 'drone2',
    name: 'Tunneldrohne',
    template: 'drone',
    coord: { x: 9, y: 3 },
    patrolRoute: [
      { x: 9, y: 3 },
      { x: 9, y: 2 },
    ],
  });

  b.objective({ id: 'elim', type: 'eliminateAll', description: 'Die Tunnelpatrouille ausschalten', complete: false });
  b.objective({
    id: 'reach_end',
    type: 'reachExtraction',
    description: 'Das andere Ende des Tunnels erreichen',
    extractionZoneId: 'tunnel_end',
    complete: false,
  });

  return b.build({
    id: 'mission11',
    name: 'U-Bahn-Tunnel',
    briefing:
      'Ein stillgelegter U-Bahn-Tunnel verbindet zwei Distrikte — bewacht von Drohnen und einer Streife. Kämpft euch durch oder rennt einfach zum anderen Bahnsteig.',
  });
}
