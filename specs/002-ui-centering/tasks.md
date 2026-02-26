# Tasks: UI Centering & Layout

**Input**: Design documents from `/specs/002-ui-centering/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, contracts/ ✓

**Shared files analysis**:
- `MainPage.module.css` → US1, US2, US3 → SÉQUENTIEL
- `AlbumView.module.css` → US1, US2, US3 → SÉQUENTIEL
- `TrashPage.module.css` → US1, US3 → SÉQUENTIEL
- `tests/e2e/ui-centering.spec.ts` → US1, US2, US3 (chaque US ajoute ses scénarios)

**Ordre d'exécution** : Setup → US1 → US2 → US3 → Polish

---

## Phase 1: Setup (Prérequis partagé)

**Purpose**: Ajouter le token CSS fondamental — bloque toutes les USs

- [X] T001 Ajouter `--page-max-width: 1100px` dans `src/styles/tokens.css` (section Sizes ou Layout)

**Checkpoint**: Token disponible → US1 peut commencer

---

## Phase 2: User Story 1 - Centered Content Layout (Priority: P1) 🎯 MVP

**Goal**: Les zones de contenu principal (album grid, photo grid, trash list) sont centrées horizontalement avec max-width sur les grands écrans.

**Independent Test**: Ouvrir l'app à 1440px de large → vérifier que le contenu n'occupe pas toute la largeur et est centré.

### Implémentation US1

- [X] T002 [US1] Ajouter max-width centering à `.main` dans `src/views/MainPage.module.css` : `max-width: var(--page-max-width); margin: 0 auto; width: 100%; padding: 0 var(--spacing-6);` + media query mobile `@media (max-width: 640px)` avec `max-width: none; padding: 0 var(--spacing-3);`
- [X] T003 [US1] Ajouter max-width centering à `.body` dans `src/components/albums/AlbumView.module.css` : même règles que T002
- [X] T004 [US1] Ajouter max-width centering à `.main` dans `src/views/TrashPage.module.css` : même règles que T002
- [X] T005 [US1] Créer `tests/e2e/ui-centering.spec.ts` avec les scénarios US1-01 à US1-04 du contrat `contracts/e2e-scenarios.md` (viewport tests avec `page.setViewportSize()`)

**Checkpoint**: Album grid, photo grid et trash list sont centrés à 1440px → US1 testable indépendamment

---

## Phase 3: User Story 2 - Centered Page Headers & Toolbar (Priority: P2)

**Goal**: Les headers de page et le toolbar ont un contenu intérieur contraint à max-width, aligné avec la zone de contenu.

**Independent Test**: À 1440px, le bord gauche du toolbar et du header est aligné avec le bord gauche du grid en dessous.

### Implémentation US2

- [X] T006 [US2] Ajouter `.toolbarInner` dans `src/components/common/Toolbar.module.css` : `max-width: var(--page-max-width); margin: 0 auto; width: 100%; padding: 0 var(--spacing-6); display: flex; align-items: center; gap: var(--spacing-2); flex-wrap: wrap;` + media query mobile
- [X] T007 [US2] Wrapper le contenu de `Toolbar.tsx` dans `<div className={styles.toolbarInner}>` — les boutons Export/Import/Trash et l'input hidden deviennent enfants de ce wrapper
- [X] T008 [US2] Ajouter `.pageHeaderInner` dans `src/views/MainPage.module.css` : `max-width: var(--page-max-width); margin: 0 auto; width: 100%; display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-4); padding: 0 var(--spacing-6);` + media query mobile
- [X] T009 [US2] Wrapper le contenu du `<header>` dans `MainPage.tsx` dans `<div className={styles.pageHeaderInner}>` (h1 + create button)
- [X] T010 [US2] Ajouter `.headerInner` dans `src/components/albums/AlbumView.module.css` : mêmes règles flex que T008
- [X] T011 [US2] Wrapper le contenu du header dans `AlbumView.tsx` dans `<div className={styles.headerInner}>` (back button + title + actions)
- [X] T012 [US2] Ajouter les scénarios US2-01 à US2-03 dans `tests/e2e/ui-centering.spec.ts`

**Checkpoint**: Toolbar et headers alignés avec le contenu → US2 testable indépendamment

---

## Phase 4: User Story 3 - Centered Empty States (Priority: P3)

**Goal**: Les empty states sont centrés verticalement dans leur zone d'affichage.

**Independent Test**: Vider les albums → l'empty state s'affiche centré verticalement et horizontalement.

### Implémentation US3

- [ ] T013 [US3] Ajouter `min-height: 60vh` à `.main` dans `src/views/MainPage.module.css` (le flex existant centrera l'EmptyState verticalement)
- [ ] T014 [US3] Ajouter `min-height: 60vh` à `.body` dans `src/components/albums/AlbumView.module.css`
- [ ] T015 [US3] Ajouter `min-height: 60vh` à `.main` dans `src/views/TrashPage.module.css`
- [ ] T016 [US3] Ajouter les scénarios US3-01 à US3-03 dans `tests/e2e/ui-centering.spec.ts`
- [ ] T016b [US3] Vérifier que `ConfirmDialog` est centré dans le viewport (déjà implémenté via overlay fixed+flex dans `ConfirmDialog.module.css`) — ajouter scénario US3-04 dans `tests/e2e/ui-centering.spec.ts`

**Checkpoint**: Tous les empty states sont centrés → US3 testable indépendamment

---

## Phase 5: Polish & Validation

**Purpose**: Vérification finale multi-US

- [ ] T017 [P] Exécuter la suite de tests unitaires complète : `npm run test` (0 régression attendue — pas de logique JS modifiée)
- [ ] T018 [P] Exécuter les tests Playwright : `npx playwright test` (tests existants + nouveaux tests viewport)
- [ ] T019 [P] Vérifier lint : `npm run lint` (uniquement CSS + 3 petites modifications TSX)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1 — T001)** : aucune dépendance → à faire en premier
- **US1 (Phase 2)** : dépend de T001 (token)
- **US2 (Phase 3)** : dépend de US1 (les inner wrappers s'appuient sur les conteneurs centrés de US1)
- **US3 (Phase 4)** : dépend de US1 (les zones `.main`/`.body` doivent exister avec leur padding)
- **Polish (Phase 5)** : dépend de US1 + US2 + US3

### Fichiers partagés → exécution SÉQUENTIELLE obligatoire

| Fichier | USs qui le touchent | Ordre |
|---------|---------------------|-------|
| `MainPage.module.css` | US1 (T002) → US2 (T008) → US3 (T013) | US1 puis US2 puis US3 |
| `AlbumView.module.css` | US1 (T003) → US2 (T010) → US3 (T014) | US1 puis US2 puis US3 |
| `TrashPage.module.css` | US1 (T004) → US3 (T015) | US1 puis US3 |
| `ui-centering.spec.ts` | US1 (T005) → US2 (T012) → US3 (T016) | crée puis append |

### Opportunités parallèles (au sein de chaque US)

```bash
# US1 — T002, T003, T004 touchent des fichiers différents → parallèle
Task engineer: "T002 — MainPage.module.css centering"
Task engineer: "T003 — AlbumView.module.css centering"
Task engineer: "T004 — TrashPage.module.css centering"
# T005 dépend de T002/T003/T004 (les selectors doivent exister) → séquentiel après

# US2 — T006+T007 (Toolbar), T008+T009 (MainPage), T010+T011 (AlbumView) → 3 groupes parallèles
Task engineer: "T006+T007 — Toolbar inner wrapper"
Task engineer: "T008+T009 — MainPage header inner wrapper"
Task engineer: "T010+T011 — AlbumView header inner wrapper"
# T012 (tests) → séquentiel après

# Polish — T017, T018, T019 → parallèle
```

---

## Implementation Strategy

### MVP (US1 seule)
1. T001 — token
2. T002 → T004 — CSS centering (parallèle)
3. T005 — tests viewport
→ App centrée, demo possible

### Livraison incrémentale
1. US1 (T001–T005) → centrage contenu ✓
2. US2 (T006–T012) → centrage headers ✓
3. US3 (T013–T016) → centrage empty states ✓
4. Polish (T017–T019) → validation finale ✓
