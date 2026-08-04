import type { GameState } from '@/gameplay/model/GameState';
import { getActiveUnitId } from '@/gameplay/model/GameState';
import { GameEngine } from '@/gameplay/GameEngine';
import { CanvasRenderer } from '@/rendering/CanvasRenderer';
import { createIsoCamera } from '@/rendering/Camera';
import { InputManager } from '@/input/InputManager';
import { KeyboardMouseBackend } from '@/input/backends/KeyboardMouseBackend';
import { TurnIndicator } from '@/ui/components/TurnIndicator';
import { UnitSelectionPanel } from '@/ui/components/UnitSelectionPanel';
import { ActionMenu } from '@/ui/components/ActionMenu';
import { ObjectiveTracker } from '@/ui/components/ObjectiveTracker';
import { UtilityAI } from '@/ai/UtilityAI';
import { runEnemyTurn } from '@/ai/AiController';
import { getItemDef } from '@/data/items';
import { MISSION_REGISTRY, findMission } from '@/data/missions/registry';
import { SaveManager } from '@/save/SaveManager';
import { LocalStorageAdapter } from '@/save/LocalStorageAdapter';
import { wireAutosave, AUTOSAVE_SLOT } from '@/save/Autosave';
import { NoopAudioManager } from '@/audio/AudioManager';
import { MainMenu } from '@/ui/screens/MainMenu';
import { MissionSelect, type MissionListing } from '@/ui/screens/MissionSelect';
import { OptionsScreen } from '@/ui/screens/OptionsScreen';
import { MetaMapScreenStub } from '@/ui/screens/MetaMapScreenStub';
import type { Screen } from '@/ui/screens/Screen';
import { createInitialMetaState } from '@/meta/MetaState';

const MANUAL_SAVE_SLOT = 'manual';

function isEquippableItem(itemId: string): boolean {
  const kind = getItemDef(itemId)?.kind;
  return kind === 'weapon' || kind === 'armor';
}

const AVAILABLE_MISSIONS: MissionListing[] = MISSION_REGISTRY.map(({ id, name, description }) => ({
  id,
  name,
  description,
}));

const app = document.getElementById('app');
if (!app) {
  throw new Error('#app root element missing from index.html');
}

const heading = document.createElement('h1');
heading.textContent = 'Dark Horizon — Cyberpunk Tactics (Vertical Slice v1)';
app.appendChild(heading);

const screenRoot = document.createElement('div');
screenRoot.id = 'screen-root';
app.appendChild(screenRoot);

const gameRoot = document.createElement('div');
gameRoot.id = 'game-root';
gameRoot.style.display = 'none';
app.appendChild(gameRoot);

const saveManager = new SaveManager(new LocalStorageAdapter());
const audio = new NoopAudioManager();
const metaState = createInitialMetaState();

let currentScreen: Screen | null = null;

function showScreen(screen: Screen): void {
  currentScreen?.unmount();
  gameRoot.style.display = 'none';
  gameRoot.innerHTML = '';
  screenRoot.style.display = 'flex';
  currentScreen = screen;
  screen.mount(screenRoot);
}

function showMainMenu(): void {
  showScreen(
    new MainMenu({
      onNewGame: showMissionSelect,
      onContinue: () => {
        const loaded = saveManager.load(MANUAL_SAVE_SLOT) ?? saveManager.load(AUTOSAVE_SLOT);
        if (loaded) startMission(loaded);
      },
      onOptions: showOptions,
      onWorldMap: showWorldMap,
      hasSave: saveManager.hasSave(MANUAL_SAVE_SLOT) || saveManager.hasSave(AUTOSAVE_SLOT),
    }),
  );
}

function showWorldMap(): void {
  showScreen(
    new MetaMapScreenStub(
      metaState,
      (missionId) => {
        const mission = findMission(missionId);
        if (mission) startMission(mission.create());
      },
      showMainMenu,
    ),
  );
}

function showMissionSelect(): void {
  showScreen(
    new MissionSelect(
      AVAILABLE_MISSIONS,
      (missionId) => {
        const mission = findMission(missionId);
        if (mission) startMission(mission.create());
      },
      showMainMenu,
    ),
  );
}

