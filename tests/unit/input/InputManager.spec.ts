import { describe, expect, it } from 'vitest';
import { createIsoCamera, gridToScreen } from '@/rendering/Camera';
import { translateInputEvent } from '@/input/InputManager';

describe('translateInputEvent', () => {
  const camera = createIsoCamera(8, 6);

  it('maps a pointerDown to a grid-space pointerSelect action (round-trips through gridToScreen)', () => {
    const target = { x: 3, y: 2 };
    const screen = gridToScreen(camera, target);
    const action = translateInputEvent({ type: 'pointerDown', screenX: screen.x, screenY: screen.y }, camera);
    expect(action).toEqual({ type: 'pointerSelect', coord: target });
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
