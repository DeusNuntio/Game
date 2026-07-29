import { getItemDef } from '@/data/items';
import { Rng } from '../../../core/Rng';
import type { GameState } from '../../model/GameState';
import type { AttackAction } from '../../actions/GameAction';
import type {
  ActionRejectedEvent,
  AttackResolvedEvent,
  GameEvent,
  UnitDiedEvent,
} from '../../actions/GameEvent';
import type { SystemResult } from '../movement/MovementSystem';
import { hasLineOfSight } from './LineOfSight';
import { getCoverLevel } from './Cover';
import { isFlanking } from './Flanking';
import { calculateHitChance } from './HitChance';
import { dropLoot } from '../loot/LootSystem';

export interface AttackResult {
  hit: boolean;
  crit: boolean;
  damage: number;
  hitChance: number;
}

/** Pure combat roll: given the two units' positions/stats and an Rng, decide the outcome. */
export function rollAttack(
  state: GameState,
  attackerAccuracy: number,
  attackerCritChance: number,
  damageMin: number,
  damageMax: number,
  attackerCoord: { x: number; y: number },
  defenderCoord: { x: number; y: number },
  rng: Rng,
): AttackResult {
  const cover = getCoverLevel(state.grid, defenderCoord, attackerCoord);
  const flanking = isFlanking(state.grid, defenderCoord, attackerCoord);
  const hitChance = calculateHitChance({ attackerAccuracy, coverLevel: cover, flanking });

  const hit = rng.chance(hitChance);
  if (!hit) {
    return { hit: false, crit: false, damage: 0, hitChance };
  }
  const crit = rng.chance(attackerCritChance);
  const baseDamage = damageMin === damageMax ? damageMin : damageMin + rng.nextInt(damageMax - damageMin + 1);
  const damage = crit ? Math.round(baseDamage * 1.5) : baseDamage;
  return { hit: true, crit, damage, hitChance };
}

function rejected(action: AttackAction, reason: string): ActionRejectedEvent {
  return { type: 'actionRejected', action, reason };
}

export function resolveAttackAction(state: GameState, action: AttackAction): SystemResult {
  const attacker = state.units[action.attackerId];
  const target = state.units[action.targetId];

  if (!attacker || !attacker.alive) {
    return { state, events: [rejected(action, 'attacker not found or dead')] };
  }
  if (!target || !target.alive) {
    return { state, events: [rejected(action, 'target not found or dead')] };
  }

  const weaponDef = attacker.equipped.weaponId ? getItemDef(attacker.equipped.weaponId) : undefined;
  const weapon = weaponDef?.kind === 'weapon' ? weaponDef : undefined;
  const apCost = weapon?.apCost ?? 1;

  if (attacker.stats.ap < apCost) {
    return { state, events: [rejected(action, 'not enough action points')] };
  }
  if (!hasLineOfSight(state.grid, state, attacker.coord, target.coord)) {
    return { state, events: [rejected(action, 'no line of sight to target')] };
  }

  const armorDef = target.equipped.armorId ? getItemDef(target.equipped.armorId) : undefined;
  const armor = armorDef?.kind === 'armor' ? armorDef : undefined;

  const rng = new Rng(state.rngState);
  const result = rollAttack(
    state,
    attacker.stats.baseAccuracy + (weapon?.accuracyMod ?? 0) - (armor?.defenseMod ?? 0),
    attacker.stats.critChance + (weapon?.critChanceMod ?? 0),
    weapon?.damageMin ?? attacker.stats.baseDamage,
    weapon?.damageMax ?? attacker.stats.baseDamage,
    attacker.coord,
    target.coord,
    rng,
  );
  state.rngState = rng.getState();
  attacker.stats.ap -= apCost;

  const events: GameEvent[] = [];
  if (result.hit) {
    target.stats.hp = Math.max(0, target.stats.hp - result.damage);
  }

  const attackEvent: AttackResolvedEvent = {
    type: 'attackResolved',
    attackerId: attacker.id,
    targetId: target.id,
    hit: result.hit,
    crit: result.crit,
    damage: result.damage,
    hitChance: result.hitChance,
    targetHpAfter: target.stats.hp,
  };
  events.push(attackEvent);

  if (result.hit && target.stats.hp <= 0) {
    target.alive = false;
    const tile = state.grid.tiles.find(
      (t) => t.coord.x === target.coord.x && t.coord.y === target.coord.y,
    );
    if (tile) tile.occupantId = null;
    const diedEvent: UnitDiedEvent = { type: 'unitDied', unitId: target.id };
    events.push(diedEvent);
    const lootEvent = dropLoot(state, target);
    if (lootEvent) events.push(lootEvent);
  }

  return { state, events };
}
