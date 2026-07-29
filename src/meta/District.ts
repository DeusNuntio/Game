/**
 * Extension point for the future territory-control layer (Gebietsübernahme):
 * erobern/verteidigen/verlieren/zurückerobern. Not wired into any gameplay
 * system in v1 — see MetaMapScreenStub for the read-only preview UI.
 */
export type DistrictStatus = 'hostile' | 'contested' | 'liberated';

export interface District {
  id: string;
  name: string;
  status: DistrictStatus;
  /** Mission ids playable while the district is in its current status. */
  availableMissionIds: string[];
}
