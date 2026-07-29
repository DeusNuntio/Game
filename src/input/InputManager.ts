import { screenToGrid, type Camera } from '@/rendering/Camera';
import type { InputBackend, InputBackendEvent } from './InputBackend';
import type { InputAction } from './InputAction';

const KEY_TO_ACTION: Record<string, InputAction> = {
  Escape: { type: 'cancel' },
  Enter: { type: 'confirm' },
  ' ': { type: 'endTurn' },
  n: { type: 'endTurn' },
  N: { type: 'endTurn' },
  // Standard gamepad mapping (button indices), fed in by GamepadBackend as `gamepad:<n>`.
  'gamepad:0': { type: 'confirm' }, // A / Cross
  'gamepad:1': { type: 'cancel' }, // B / Circle
  'gamepad:9': { type: 'endTurn' }, // Start / Options
};

/** Pure translation from a raw backend event to an abstract InputAction, given a camera for coord mapping. */
export function translateInputEvent(event: InputBackendEvent, camera: Camera): InputAction | null {
  if (event.type === 'pointerDown') {
    return { type: 'pointerSelect', coord: screenToGrid(camera, event.screenX, event.screenY) };
  }
  return KEY_TO_ACTION[event.key] ?? null;
}

/**
 * Owns zero or more InputBackends, translates their raw events into InputActions
 * via translateInputEvent, and fans those out to subscribers. UI code subscribes
 * here; nothing downstream needs to know whether input came from mouse, keyboard,
 * or (once wired) a gamepad.
 */
export class InputManager {
  private readonly backends: InputBackend[] = [];
  private readonly handlers = new Set<(action: InputAction) => void>();

  constructor(private readonly camera: Camera) {}

  addBackend(backend: InputBackend): void {
    this.backends.push(backend);
    backend.start((event) => this.handleBackendEvent(event));
  }

  onAction(handler: (action: InputAction) => void): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  stop(): void {
    for (const backend of this.backends) backend.stop();
  }

  private handleBackendEvent(event: InputBackendEvent): void {
    const action = translateInputEvent(event, this.camera);
    if (!action) return;
    for (const handler of this.handlers) handler(action);
  }
}
