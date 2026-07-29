import { describe, expect, it } from 'vitest';
import { createCamera } from '@/rendering/Camera';
import { translateInputEvent } from '@/input/InputManager';

describe('translateInputEvent', () => {
  const camera = createCamera(48, 8, 8);

  it('maps a pointerDown to a grid-space pointerSelect action', () => {
    const action = translateInputEvent({ type: 'pointerDown', screenX: 8 + 48 * 2 + 5, screenY: 8 + 5 }, camera);
    expect(action).toEqual({ type: 'pointerSelect', coord: { x: 2, y: 0 } });
  });

  it('maps known keys to abstract actions', () => {
    expect(translateInputEvent({ type: 'keyDown', key: 'Escape' }, camera)).toEqual({ type: 'cancel' });
    expect(translateInputEvent({ type: 'keyDown', key: 'Enter' }, camera)).toEqual({ type: 'confirm' });
    expect(translateInputEvent({ type: 'keyDown', key: 'n' }, camera)).toEqual({ type: 'endTurn' });
  });

  it('maps gamepad button events through the same key table', () => {
    expect(translateInputEvent({ type: 'keyDown', key: 'gamepad:0' }, camera)).toEqual({ type: 'confirm' });
    expect(translateInputEvent({ type: 'keyDown', key: 'gamepad:1' }, camera)).toEqual({ type: 'cancel' });
    expect(translateInputEvent({ type: 'keyDown', key: 'gamepad:9' }, camera)).toEqual({ type: 'endTurn' });
  });

  it('returns null for unmapped keys', () => {
    expect(translateInputEvent({ type: 'keyDown', key: 'F1' }, camera)).toBeNull();
  });
});
