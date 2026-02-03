// ===========================================
// Barrel file : exporte tous les types
// ===========================================

// Models
export type { Item } from './models/item.model';
export type { Station } from './models/station.model';
export type { Belt } from './models/belt.model';

// Events
export type { ConveyorInitialized } from './events/events';
export type { ItemAdded } from './events/events';
export type { ItemEnteredStation } from './events/events';
export type { ItemLeftStation } from './events/events';
export type { Stepped } from './events/events';
export type { Paused } from './events/events';
export type { Resumed } from './events/events';
export type { Event } from './events/events';

// State
export type { StationState } from './state/conveyor.state';
export type { ConveyorState } from './state/conveyor.state';
export { createEmptyState } from './state/conveyor.state';

// Projectors
export { applyEvent } from './projectors/event-handlers';
export { projectState } from './projectors/project-state';

// Visualization
export { eventsToVisualization } from './visualization/events-to-visualization';
export { renderVisualization } from './visualization/renderer';

// Parser (reverse direction)
export { visualizationToEvents } from './parser/visualization-to-events';
export { parseVisualization } from './parser/visualization-parser';
export type { Token, ParsedVisualization } from './parser/visualization-parser';
