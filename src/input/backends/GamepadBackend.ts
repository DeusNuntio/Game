import type { InputBackend, InputBackendEvent } from '../InputBackend';

/**
 * Polls the standard Gamepad API each animation frame and emits `keyDown`
 * events shaped as `gamepad:<buttonIndex>` for InputManager to map, using the
 * same InputAction pipeline as keyboard/mouse. Present and structurally wired
 * end-to-end, but NOT added to InputManager by default in this vertical slice
 * (see main.ts) — this environment cannot exercise real gamepad hardware, so
 * it is unverified against physical controllers. Enable by calling
 * `inputManager.addBackend(new GamepadBackend())`.
 */
export class GamepadBackend implements InputBackend {
  private onEvent: ((event: InputBackendEvent) => void) | null = null;
  private rafId: number | null = null;
  private prevPressed: boolean[] = [];

  start(onEvent: (event: InputBackendEvent) => void): void {
    this.onEvent = onEvent;
    const poll = (): void => {
      const pad = navigator.getGamepads?.()[0];
      if (pad) {
        pad.buttons.forEach((button, index) => {
          if (button.pressed && !this.prevPressed[index]) {
            this.onEvent?.({ type: 'keyDown', key: `gamepad:${index}` });
          }
          this.prevPressed[index] = button.pressed;
        });
      }
      this.rafId = requestAnimationFrame(poll);
    };
    this.rafId = requestAnimationFrame(poll);
  }

  stop(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.onEvent = null;
  }
}
