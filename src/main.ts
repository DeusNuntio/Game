import { createGrid, setTile } from '@/gameplay/model/Grid';
import { createUnit } from '@/gameplay/model/Unit';
import type { GameState } from '@/gameplay/model/GameState';
import { getActiveUnitId } from '@/gameplay/model/GameState';
import { GameEngine } from '@/gameplay/GameEngine';
import { CanvasRenderer } from '@/rendering/CanvasRenderer';
import { createCamera } from '@/rendering/Camera';
import { InputManager } from '@/input/InputManager';
import { KeyboardMouseBackend } from '@/input/backends/KeyboardMouseBackend';
import { TurnIndicator } from '@/ui/components/TurnIndicator';
import { UnitSelectionPanel } from '@/ui/components/UnitSelectionPanel';
import { ActionMenu } from '@/ui/components/ActionMenu';
import { ObjectiveTracker } from '@/ui/components/ObjectiveTracker';

/**
 * Temporary demo scene wiring GameEngine to CanvasRenderer + UI, so every
 * layer has something real to drive. Replaced by the MainMenu -> MissionSelect
 * -> mission01 flow once those exist (M13/M11).
 */
function buildDemoState(): GameState {
  const grid = createGrid(8, 6);
  setTile(grid, {
    coord: { x: 3, y: 2 },
    type: 'floor',
    occupantId: null,
    cover: { west: 'full' },
  });
  setTile(grid, { coord: { x: 4, y: 1 }, type: 'wall', occupantId: null, cover: {} });
  setTile(grid, { coord: { x: 4, y: 3 }, type: 'wall', occupantId: null, cover: {} });

  const units: GameState['units'] = {};
  const p1 = createUnit({
    id: 'p1',
    name: 'Runner',
    faction: 'player',
    coord: { x: 1, y: 2 },
    stats: {
      maxHp: 10,
      hp: 10,
      maxAp: 2,
      ap: 2,
      baseAccuracy: 0.75,
      moveRange: 5,
      critChance: 0.15,
      hackSkill: 0.6,
      baseDamage: 3,
      initiative: 8,
    },
  });
  const e1 = createUnit({
    id: 'e1',
    name: 'Corp Sec',
    faction: 'enemy',
    coord: { x: 6, y: 2 },
    stats: {
      maxHp: 8,
      hp: 8,
      maxAp: 2,
      ap: 2,
      baseAccuracy: 0.6,
      moveRange: 4,
      critChance: 0.05,
      hackSkill: 0.2,
      baseDamage: 2,
      initiative: 4,
    },
  });
  units[p1.id] = p1;
  units[e1.id] = e1;
  for (const unit of Object.values(units)) {
    const tile = grid.tiles.find((t) => t.coord.x === unit.coord.x && t.coord.y === unit.coord.y);
    if (tile) tile.occupantId = unit.id;
  }

  return {
    grid,
    units,
    turn: { round: 1, order: [p1.id, e1.id], activeIndex: 0 },
    rngState: Date.now() & 0xffffffff,
  };
}

const app = document.getElementById('app');
if (!app) {
  throw new Error('#app root element missing from index.html');
}

const heading = document.createElement('h1');
heading.textContent = 'Dark Horizon — Cyberpunk Tactics (Vertical Slice v1)';
app.appendChild(heading);

const canvas = document.createElement('canvas');
canvas.id = 'game-canvas';
canvas.width = 8 * 48 + 16;
canvas.height = 6 * 48 + 16;
canvas.style.border = '1px solid #333';
app.appendChild(canvas);

const hud = document.createElement('div');
hud.id = 'hud';
app.appendChild(hud);

const camera = createCamera();
const engine = new GameEngine(buildDemoState());
const renderer = new CanvasRenderer(canvas, camera);
const inputManager = new InputManager(camera);
inputManager.addBackend(new KeyboardMouseBackend(canvas));

const turnIndicator = new TurnIndicator(hud);
const unitSelectionPanel = new UnitSelectionPanel(hud);
const objectiveTracker = new ObjectiveTracker(hud);

type ArmedMode = 'move' | 'attack' | null;
let armedMode: ArmedMode = null;
let inspectedUnitId: string | undefined;

const actionMenu = new ActionMenu(hud, (id) => {
  const state = engine.getState();
  const activeId = getActiveUnitId(state);
  if (id === 'endTurn') {
    if (activeId) engine.dispatch({ type: 'endTurn', unitId: activeId });
    armedMode = null;
    refresh();
    return;
  }
  armedMode = armedMode === id ? null : (id as ArmedMode);
  refresh();
});

function refresh(): void {
  const state = engine.getState();
  const activeId = getActiveUnitId(state);
  const activeUnit = activeId ? state.units[activeId] : undefined;

  renderer.render(state, { selectedUnitId: inspectedUnitId ?? activeId });
  turnIndicator.update(state);
  unitSelectionPanel.update(inspectedUnitId ? state.units[inspectedUnitId] : activeUnit);
  objectiveTracker.update([]);

  const canAct = !!activeUnit && activeUnit.faction === 'player' && activeUnit.stats.ap >= 1;
  actionMenu.setOptions([
    { id: 'move', label: 'Bewegen', enabled: canAct },
    { id: 'attack', label: 'Angreifen', enabled: canAct },
    { id: 'endTurn', label: 'Zug beenden', enabled: !!activeUnit },
  ]);
  actionMenu.setActive(armedMode);
}

inputManager.onAction((action) => {
  const state = engine.getState();

  if (action.type === 'endTurn') {
    const activeId = getActiveUnitId(state);
    if (activeId) engine.dispatch({ type: 'endTurn', unitId: activeId });
    armedMode = null;
    refresh();
    return;
  }

  if (action.type === 'cancel') {
    armedMode = null;
    inspectedUnitId = undefined;
    refresh();
    return;
  }

  if (action.type !== 'pointerSelect') return;

  const activeId = getActiveUnitId(state);
  const targetUnit = Object.values(state.units).find(
    (u) => u.alive && u.coord.x === action.coord.x && u.coord.y === action.coord.y,
  );

  if (armedMode === 'move' && activeId) {
    engine.dispatch({ type: 'move', unitId: activeId, to: action.coord });
    armedMode = null;
  } else if (armedMode === 'attack' && activeId && targetUnit) {
    engine.dispatch({ type: 'attack', attackerId: activeId, targetId: targetUnit.id });
    armedMode = null;
  } else {
    inspectedUnitId = targetUnit?.id;
  }
  refresh();
});

refresh();
