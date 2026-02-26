# Implementation Plan: UI Centering & Layout

**Branch**: `001-ui-centering` | **Date**: 2026-02-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ui-centering/spec.md`

## Summary

Toutes les pages de l'application (album list, album view, trash) s'étendent actuellement sur toute la largeur du viewport. Ce plan ajoute un token CSS `--page-max-width: 1100px` et l'applique aux conteneurs de contenu principaux, aux headers et au toolbar pour obtenir un centrage horizontal cohérent sur les grands écrans, tout en préservant un affichage pleine largeur sur mobile.

## Technical Context

**Language/Version**: TypeScript 5.x + React 18
**Primary Dependencies**: CSS Modules (zero runtime), Vite 5, React
**Storage**: N/A (pure UI/CSS change)
**Testing**: Vitest (unit/hook tests), Playwright (E2E + viewport tests)
**Target Platform**: Web browser (desktop + mobile)
**Project Type**: SPA frontend
**Performance Goals**: 60 fps, aucune régression de layout shift (CLS)
**Constraints**: WCAG 2.1 AA maintenu, zero régression sur les 87 tests Vitest et 59+ tests Playwright existants
**Scale/Scope**: 3 pages vues, ~8 fichiers CSS modifiés, 0 nouveau composant React

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Statut | Notes |
|----------|--------|-------|
| **I. Code Quality** | ✅ PASS | Modifications CSS pures, aucun magic number (token `--page-max-width`), aucune dead code |
| **II. Testing Standards** | ✅ PASS | Nouveaux tests E2E viewport pour chaque US ; tests existants doivent rester verts |
| **III. UX Consistency** | ✅ PASS | Cette feature IS le principe III — cohérence de layout, accessibilité maintenue |
| **IV. Performance** | ✅ PASS | Aucun nouveau réseau call, aucun decode image ; CSS pur = 0 impact runtime |

**Quality Gates applicables** :
- Tests green (Vitest 87 + Playwright existants) ← obligatoire
- Coverage ≥ 80% ← les nouveaux tests E2E couvrent tous les scénarios des contrats
- Lint/format clean ← aucune modification TypeScript significative
- Accessibility check ← WCAG AA maintenu (aucun changement d'interactivité)

**Aucune violation** → pas de section Complexity Tracking nécessaire.

## Project Structure

### Documentation (this feature)

```text
specs/001-ui-centering/
├── plan.md              ← ce fichier
├── research.md          ← Phase 0 (complété)
├── contracts/
│   ├── layout-breakpoints.md   ← breakpoints + acceptance matrix
│   └── e2e-scenarios.md        ← scénarios Playwright à implémenter
└── tasks.md             ← Phase 2 output (/speckit.tasks — à générer)
```

### Source Code — fichiers à modifier

```text
src/
├── styles/
│   └── tokens.css               ← [US1] ajouter --page-max-width: 1100px
│
├── views/
│   ├── MainPage.module.css      ← [US1] .main : max-width + margin: 0 auto
│   │                               [US2] ajouter .pageHeaderInner
│   ├── MainPage.tsx             ← [US2] wrapper div dans pageHeader
│   └── TrashPage.module.css     ← [US1] .main : max-width + margin: 0 auto
│                                   [US3] min-height sur .main
│
├── components/
│   ├── common/
│   │   ├── Toolbar.tsx          ← [US2] ajouter wrapper .toolbarInner
│   │   └── Toolbar.module.css   ← [US2] .toolbarInner : max-width + margin: 0 auto
│   │
│   ├── albums/
│   │   ├── AlbumView.module.css ← [US1] .body : max-width + margin: 0 auto
│   │   │                           [US2] ajouter .headerInner
│   │   └── AlbumView.tsx        ← [US2] wrapper div dans header
│   │
│   └── trash/
│       └── TrashView.module.css ← vérifier que .container hérite du centering
│
└── tests/e2e/
    └── ui-centering.spec.ts     ← [US1+US2+US3] nouveaux tests Playwright viewport
```

## Implementation Strategy

### US1 — Centered Content Layout (P1) — CSS uniquement

Approche : ajouter le token, puis appliquer aux conteneurs `.main` et `.body` :
```css
max-width: var(--page-max-width);
margin: 0 auto;
width: 100%;
padding: 0 var(--spacing-6);
```
Responsive `@media (max-width: 640px)` : retire `max-width`, réduit padding à `var(--spacing-3)`.

Pas de nouveau composant React — modification CSS pure.

### US2 — Centered Headers & Toolbar (P2) — 2 fichiers TSX + CSS

Le fond coloré des headers reste pleine largeur. Un `<div>` interne contraint le contenu au même max-width.

- `Toolbar.tsx` : ajouter `<div className={styles.toolbarInner}>` autour des boutons
- `MainPage.tsx` : ajouter `<div className={styles.pageHeaderInner}>` autour des enfants du `.pageHeader`
- `AlbumView.tsx` : ajouter `<div className={styles.headerInner}>` autour des enfants du `.header`

### US3 — Centered Empty States (P3) — CSS uniquement

`EmptyState` utilise déjà `display: flex; align-items: center; justify-content: center`. Il suffit que les zones `.main`/`.body` aient un `min-height` pour que le centrage vertical soit visible (ex: `min-height: 60vh`).

### Tests E2E

Nouveaux tests Playwright dans `tests/e2e/ui-centering.spec.ts` couvrant les 9 scénarios définis dans `contracts/e2e-scenarios.md`, avec `page.setViewportSize()` pour les tests viewport.

## Test Commands

```bash
# Unit/hook tests (zero régression attendue)
npm run test

# E2E — existants + nouveaux tests viewport
npx playwright test

# Lint
npm run lint
```
