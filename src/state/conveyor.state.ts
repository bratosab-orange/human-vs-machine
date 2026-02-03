/**
 * StationState : état d'une station sur le tapis
 */
export interface StationState {
  name: string;
  size: number;
  itemInside: string | null; // nom de l'item en traitement, null si vide
}

/**
 * ConveyorState : état complet du tapis roulant
 * C'est l'Aggregate qui est reconstruit en rejouant les événements
 */
export interface ConveyorState {
  /** Longueur totale du tapis */
  length: number;

  /** Items sur chaque position du tapis (null = position vide) */
  positions: (string | null)[];

  /** Map position → état de la station */
  stations: Map<number, StationState>;

  /** Items sortis du tapis (file d'attente de sortie) */
  exitQueue: string[];

  /** true si le tapis est en pause (item(s) en station) */
  isPaused: boolean;
}

/**
 * Crée un état initial vide (avant ConveyorInitialized)
 */
export function createEmptyState(): ConveyorState {
  return {
    length: 0,
    positions: [],
    stations: new Map(),
    exitQueue: [],
    isPaused: false,
  };
}
