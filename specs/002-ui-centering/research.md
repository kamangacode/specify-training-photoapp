# Research: UI Centering & Layout

**Branch**: `001-ui-centering` | **Date**: 2026-02-26

## Decisions

### Decision 1 — Approche de centrage

**Decision**: Ajouter un token CSS `--page-max-width` dans `tokens.css` et l'appliquer directement dans les modules CSS des vues (pas de classe utilitaire globale).

**Rationale**: Le projet utilise des CSS Modules purs sans classes utilitaires globales. Ajouter une classe `.page-content` dans `globals.css` casserait la convention établie. Les modules de chaque vue appliquent leur propre contrainte `max-width` via le token partagé — cohérence sans couplage.

**Alternatives considered**:
- *Classe utilitaire globale* (`.page-content { max-width: var(--page-max-width); margin: 0 auto; }`) : rejetée car le projet n'a pas d'autres classes utilitaires globales — incohérence avec la convention CSS Modules.
- *Wrapper component React* : rejeté car ajoute une indirection sans valeur — modification CSS pure suffisante.

**Value**: `--page-max-width: 1100px` (cohérent avec la spec FR-001 "viewports wider than 1100px")

---

### Decision 2 — Alignement toolbar/contenu

**Decision**: Appliquer le même `max-width` et `margin: 0 auto` au `.toolbar` dans `Toolbar.module.css`, pas à l'élément sticky parent.

**Rationale**: Le toolbar occupe toute la largeur pour l'arrière-plan sticky. C'est l'**intérieur** du toolbar qui doit être contraint — le fond coloré peut rester pleine largeur (pattern standard des headers de sites web).

**Alternatives considered**:
- Contraindre toute la barre sticky à max-width : rejeté car laisse un fond coupé visuellement désagréable sur grands écrans.

---

### Decision 3 — Responsive mobile

**Decision**: En dessous de 640px (breakpoint existant dans tokens.css), pas de max-width — `width: 100%` avec `padding: 0 var(--spacing-3)` (12px).

**Rationale**: Le breakpoint `640px` est déjà utilisé dans le projet (tokens.css). Réutiliser cette valeur assure la cohérence. La spec demande un comportement full-width sous 600px — 640px est conservative et safe.

---

### Decision 4 — Empty states déjà centrés

**Decision**: `EmptyState.module.css` utilise déjà du flex centering. Aucune modification nécessaire. L'US3 nécessite uniquement de vérifier que les empty states héritent du container centré de leurs pages parentes.

**Rationale**: L'exploration confirme que `.emptyWrapper` est déjà `display: flex; align-items: center; justify-content: center`. Le travail US3 sera principalement de vérifier que la hauteur disponible est correcte dans chaque contexte.

---

### Decision 5 — Dialogs

**Decision**: `ConfirmDialog` est déjà centré (`max-width: 420px; width: 90vw;` positionné par l'overlay). Aucune modification nécessaire.

**Rationale**: L'exploration confirme que le dialog utilise déjà un overlay fixed + flex centering. L'album picker dans TrashItem est le seul dialog non-overlay à vérifier.
