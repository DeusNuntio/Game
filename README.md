# Dark Horizon — Cyberpunk Tactics (Vertical Slice v1)

Ein rundenbasiertes Cyberpunk-Taktikspiel: Du führst eine Widerstandsgruppe
gegen eine übermächtige Elite aus Konzernen, Militär und künstlicher
Intelligenz. Diese Version ist eine **Vertical Slice** — ein vollständig
spielbarer, stabiler Kern mit bewusst einfacher Platzhaltergrafik. Die
Spielmechanik hat Priorität; visuelle Politur folgt später, ohne dass
Gameplay-Code angefasst werden muss.

## Schnellstart

```bash
npm install
npm run dev        # Entwicklungsserver, http://localhost:5173
```

## Scripts

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Vite-Dev-Server mit Hot Reload |
| `npm run build` | Produktions-Build nach `dist/` |
| `npm run preview` | Baut nicht neu, dient nur den vorhandenen `dist/`-Output |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (inkl. Architektur-Grenzen, siehe unten) |
| `npm run test` | Unit-/Integrationstests (Vitest) |
| `npm run test:watch` | Vitest im Watch-Modus |
| `npm run test:e2e` | Playwright-End-to-End-Test gegen `npm run preview` |
| `npm run verify` | typecheck + lint + test + build (CI-Gate) |

## Aktueller Funktionsumfang (v1 Vertical Slice)

- Rundenbasiertes Kampfsystem mit Aktionspunkten, Initiative-Zugreihenfolge
- Deckungssystem (halb/voll, richtungsabhängig) und Flankieren
- Sichtlinien (Bresenham), blockiert durch Wände/geschlossene Türen
- Gegner-KI (Fliehen bei niedrigem HP → Deckung suchen → Angreifen →
  Annähern → Zug beenden), jede Verhaltensregel unabhängig testbar
- Türen öffnen, Konsolen hacken (Skill-Check)
- Inventar, Ausrüstung (Waffen/Rüstung), Loot bei Gegner-Tod
- Erfahrungssystem, Level-Aufstieg (+1 max. AP pro Stufe)
- Eine spielbare Mission (`mission01`, "Serverraum-Infiltration") mit
  **zwei unabhängigen Lösungswegen**: alle Wachen ausschalten ODER die
  Sicherheitskonsole hacken, ohne kämpfen zu müssen
- Speichern/Laden (manuell + Autosave bei Rundenbeginn/Missionsende)
- Hauptmenü, Missionsauswahl, Optionen-Screen (Platzhalter)
- Weltkarten-Stub (Bezirke, Basis) als Fundament für eine spätere Iteration
- Maus-/Tastatursteuerung; Gamepad-Unterstützung ist strukturell vorbereitet,
  aber nicht standardmäßig verdrahtet (siehe `src/input/backends/GamepadBackend.ts`)

## Steuerung

- Klick auf einen Aktionsbutton (Bewegen/Angreifen/Tür öffnen/Hacken) "bewaffnet"
  einen Modus; ein Klick aufs Spielfeld führt die Aktion aus.
- `N` / Leertaste: Zug beenden. `Escape`: Aktion abbrechen.
- Ein Klick auf eine Einheit ohne aktiven Modus zeigt ihre Werte im Panel an.

## Architektur

Strikte Trennung von Gameplay/Grafik/Audio/KI/UI/Daten, damit später
hochwertige 3D-Grafik, Animationen und Sound eingebaut werden können, ohne
Gameplay-Code zu ändern:

```
src/
├── core/        EventBus, seeded Rng, Ids — Fundament ohne Gameplay-Wissen
├── gameplay/     reine Spiellogik (Modelle, Systeme, GameEngine).
│                 Darf NICHT aus rendering/ui/audio/input/save importieren.
├── ai/           Gegner-KI (reine Entscheidungsfunktionen + Orchestrierung)
├── rendering/    Canvas-2D-Platzhalter-Renderer — einziges Modul mit Canvas-Zugriff
├── audio/        Audio-Interface + No-op-Stub (noch kein echter Sound)
├── input/        Geräteabstraktion (Maus/Tastatur, vorbereiteter Gamepad)
├── ui/           DOM-Overlay-Komponenten und Screens
├── data/         datengetriebener Inhalt (Waffen, Items, Skills, Missionen)
├── save/         Speichersystem (versioniert, austauschbarer Storage-Adapter)
└── meta/         Datenmodell für die künftige strategische Ebene (Stub)
```

**Kernprinzip:** `GameEngine.dispatch(action)` ist der einzige Weg, den
Spielzustand zu verändern. Reine Funktionen in `gameplay/systems/**`
validieren die Aktion und liefern neuen State + Events zurück; Rendering/UI/
Audio/Save abonnieren nur Events und lesen State — sie mutieren nie direkt.
`GameState` ist bewusst reine, JSON-serialisierbare Struktur (kein
Klassen/Map/Set), wodurch Speichern/Laden ein trivialer
`JSON.stringify`/`parse`-Roundtrip ist.

Diese Trennung wird von ESLint mechanisch erzwungen (`eslint.config.js`):
`gameplay/`, `ai/`, `data/`, `core/`, `meta/` dürfen nicht aus
`rendering/`, `audio/`, `ui/`, `input/`, `save/` importieren.

## Außerhalb des Umfangs von v1

Bewusst nicht (voll) implementiert, aber mit vorbereiteten
Erweiterungspunkten: volle Weltkarte/Bezirksübernahme, Basisbau, Forschung,
Händler, Zufallsereignisse, voller Skillbaum, weitere Missionstypen (Eskorte,
Zeitmission, Verteidigung, VIP-Rettung, Geiselbefreiung, Sabotage, Flucht,
Erkundung), Overwatch, echte Grafik/Animation/Sound, NFT-Kosmetiksystem,
Controller-Hardware-Test. Details siehe `CLAUDE.md`.

## Bekannte Einschränkungen

- `npm audit` meldet Schwachstellen in Dev-Tooling (ESLint/Vite-Transitiv-
  Abhängigkeiten, betrifft nicht den Produktions-Build/Browser-Code). Ein
  Upgrade auf ESLint 10 / Vite 8 wurde bewusst zurückgestellt, da es breaking
  changes für die Config mit sich bringt.
- Kein Fog-of-War in der Darstellung (Gegner werden immer gezeichnet, auch
  außerhalb der Sichtlinie) — die tatsächliche Spiellogik (Kampf/KI) prüft
  Sichtlinien aber korrekt server-seitig.