function showOptions(): void {
  showScreen(new OptionsScreen(audio, showMainMenu));
}

/** Builds the whole gameplay UI (canvas + HUD) fresh inside gameRoot for one mission playthrough. */
function startMission(initialState: GameState): void {
  currentScreen?.unmount();
  currentScreen = null;
  screenRoot.style.display = 'none';
  screenRoot.innerHTML = '';
  gameRoot.style.display = 'block';
  gameRoot.innerHTML = '';

  const camera = createIsoCamera(initialState.grid.width, initialState.grid.height);

  if (initialState.mission?.briefing) {
    const briefing = document.createElement('p');
    briefing.className = 'mission-briefing';
    briefing.textContent = initialState.mission.briefing;
    gameRoot.appendChild(briefing);
  }

  const canvas = document.createElement('canvas');
  canvas.id = 'game-canvas';
  canvas.width = camera.canvasWidth;
  canvas.height = camera.canvasHeight;
  canvas.style.border = '1px solid #333';
  gameRoot.appendChild(canvas);

  const banner = document.createElement('div');
  banner.id = 'mission-banner';
  banner.style.display = 'none';
  banner.style.fontSize = '20px';
  banner.style.fontWeight = 'bold';
  banner.style.padding = '8px';
  gameRoot.appendChild(banner);

  const hud = document.createElement('div');
  hud.id = 'hud';
  gameRoot.appendChild(hud);

  const engine = new GameEngine(initialState);
  const renderer = new CanvasRenderer(canvas, camera);
  const inputManager = new InputManager(camera);
  inputManager.addBackend(new KeyboardMouseBackend(canvas));
  wireAutosave(engine, saveManager, AUTOSAVE_SLOT);

  const turnIndicator = new TurnIndicator(hud);
  const unitSelectionPanel = new UnitSelectionPanel(hud);
  const objectiveTracker = new ObjectiveTracker(hud);

  type ArmedMode = 'move' | 'attack' | 'openDoor' | 'hack' | null;
  let armedMode: ArmedMode = null;
  let inspectedUnitId: string | undefined;

  const enemyAi = new UtilityAI();

  function runEnemyTurnsIfNeeded(): void {
    const MAX_ENEMY_TURNS_IN_A_ROW = 20;
    for (let i = 0; i < MAX_ENEMY_TURNS_IN_A_ROW; i++) {
      const missionState = engine.getState().mission;
      if (missionState && missionState.status !== 'ongoing') return;
      const activeId = getActiveUnitId(engine.getState());
      const activeUnit = activeId ? engine.getState().units[activeId] : undefined;
      if (!activeUnit || activeUnit.faction !== 'enemy') return;
      runEnemyTurn(engine, enemyAi, activeUnit.id);
    }
  }

  const actionMenu = new ActionMenu(hud, (id) => {
    const state = engine.getState();
    const activeId = getActiveUnitId(state);
    const activeUnit = activeId ? state.units[activeId] : undefined;

    if (id === 'menu') {
      showMainMenu();
      return;
    }
    if (id === 'endTurn') {
      if (activeId) engine.dispatch({ type: 'endTurn', unitId: activeId });
      armedMode = null;
      runEnemyTurnsIfNeeded();
      refresh();
      return;
    }
    if (id === 'equip' && activeUnit) {
      const itemId = activeUnit.inventory.find((i) => isEquippableItem(i));
      if (itemId) engine.dispatch({ type: 'equip', unitId: activeUnit.id, itemId });
      refresh();
      return;
    }
    if (id === 'pickupItem' && activeUnit) {
      const tile = state.grid.tiles.find(
        (t) => t.coord.x === activeUnit.coord.x && t.coord.y === activeUnit.coord.y,
      );
      const itemId = tile?.groundItemIds?.[0];
      if (itemId) engine.dispatch({ type: 'pickupItem', unitId: activeUnit.id, itemId });
      refresh();
      return;
    }
    if (id === 'save') {
      saveManager.save(MANUAL_SAVE_SLOT, engine.getState());
      refresh();
      return;
    }
    if (id === 'load') {
      const loaded = saveManager.load(MANUAL_SAVE_SLOT);
      if (loaded) {
        engine.loadState(loaded);
        armedMode = null;
        inspectedUnitId = undefined;
      }
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
    const missionOver = !!state.mission && state.mission.status !== 'ongoing';

    renderer.render(state, { selectedUnitId: inspectedUnitId ?? activeId });
    turnIndicator.update(state);
    unitSelectionPanel.update(inspectedUnitId ? state.units[inspectedUnitId] : activeUnit);
    objectiveTracker.update(
      (state.mission?.objectives ?? []).map((o) => ({
        id: o.id,
        description: o.description,
        complete: o.complete,
      })),
    );

    if (missionOver) {
      banner.style.display = 'block';
      banner.textContent = state.mission?.status === 'won' ? 'MISSION ERFÜLLT' : 'MISSION GESCHEITERT';
      banner.style.color = state.mission?.status === 'won' ? '#3ddc84' : '#ff4d4d';
    } else {
      banner.style.display = 'none';
    }

    const canAct = !missionOver && !!activeUnit && activeUnit.faction === 'player' && activeUnit.stats.ap >= 1;
    const isPlayerTurn = !missionOver && !!activeUnit && activeUnit.faction === 'player';
    const standingTile = activeUnit
      ? state.grid.tiles.find((t) => t.coord.x === activeUnit.coord.x && t.coord.y === activeUnit.coord.y)
      : undefined;
    const hasLoot = !!standingTile?.groundItemIds && standingTile.groundItemIds.length > 0;
    const hasEquippableItem = !!activeUnit?.inventory.some((i) => isEquippableItem(i));

    actionMenu.setOptions([
      { id: 'move', label: 'Bewegen', enabled: canAct },
      { id: 'attack', label: 'Angreifen', enabled: canAct },
      { id: 'openDoor', label: 'Tür öffnen', enabled: canAct },
      { id: 'hack', label: 'Hacken', enabled: canAct },
      { id: 'pickupItem', label: 'Aufheben', enabled: isPlayerTurn && hasLoot },
      { id: 'equip', label: 'Ausrüsten', enabled: isPlayerTurn && hasEquippableItem },
      { id: 'endTurn', label: 'Zug beenden', enabled: !missionOver && !!activeUnit },
      { id: 'save', label: 'Speichern', enabled: true },
      { id: 'load', label: 'Laden', enabled: saveManager.hasSave(MANUAL_SAVE_SLOT) },
      { id: 'menu', label: 'Hauptmenü', enabled: true },
    ]);
    actionMenu.setActive(armedMode);
  }

  inputManager.onAction((action) => {
    const state = engine.getState();
    if (state.mission && state.mission.status !== 'ongoing') return;

    if (action.type === 'endTurn') {
      const activeId = getActiveUnitId(state);
      if (activeId) engine.dispatch({ type: 'endTurn', unitId: activeId });
      armedMode = null;
      runEnemyTurnsIfNeeded();
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
    const clickedTile = state.grid.tiles.find(
      (t) => t.coord.x === action.coord.x && t.coord.y === action.coord.y,
    );

    if (armedMode === 'move' && activeId) {
      engine.dispatch({ type: 'move', unitId: activeId, to: action.coord });
      armedMode = null;
    } else if (armedMode === 'attack' && activeId && targetUnit) {
      engine.dispatch({ type: 'attack', attackerId: activeId, targetId: targetUnit.id });
      armedMode = null;
    } else if (armedMode === 'openDoor' && activeId && clickedTile?.doorId) {
      engine.dispatch({ type: 'openDoor', unitId: activeId, doorId: clickedTile.doorId });
      armedMode = null;
    } else if (armedMode === 'hack' && activeId && clickedTile?.consoleId) {
      engine.dispatch({ type: 'hack', unitId: activeId, consoleId: clickedTile.consoleId });
      armedMode = null;
    } else {
      inspectedUnitId = targetUnit?.id;
    }
    runEnemyTurnsIfNeeded();
    refresh();
  });

  runEnemyTurnsIfNeeded();
  refresh();
}

showMainMenu();
