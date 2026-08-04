import type { GameState } from '@/gameplay/model/GameState';
import { MissionBuilder } from './builders';

/**
 * Clinic sabotage: eliminate the staff-guards, or reach the medbay vault to grab
 * the vaccine sample. The vault door opens via a found keycard OR a remote hack —
 * two independent ways into the same room.
 */
export function createMission03(): GameState {
  const b = new MissionBuilder(10, 8);

  b.wallLine({ x: 3, y: 1 }, { x: 3, y: 6 }, [{ x: 3, y: 4 }]);
  b.door(3, 4, 'clinic_door1');
  b.wallLine({ x: 6, y: 1 }, { x: 6, y: 6 }, [{ x: 6, y: 4 }]);
  b.door(6, 4, 'door_medvault', { requiresItemId: 'keycard_medbay' });

  b.cover(2, 3, 'east', 'full');
  b.cover(2, 5, 'east', 'full');
  b.cover(4, 3, 'west', 'half');
  b.cover(4, 5, 'west', 'half');

  b.groundItem(1, 2, 'keycard_medbay');
  b.groundItem(8, 3, 'vaccine_sample');
  b.console(5, 5, 'console_med', { difficulty: 0.5, linkedDoorId: 'door_medvault' });

  b.player({ id: 'runner', name: 'Runner', template: 'runner', coord: { x: 1, y: 1 }, weaponId: 'pistol_mk1' });
  b.player({
    id: 'medic',
    name: 'Medic',
    template: 'medic',
    coord: { x: 1, y: 3 },
    weaponId: 'pistol_mk1',
    inventory: ['medkit_small'],
  });

  b.enemy({
    id: 'guard1',
    name: 'Klinikwache',
    template: 'guard',
    coord: { x: 4, y: 2 },
    weaponId: 'pistol_mk1',
    patrolRoute: [
      { x: 4, y: 2 },
      { x: 5, y: 2 },
    ],
  });
  b.enemy({
    id: 'heavy1',
    name: 'Tresorwache',
    template: 'heavyGuard',
    coord: { x: 7, y: 5 },
    weaponId: 'smg_mk1',
    patrolRoute: [
      { x: 7, y: 5 },
      { x: 8, y: 5 },
    ],
  });

  b.objective({ id: 'elim', type: 'eliminateAll', description: 'Alle Wachen ausschalten', complete: false });
  b.objective({
    id: 'grab_vaccine',
    type: 'retrieveItem',
    description: 'Die Impfstoffprobe aus dem Tresor bergen',
    itemId: 'vaccine_sample',
    complete: false,
  });

  return b.build({
    id: 'mission03',
    name: 'Klinik-Sabotage',
    briefing:
      'Ein Konzern-Medbay hortet eine unterdrückte Impfstoffprobe hinter einem gesicherten Tresor. Eine gefundene Keycard oder ein Fernzugriffs-Hack öffnen den Tresor gleichermaßen — oder räumt einfach das Personal aus dem Weg.',
  });
}
