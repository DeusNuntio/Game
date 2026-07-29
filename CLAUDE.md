# CLAUDE.md

Guidance for Claude Code (or any future contributor) working in this repo.

## What this is

`Dark Horizon` — a turn-based cyberpunk resistance tactics game (XCOM-like).
Built as a vertical slice (v1): one fully playable mission with a complete
core loop, placeholder graphics only, and an architecture designed so 3D
art/animation/sound can be swapped in later without touching gameplay code.
Full context and the original milestone plan: see git history (commits
`M0`–`M16`) and the conversation that produced them — each commit message
explains the *why*, not just the *what*.

## Architecture rules (enforced by ESLint, not just convention)

`eslint.config.js` forbids `src/gameplay/**`, `src/ai/**`, `src/data/**`,
`src/core/**`, `src/meta/**` from importing anything under `src/rendering/**`,
`src/audio/**`, `src/ui/**`, `src/input/**`, `src/save/**`. The reverse
direction is fine (rendering/ui/input/save/audio may import gameplay types).
If you add a new gameplay system and find yourself wanting to import a
renderer or DOM API from it, that's a sign the design needs an event or a
view-model translation step instead — don't bypass the rule.

**The one mutation point:** `GameEngine.dispatch(action: GameAction):
GameEvent[]`. Every system function (`resolve*`) takes `(state, action)` and
returns `{ state, events }`, working on a state clone `GameEngine` already
made — do not call these `resolve*` functions directly from UI/AI code,
always go through `dispatch`. The one exception is `GameEngine.loadState()`,
used only by the save/load flow (loading a save is not a gameplay action —
it must skip validation and mission re-evaluation).

**GameState is plain data.** No classes, no `Map`/`Set`, nothing with
methods. This is deliberate: it makes `cloneGameState` trivial, and it makes
save/load a plain `JSON.stringify`/`JSON.parse` round trip with zero custom
(de)serialization. Keep it that way — if you add a field, make sure it's
JSON-safe and add it to `cloneGameState`/`cloneRecord` in
`src/gameplay/model/GameState.ts`.

**GameAction / GameEvent are the single source of truth unions**, defined in
`src/gameplay/actions/GameAction.ts` and `GameEvent.ts`. Adding a new action:
1. Add the interface + add it to the `GameAction` union + add a case to
   `actingUnitId()`.
2. Write the `resolve*` function in the relevant `gameplay/systems/**`
   subfolder (validate → mutate the passed-in state → return events).
3. Wire the case into `GameEngine`'s `applyAction` switch. Once the union has
   2+ members, TypeScript's exhaustiveness check (`const exhaustive: never`)
   will catch a missing case at compile time — see the note below if you're
   ever back down to a single-member union.
4. Add matching event type(s) to `GameEvent.ts` if needed.

## Gotcha: TS exhaustiveness checking needs a real union

TypeScript's `const x: never = value` exhaustiveness trick only works when
the switch is over an actual union type (2+ members). If `GameAction` (or
any such union) temporarily has only one member, the `default` branch is
NOT narrowed to `never` and the assignment errors even though the switch
covers every case. Don't fight this with `as never` — it resolves itself
automatically once a second member exists. If you hit this, just drop the
`never` assignment temporarily (see `GameEngine.ts` history around M1) and
restore it once there's a real union again.

## Testing conventions

- Vitest runs with `environment: 'node'` — gameplay/ai/save code must never
  touch `window`/DOM/Canvas, which is exactly what the import boundary above
  guarantees. `rendering/`, `input/backends/*`, and UI screens are therefore
  *not* unit tested here; they're covered by the Playwright e2e test instead.
- **Deterministic combat/hack tests**: `Rng` is a seeded mulberry32 PRNG.
  Tests pin `state.rngState` to a specific seed to get an exact, reproducible
  roll sequence. To find a seed that produces a desired outcome (e.g.
  "guaranteed hit + crit"), compute the sequence directly rather than
  guessing:
  ```js
  node -e "
  function makeRng(seed){let s=seed>>>0;return function(){s=(s+0x6d2b79f5)|0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
  const next = makeRng(66); console.log(next(), next());
  "
  ```
  Known reusable seeds (see `tests/unit/gameplay/combat/AttackResolver.spec.ts`):
  `66` → roll1≈0.145 (hit), roll2≈0.005 (crit); `8` → roll1≈0.156 (hit),
  roll2≈0.625 (no crit); `12345` → roll1≈0.980 (guaranteed miss, since max
  hit chance is clamped to 0.95).
