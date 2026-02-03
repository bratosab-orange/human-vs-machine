# Checklist Event Sourcing - Conveyor Belt Kata

## 🎯 Vue d'ensemble

Implémenter 2 fonctions bidirectionnelles :
- `eventsToVisualization(List[Event]) -> Visualization`
- `visualizationToEvents(Visualization) -> List[Event]`

---

## Phase 1: Fondations (Types & Structure)

### Étape 1.1: Définir les types de base
- [x] `Item` : `{ name: string }`
- [x] `Station` : `{ name: string, size: number }`
- [x] `Belt` : `{ length: number, stations: [position, Station][] }`

### Étape 1.2: Définir les types d'événements
- [ ] `ConveyorInitialized` : `{ type, belt }`
- [ ] `ItemAdded` : `{ type, item }`
- [ ] `ItemEnteredStation` : `{ type, item, station }`
- [ ] `ItemLeftStation` : `{ type, item, station }`
- [ ] `Stepped` : `{ type }`
- [ ] `Paused` : `{ type }`
- [ ] `Resumed` : `{ type }`
- [ ] `Event` : Union type de tous les événements

### Étape 1.3: Définir l'état (Aggregate)
- [ ] `ConveyorState` avec :
  - [ ] `length` : taille du tapis
  - [ ] `positions` : tableau des items sur le tapis `(string | null)[]`
  - [ ] `stations` : Map position → station (avec `itemInside`)
  - [ ] `exitQueue` : items sortis du tapis
  - [ ] `isPaused` : flag pause

---

## Phase 2: Events → Visualization

### Étape 2.1: Event Handlers (Projectors)
- [ ] `handleConveyorInitialized` : créer l'état initial
- [ ] `handleItemAdded` : placer l'item en position 0
- [ ] `handleStepped` : décaler tous les items vers la droite
- [ ] `handleItemEnteredStation` : retirer l'item du tapis, le mettre dans la station
- [ ] `handleItemLeftStation` : remettre l'item sur le tapis (fin de station)
- [ ] `handlePaused` : mettre `isPaused = true`
- [ ] `handleResumed` : mettre `isPaused = false`

### Étape 2.2: Projection (Reduce/Fold)
- [ ] `applyEvent(state, event) → newState`
- [ ] `projectState(events) → finalState` (reduce sur tous les events)

### Étape 2.3: Renderer
- [ ] Rendu position vide : `_`
- [ ] Rendu item seul : `I(name)`
- [ ] Rendu station vide : `S(name)` ou `SSS(name)`
- [ ] Rendu station avec item : `S[I(item)](station)`
- [ ] Rendu item sorti de station (collé) : `S(s)I(i)`
- [ ] Rendu queue de sortie : `: I(a) I(b)`
- [ ] Assemblage final avec espaces

### Étape 2.4: Fonction finale
- [ ] `eventsToVisualization(events) → string`

---

## Phase 3: Visualization → Events (Reverse)

### Étape 3.1: Parser la visualization
- [ ] Parser `_` → position vide
- [ ] Parser `I(x)` → item x
- [ ] Parser `S(x)` → station x, size 1
- [ ] Parser `SSS(x)` → station x, size 3
- [ ] Parser `S[I(i)](x)` → station x avec item i dedans
- [ ] Parser `S(x)I(i)` → station x, item i sorti (collé)
- [ ] Parser `: I(a) I(b)` → queue de sortie

### Étape 3.2: Reconstruire les événements
- [ ] Générer `ConveyorInitialized` (belt + stations)
- [ ] Identifier tous les items (tapis + stations + queue)
- [ ] Ordonner par position (gauche à droite)
- [ ] Générer `ItemAdded` + `Stepped` pour chaque item
- [ ] Générer `ItemEnteredStation` + `Paused` pour items en station
- [ ] Générer `ItemLeftStation` pour items sortis de station
- [ ] Générer `Resumed` quand toutes les stations sont vides

### Étape 3.3: Fonction finale
- [ ] `visualizationToEvents(viz) → Event[]`

---

## Phase 4: Tests

### 4.1: Cas simples
- [ ] Belt vide size=1 → `_`
- [ ] Belt vide size=3 → `_ _ _`
- [ ] 1 item ajouté → `I(a) _ _`
- [ ] 1 station → `S(s) _ _`
- [ ] Station size=3 → `SSS(s)`

### 4.2: Stepping
- [ ] Item + 2 Stepped → `_ _ I(a)`
- [ ] Item sort du tapis → `_ _ _: I(a)`
- [ ] 2 items sortent → `_ _ _: I(b) I(a)`

### 4.3: Stations
- [ ] Item entre en station → `S[I(i)](s) _`
- [ ] Item sort de station (collé) → `S(s)I(i) _`
- [ ] Item sort + Stepped → `S(s) I(i)`
- [ ] Station size=2 avec item → `SS(a)I(i) _ _`

### 4.4: Paused/Resumed
- [ ] 1er item entre → `Paused` émis
- [ ] Dernier item sort → `Resumed` émis
- [ ] 2 items en station, 1 sort → pas de `Resumed`

### 4.5: Cas complexe multi-stations
- [ ] `_ S(s1) SS(s2)` → init avec 2 stations
- [ ] `_ S[I(i1)](s1) SS(s2)` → item en station 1
- [ ] `I(i2) S[I(i1)](s1) SS(s2)` → 2ème item ajouté pendant pause
- [ ] `I(i2) S(s1)I(i1) SS(s2)` → item 1 sort de station
- [ ] `_ S[I(i2)](s1) S[I(i1)]S(s2)` → les 2 items en station
- [ ] `_ S(s1)I(i2) SS(s2)I(i1)` → les 2 items sortent
- [ ] `_ S(s1) SS(s2): I(i2) I(i1)` → tous les items sortis

### 4.6: Bidirectionnalité (Round-trip)
- [ ] `events → viz → events → viz2` : `viz === viz2`

---

## 💡 Points clés Event Sourcing

| Principe | Application |
|----------|-------------|
| **Immutabilité** | Chaque handler retourne un nouvel état |
| **Ordre des événements** | Critique ! L'ordre change le résultat |
| **Single source of truth** | Les events sont la vérité, l'état est dérivé |
| **Replay** | On peut reconstruire l'état à tout moment |

---

## 📝 Règles métier importantes

1. **Stepped** : déplace tous les items d'une position vers la droite
2. **Stations** : items entrent en position 0, sortent à la fin
3. **Paused** : émis quand un item **entre** dans une station (0 → 1+ items)
4. **Resumed** : émis quand **tous** les items ont quitté les stations (1+ → 0 items)
5. **Parsing** : lecture gauche → droite pour `visualizationToEvents`
6. **Items collés** : `S(a)I(i)` ≠ `S(a) I(i)` (pas d'espace = sorti de station)

---

## ✅ Validation finale

- [ ] Tous les exemples du KATA.md passent
- [ ] Tests de round-trip réussis
- [ ] Code propre et bien structuré
