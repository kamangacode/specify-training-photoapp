# UI Contract: E2E Test Scenarios

**Feature**: `002-ui-centering`
**Type**: Acceptance Test Contract

---

## US1 — Centered Content Layout

### Scenario US1-01: Main page content centered on wide viewport
- **Setup**: App loaded, ≥1 album exists
- **Viewport**: 1440 × 900
- **Action**: Navigate to main page
- **Assert**: Album grid container bounding box has equal left and right distance to viewport edges (within 2px tolerance)

### Scenario US1-02: Main page full-width on mobile
- **Setup**: App loaded, ≥1 album exists
- **Viewport**: 375 × 812
- **Action**: Navigate to main page
- **Assert**: Album grid container width = viewport width minus horizontal padding (≥ viewport width - 30px)

### Scenario US1-03: No horizontal scroll at any viewport width
- **Viewport sequence**: 320, 375, 640, 768, 1024, 1440, 1920, 2560
- **Assert**: `document.documentElement.scrollWidth === document.documentElement.clientWidth` at each breakpoint

### Scenario US1-05: Content has min 16px padding on tablet viewport
- **Setup**: App loaded, ≥1 album exists
- **Viewport**: 768 × 1024
- **Action**: Navigate to main page
- **Assert**: Album grid container has left padding ≥ 16px and right padding ≥ 16px (content does not touch viewport edges)

### Scenario US1-04: Album view photo grid centered on wide viewport
- **Setup**: Open any album with ≥1 photo
- **Viewport**: 1440 × 900
- **Assert**: Photo grid container has equal left and right margin to viewport

---

## US2 — Centered Page Headers & Toolbar

### Scenario US2-01: Toolbar aligns with content on wide screen
- **Viewport**: 1440 × 900
- **Assert**: `toolbar inner wrapper left edge` === `album grid left edge` (within 2px)

### Scenario US2-02: Back button header aligns with photo grid
- **Setup**: Open any album
- **Viewport**: 1440 × 900
- **Assert**: `header container left edge` === `photo grid left edge` (within 2px)

### Scenario US2-03: Trash page header aligns with trash list
- **Setup**: Open trash with ≥1 item
- **Viewport**: 1440 × 900
- **Assert**: `header back button left edge` === `first trash item left edge` (within 2px)

---

## US3 — Centered Empty States & Dialogs

### Scenario US3-01: Empty album list centered
- **Setup**: App loaded with no albums
- **Viewport**: 1440 × 900
- **Assert**: Empty state element is horizontally centered (left offset ≈ right offset ± 4px)

### Scenario US3-02: Empty album view centered
- **Setup**: Open album with no photos
- **Viewport**: 1440 × 900
- **Assert**: Empty state element is horizontally centered

### Scenario US3-03: Empty trash centered
- **Setup**: Trash is empty
- **Viewport**: 1440 × 900
- **Assert**: Empty state element is horizontally centered

### Scenario US3-04: Delete confirmation dialog centered in viewport
- **Setup**: App loaded with ≥1 album containing ≥1 photo
- **Viewport**: 1440 × 900
- **Action**: Trigger delete confirmation dialog (e.g., permanently delete a photo from trash)
- **Assert**: Dialog bounding box center ≈ viewport center (within 8px); overlay (`role="dialog"` or backdrop) covers the full viewport
