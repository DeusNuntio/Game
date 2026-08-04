import type { GameState } from '@/gameplay/model/GameState';
import { MissionBuilder } from './builders';

/**
 * Corporate lobby: the executive floor is keycard-locked, but the lobby
 * console can remotely unlock it too — find the ledger inside either way, or
 * eliminate everyone and take your time.
 */
export function createMission12(): GameState {
  const b = new MissionBuilder(11, 8);

  b.wallLine({ x: 4, y: 1 }, { x: 4, y: 6 }, [{ x: 4, y: 4 }]);
  b.door(4, 4, 'lobby_door');
  b.wallLine({ x: 7, y: 1 }, { x: 7, y: 6 }, [{ x: 7, y: 4 }]);
  b.door(7, 4, 'exec_door', { requiresItemId: 'keycard_exec' });

  b.cover(3, 3, 'east', 'full');
  b.cover(3, 5, 'east', 'full');
  b.cover(5, 3, 'west', 'half');
  b.cover(5, 5, 'west', 'half');
  b.cover(6, 3, 'east', 'full');
  b.cover(6, 5, 'east', 'full');
  b.cover(8, 3, 'west', 'half');
  b.cover(8, 5, 'west', 'half');

  b.console(2, 2, 'console_lobby', { difficulty: 0.5, linkedDoorId: 'exec_door' });
  b.groundItem(5, 6, 'keycard_exec');
  b.groundItem(9, 3, 'financial_ledger');

  b.player({ id: 'ghost', name: 'Ghost', template: 'ghost', coord: { x: 1, y: 2 }, weaponId: 'pistol_mk1' });
  b.player({ id: 'runner', name: 'Runner', template: 'runner', coord: { x: 1, y: 5 }, weaponId: 'smg_mk1' });

  b.enemy({
    id: 'guard1',
    name: 'Rezeptionswache',
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
    name: 'Chefetagenwache',
    template: 'heavyGuard',
    coord: { x: 8, y: 5 },
    weaponId: 'smg_mk1',
    patrolRoute: [
      { x: 8, y: 5 },
      { x: 9, y: 5 },
    ],
  });

  b.objective({ id: 'elim', type: 'eliminateAll', description: 'Alle Wachen ausschalten', complete: false });
  b.objective({
    id: 'grab_ledger',
    type: 'retrieveItem',
    description: 'Das Tarnfirmen-Kontobuch bergen',
    itemId: 'financial_ledger',
    complete: false,
  });

  return b.build({
    id: 'mission12',
    name: 'Konzern-Lobby',
    briefing:
      'Ein Firmen-Hauptsitz versteckt belastende Finanzunterlagen in der Chefetage. Findet die Keycard, hackt die Empfangskonsole, oder räumt die Lobby leer.',
  });
}
