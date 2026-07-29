export interface PointerInputEvent {
  type: 'pointerDown';
  screenX: number;
  screenY: number;
}

export interface KeyInputEvent {
  type: 'keyDown';
  /** DOM KeyboardEvent.key for keyboard, or `gamepad:<buttonIndex>` for gamepad buttons. */
  key: string;
}

export type InputBackendEvent = PointerInputEvent | KeyInputEvent;

/**
 * A source of raw input (keyboard/mouse today, gamepad later). Backends know
 * nothing about game semantics — they only emit low-level events; InputManager
 * translates those into abstract InputActions.
 */
export interface InputBackend {
  start(onEvent: (event: InputBackendEvent) => void): void;
  stop(): void;
}
