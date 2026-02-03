import type { Station } from '../models/station.model';

/**
 * Token types pour parser la visualization
 */
export type Token =
  | { type: 'empty' }
  | { type: 'item'; name: string }
  | { type: 'station'; name: string; size: number; itemInside: string | null }
  | { type: 'itemAfterStation'; stationName: string; stationSize: number; itemName: string }
  | { type: 'exitQueue'; items: string[] };

/**
 * ParsedVisualization : résultat du parsing
 */
export interface ParsedVisualization {
  beltLength: number;
  stations: [number, Station][];
  tokens: (Token | null)[];
  exitQueue: string[];
}

/**
 * parseVisualization : parse une chaîne de visualization en tokens
 */
export function parseVisualization(visualization: string): ParsedVisualization {
  // Séparer la partie tapis de la queue de sortie
  const [beltPart, exitPart] = visualization.split(':');
  
  // Parser la queue de sortie
  const exitQueue: string[] = [];
  if (exitPart) {
    const exitMatches = exitPart.matchAll(/I\(([^)]+)\)/g);
    for (const match of exitMatches) {
      exitQueue.push(match[1]);
    }
  }
  
  // Parser les tokens du tapis
  const tokens: (Token | null)[] = [];
  const stations: [number, Station][] = [];
  let position = 0;
  
  // Split sur les espaces pour obtenir les éléments individuels
  const parts = beltPart.trim().split(/\s+/);
  
  for (const part of parts) {
    const token = parseSingleToken(part);
    
    if (token.type === 'station') {
      // Enregistrer la station
      stations.push([position, { name: token.name, size: token.size }]);
      tokens.push(token);
      position += token.size;
    } else if (token.type === 'itemAfterStation') {
      // Item collé après une station - la station a déjà été ajoutée
      // On ajoute juste le token pour tracer l'item
      tokens.push(token);
      position++;
    } else {
      tokens.push(token);
      position++;
    }
  }
  
  return {
    beltLength: position,
    stations,
    tokens,
    exitQueue,
  };
}

/**
 * parseSingleToken : parse un seul élément de la visualization
 */
function parseSingleToken(part: string): Token {
  // Position vide : _
  if (part === '_') {
    return { type: 'empty' };
  }
  
  // Item seul : I(name)
  const itemMatch = part.match(/^I\(([^)]+)\)$/);
  if (itemMatch) {
    return { type: 'item', name: itemMatch[1] };
  }
  
  // Station avec item à l'intérieur : S[I(item)]...S(name) ou SSS[I(item)](name)
  const stationWithItemMatch = part.match(/^(S+)\[I\(([^)]+)\)\](S*)\(([^)]+)\)$/);
  if (stationWithItemMatch) {
    const sBefore = stationWithItemMatch[1].length;
    const sAfter = stationWithItemMatch[3].length;
    const itemName = stationWithItemMatch[2];
    const stationName = stationWithItemMatch[4];
    const size = sBefore + sAfter;
    return { type: 'station', name: stationName, size, itemInside: itemName };
  }
  
  // Station avec item collé : SS(name)I(item)
  const stationWithStickyMatch = part.match(/^(S+)\(([^)]+)\)I\(([^)]+)\)$/);
  if (stationWithStickyMatch) {
    const size = stationWithStickyMatch[1].length;
    const stationName = stationWithStickyMatch[2];
    const itemName = stationWithStickyMatch[3];
    return { type: 'itemAfterStation', stationName, stationSize: size, itemName };
  }
  
  // Station vide : S(name) ou SSS(name)
  const stationMatch = part.match(/^(S+)\(([^)]+)\)$/);
  if (stationMatch) {
    const size = stationMatch[1].length;
    const name = stationMatch[2];
    return { type: 'station', name, size, itemInside: null };
  }
  
  throw new Error(`Unable to parse token: ${part}`);
}
