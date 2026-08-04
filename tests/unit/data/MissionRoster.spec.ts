import { describe, expect, it } from 'vitest';
import { MISSION_REGISTRY } from '@/data/missions/registry';
import { getItemDef } from '@/data/items';
import { inBounds } from '@/gameplay/model/Grid';

describe('mission roster structural sanity', () => {
  it('has 21 unique, non-empty mission ids', () => {
    const ids = MISSION_REGISTRY.map((m) => m.id);
    expect(ids.length).toBe(21);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).not.toBe('');
  });

  for (const entry of MISSION_REGISTRY) {
    describe(entry.id, () => {
      it('builds a structurally valid GameState', () => {
        const state = entry.create();

        // Grid dimensions match tile count.
        expect(state.grid.tiles.length).toBe(state.grid.width * state.grid.height);

        // Every unit sits on an in-bounds, non-wall tile, and tile.occupantId matches.
        const seenCoords = new Set<string>();
        for (const unit of Object.values(state.units)) {
          expect(inBounds(state.grid, unit.coord)).toBe(true);
          const key = `${unit.coord.x},${unit.coord.y}`;
          expect(seenCoords.has(key)).toBe(false);
          seenCoords.add(key);

          const tile = state.grid.tiles.find(
            (t) => t.coord.x === unit.coord.x && t.coord.y === unit.coord.y,
          );
          expect(tile).toBeDefined();
          expect(tile!.type).not.toBe('wall');
          expect(tile!.occupantId).toBe(unit.id);
        }

        // Every door tile has a matching DoorState entry, and vice versa.
        const doorTileIds = state.grid.tiles.filter((t) => t.type === 'door').map((t) => t.doorId);
        for (const doorId of doorTileIds) {
          expect(doorId).toBeDefined();
          expect(state.doors?.[doorId!]).toBeDefined();
        }
        for (const doorId of Object.keys(state.doors ?? {})) {
          expect(doorTileIds).toContain(doorId);
        }
        // requiresItemId (keycards) must reference a real item def.
        for (const door of Object.values(state.doors ?? {})) {
          if (door.requiresItemId) expect(getItemDef(door.requiresItemId)).toBeDefined();
        }

        // Every console tile has a matching ConsoleState entry, and vice versa.
        const consoleTileIds = state.grid.tiles.filter((t) => t.consoleId).map((t) => t.consoleId);
        for (const consoleId of consoleTileIds) {
          expect(state.consoles?.[consoleId!]).toBeDefined();
        }
        for (const consoleId of Object.keys(state.consoles ?? {})) {
          expect(consoleTileIds).toContain(consoleId);
        }
        // linkedDoorId must reference a real door in this mission.
        for (const console of Object.values(state.consoles ?? {})) {
          if (console.linkedDoorId) expect(state.doors?.[console.linkedDoorId]).toBeDefined();
        }

        // Ground items must reference real item defs.
        for (const tile of state.grid.tiles) {
          for (const itemId of tile.groundItemIds ?? []) {
            expect(getItemDef(itemId)).toBeDefined();
          }
        }

        // Objectives must be non-empty and reference real ids.
        expect(state.mission?.objectives.length ?? 0).toBeGreaterThan(0);
        for (const objective of state.mission?.objectives ?? []) {
          switch (objective.type) {
            case 'hackConsole':
              expect(state.consoles?.[objective.consoleId]).toBeDefined();
              break;
            case 'retrieveItem':
              expect(getItemDef(objective.itemId)).toBeDefined();
              break;
            case 'reachExtraction': {
              const zoneTiles = state.grid.tiles.filter(
                (t) => t.extractionZoneId === objective.extractionZoneId,
              );
              expect(zoneTiles.length).toBeGreaterThan(0);
              break;
            }
            case 'puzzleSequence': {
              const steps = Object.values(state.consoles ?? {}).filter(
                (c) => c.puzzleGroupId === objective.puzzleGroupId,
              );
              expect(steps.length).toBeGreaterThan(0);
              break;
            }
            case 'eliminateAll':
              break;
          }
        }

        // At least one player and one enemy unit, mission starts unalarmed.
        const units = Object.values(state.units);
        expect(units.some((u) => u.faction === 'player')).toBe(true);
        expect(units.some((u) => u.faction === 'enemy')).toBe(true);
        expect(state.mission?.alarmActive).toBe(false);

        // Turn order covers every living unit exactly once.
        expect(new Set(state.turn.order).size).toBe(state.turn.order.length);
        expect(state.turn.order.length).toBe(units.filter((u) => u.alive).length);
      });
    });
  }
});
