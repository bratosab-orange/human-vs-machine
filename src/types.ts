// ===========================================
// Phase 1.1 : Types de base
// ===========================================

/**
 * Item : un objet sur le tapis roulant
 */
export interface Item {
  name: string;
}

/**
 * Station : une zone de traitement sur le tapis
 */
export interface Station {
  name: string;
  size: number;
}

/**
 * Belt : le tapis roulant avec sa longueur et ses stations
 */
export interface Belt {
  length: number;
  stations: [number, Station][]; // [position, station]
}

// ===========================================
// Phase 1.2 : Types d'événements
// ===========================================

/**
 * ConveyorInitialized : initialise le tapis avec sa configuration
 */
export interface ConveyorInitialized {
  type: 'ConveyorInitialized';
  belt: Belt;
}

/**
 * ItemAdded : un item est ajouté en position 0 du tapis
 */
export interface ItemAdded {
  type: 'ItemAdded';
  item: Item;
}

/**
 * ItemEnteredStation : un item entre dans une station
 */
export interface ItemEnteredStation {
  type: 'ItemEnteredStation';
  item: Item;
  station: Station;
}

/**
 * ItemLeftStation : un item quitte une station
 */
export interface ItemLeftStation {
  type: 'ItemLeftStation';
  item: Item;
  station: Station;
}

/**
 * Stepped : le tapis avance d'une position
 */
export interface Stepped {
  type: 'Stepped';
}

/**
 * Paused : le tapis est en pause (un item est entré en station)
 */
export interface Paused {
  type: 'Paused';
}

/**
 * Resumed : le tapis reprend (toutes les stations sont vides)
 */
export interface Resumed {
  type: 'Resumed';
}

/**
 * Event : union type de tous les événements possibles
 */
export type Event =
  | ConveyorInitialized
  | ItemAdded
  | ItemEnteredStation
  | ItemLeftStation
  | Stepped
  | Paused
  | Resumed;