- `tests/unit/helpers/testState.ts` (`makeTestState`, `defaultStats`) builds
  minimal synthetic `GameState`s for unit tests. It does NOT use
  `computeInitiativeOrder` — turn order is just insertion order of the
  `units` array you pass — so the first unit listed is always active by
  default. Don't "fix" this to use real initiative sorting; several tests
  depend on the current behavior.
- Full-mission integration tests use the real `createMission01()` data
  (`tests/unit/integration/FullMissionPlaythrough.spec.ts`,
  `tests/unit/gameplay/mission/MissionIntegration.spec.ts`), not just
  synthetic fixtures — when you change `mission01.ts`'s layout, re-check
  these (coordinates/paths are hand-verified against the grid).

## Key files map

| Concern | File |
| --- | --- |
| Mutation entry point | `src/gameplay/GameEngine.ts` |
| Combat math | `src/gameplay/systems/combat/{LineOfSight,Cover,Flanking,HitChance,AttackResolver}.ts` |
| Turn order | `src/gameplay/systems/turns/{InitiativeOrder,TurnManager}.ts` |
| Pathfinding (A* + BFS range) | `src/gameplay/systems/movement/Pathfinding.ts` |
| Mission objectives/win-lose | `src/gameplay/systems/mission/{ObjectiveTracker,WinLoseEvaluator}.ts` |
| Enemy AI behaviors | `src/ai/behaviors/*.ts` (priority order set in `src/ai/UtilityAI.ts`) |
| Placeholder rendering | `src/rendering/CanvasRenderer.ts` + `layers/*.ts` |
| Composition root / screen router | `src/main.ts` |
| The one shipped mission | `src/data/missions/mission01.ts` |
| Item/weapon/skill catalogs | `src/data/{weapons,items,skills}.ts` |

## Balancing knobs (current v1 numbers, tune freely)

- Cover penalty: half −0.25, full −0.40 hit chance; flank bonus +0.15
  (`HitChance.ts`). Hit chance clamps to [0.05, 0.95].
- XP curve: `xpToLevelUp(level) = level * 10`; level-up grants flat +1 max AP
  (`Progression.ts`) — no skill-tree spending is wired up yet even though
  `data/skills.ts` has example nodes.
- Hack success chance: `clamp(hackSkill − difficulty + 0.5, 0.05, 0.95)`
  (`Console.ts`).
- AI thresholds: flee below 30% HP; needs ≥2 AP to reposition into cover.

## Explicitly out of scope for v1 (extension points already exist)

Districts/full world map, base building, research, trading, random events →
`src/meta/*` stubs + `MetaMapScreenStub`. Full skill tree → `Progression.ts`
+ `data/skills.ts` (only 2 example nodes, not spent). Overwatch → the
action/event pattern supports adding a `ReactionAction` later without
refactor. NFT cosmetic skins → `AssetPlaceholders.ts` already separates a
unit's visual key from its gameplay stats. Additional mission types (escort,
timed, defense, VIP rescue, ...) → `Objective` in `Mission.ts` is an additive
union. Real art/animation/3D/audio → `rendering/`/`audio/` are the sole
swap points, structurally isolated by the lint rule above. Controller
hardware → `GamepadBackend` exists and follows the same `InputBackend`
contract as mouse/keyboard, but isn't added to `InputManager` in `main.ts`
by default, and is untested against real hardware.

## Running things

`npm run verify` is the CI gate (typecheck + lint + test + build). E2E is
separate (`npm run test:e2e`, needs a fresh `npm run build` first since it
runs against `npm run preview`, which serves `dist/` as-is). This sandboxed
environment's Playwright config auto-detects `/opt/pw-browsers/chromium`
(see `playwright.config.ts`) and falls back to Playwright's normal browser
resolution elsewhere.
