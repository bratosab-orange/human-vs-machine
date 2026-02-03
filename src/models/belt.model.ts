import type { Station } from './station.model';

/**
 * Belt : le tapis roulant avec sa longueur et ses stations
 */
export interface Belt {
  length: number;
  stations: [number, Station][]; // [position, station]
}
