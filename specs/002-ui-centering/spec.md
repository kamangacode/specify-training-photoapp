# Feature Specification: UI Centering & Layout

**Feature Branch**: `001-ui-centering`
**Created**: 2026-02-26
**Status**: Draft
**Input**: User description: "améliore UI en utilisant le skill frontend. Centre plus les éléments et les informations sur la page"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Centered Content Layout (Priority: P1)

As a user browsing the app on a wide screen, all main content (album grid, photo grid, trash list) should be centered horizontally within a constrained max-width area, so that the content doesn't stretch uncomfortably across the full viewport width and remains easy to scan.

**Why this priority**: This is the most visible improvement — on screens wider than ~1200px, content currently spans the full width, making it hard to read and visually unbalanced. A centered max-width container immediately improves the overall perception of quality.

**Independent Test**: Can be tested by resizing the browser to a wide viewport (>1200px) and verifying all main page content stays centered within a readable column.

**Acceptance Scenarios**:

1. **Given** the app is open on a screen wider than 1100px, **When** the user views the album list, **Then** the album grid is horizontally centered with equal empty margins on both sides
2. **Given** the app is open on a screen wider than 1100px, **When** the user views photos inside an album, **Then** the photo grid is horizontally centered with equal margins
3. **Given** the app is open on a mobile screen (<600px), **When** the user views any page, **Then** the content fills the available width without horizontal margins
4. **Given** the app is open on a medium screen (600–1100px), **When** the user navigates, **Then** the content fills the width with comfortable padding on both sides

---

### User Story 2 - Centered Page Headers & Toolbar (Priority: P2)

As a user, the page title, back button, and toolbar actions (Export, Import, Trash) should feel visually balanced and aligned — not pushed to the edges. The header bar should have consistent horizontal padding that matches the content area below it.

**Why this priority**: The header is the first thing a user sees on every page. Misalignment between the header and the content below it creates a disjointed feel.

**Independent Test**: Can be tested by viewing any page with a header (album list, single album, trash) and confirming the header elements align with the content below.

**Acceptance Scenarios**:

1. **Given** the user is on the main albums page, **When** they look at the toolbar, **Then** the toolbar's left and right edges align with the album grid's left and right edges
2. **Given** the user opens a specific album, **When** they view the header with the back button and album title, **Then** the header content aligns with the photo grid below
3. **Given** the user opens the Trash page, **When** they view the header, **Then** the back button and "Trash" title are visually aligned with the trash item list below

---

### User Story 3 - Centered Empty States & Dialogs (Priority: P3)

As a user encountering an empty state (no albums, no photos, empty trash) or a confirmation dialog, these elements should appear centered both horizontally and vertically in their container, with sufficient breathing room around the message.

**Why this priority**: Empty states and dialogs are secondary flows but important for polish. Poorly positioned empty states make the app feel unfinished.

**Independent Test**: Can be tested by navigating to each empty state (clear all albums, view empty trash) and verifying the message is visually centered.

**Acceptance Scenarios**:

1. **Given** the user has no albums, **When** they open the app, **Then** the empty state message is centered both horizontally and vertically in the available content area
2. **Given** an album has no photos, **When** the user opens it, **Then** the empty state is centered in the photo display area
3. **Given** the user triggers a delete confirmation dialog, **When** the dialog appears, **Then** it is centered in the viewport with an overlay behind it

---

### Edge Cases

- What happens on very small screens (<320px)? Content should remain readable without horizontal scrolling.
- What happens when the album or photo name is very long? Centering should not break the layout — long names should truncate or wrap.
- What happens when a dialog is triggered on mobile? The dialog should remain within the viewport bounds.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All main content areas (album grid, photo grid, trash list) MUST be horizontally centered within a max-width container on viewports wider than 1100px
- **FR-002**: The max-width of the centered content area MUST be consistent across all pages (same constraint on album list, album view, and trash pages)
- **FR-003**: Page headers and toolbar MUST be horizontally aligned with the content area below them on all screen sizes
- **FR-004**: Empty state messages MUST be horizontally and vertically centered within their display area
- **FR-005**: Confirmation dialogs MUST be centered in the viewport with a semi-transparent overlay covering the rest of the page
- **FR-006**: On screens narrower than 600px, all content MUST fill the available width with minimum side padding (no constraining max-width)
- **FR-007**: Centering MUST NOT require scrolling in any direction on the viewport size where the layout is applied

### Assumptions

- Max-width target: ~1100px (consistent with the existing `001-modern-ui` design tokens if any are defined)
- Content padding inside the container: ~16–24px on each side
- Mobile breakpoint: 600px
- No new navigation structure is introduced — this is purely a layout/spacing change

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On viewports wider than 1100px, the main content column is centered with equal left and right margins (verifiable by visual inspection or automated screenshot comparison)
- **SC-002**: On all three main pages (album list, album view, trash), the header/toolbar aligns with the content column below — zero pixel offset between header edge and content edge
- **SC-003**: Empty state messages appear centered (horizontally and vertically) in 100% of empty state scenarios across all pages
- **SC-004**: All existing E2E tests continue to pass after the layout change (no regression)
- **SC-005**: The layout remains usable (no content cut-off, no horizontal scroll) on screen widths from 320px to 2560px
