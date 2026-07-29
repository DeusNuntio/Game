/** Extension point for future base building/research. Not wired into gameplay in v1. */
export interface BaseFacility {
  id: string;
  name: string;
  level: number;
}

export interface Base {
  id: string;
  name: string;
  facilities: BaseFacility[];
}
