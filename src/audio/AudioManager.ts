/**
 * Audio contract gameplay/UI code depends on. v1 ships only a no-op
 * implementation (see NoopAudioManager) — wiring real sound later means
 * swapping the implementation passed into the composition root, nothing else.
 */
export interface AudioManager {
  playSfx(id: string): void;
  playMusic(id: string): void;
  setMasterVolume(volume: number): void;
}

export class NoopAudioManager implements AudioManager {
  playSfx(_id: string): void {
    // intentionally empty — placeholder tier ships with no audio
  }

  playMusic(_id: string): void {
    // intentionally empty
  }

  setMasterVolume(_volume: number): void {
    // intentionally empty
  }
}
