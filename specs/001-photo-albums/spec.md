# Feature Specification: Photo Album Organizer

**Feature Branch**: `001-photo-albums`
**Created**: 2026-02-21
**Status**: Draft
**Input**: User description: "Build an application that can help me organize my photos in separate photo albums. Albums are grouped by date and can be re-organized by dragging and dropping on the main page. Albums are never in other nested albums. Within each album, photos are previewed in a tile-like interface."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Albums on the Main Page (Priority: P1)

A user opens the application and sees all their photo albums displayed on a main page. Each album is represented by a card showing a cover image, the album name, the number of photos it contains, and the date range of the photos inside it. Albums are initially presented in chronological order based on their photo dates.

**Why this priority**: This is the core entry point of the application. Without a usable main page, no other story is accessible. It is the minimum viable view that proves the application works.

**Independent Test**: Can be fully tested by launching the app with pre-seeded albums and verifying that album cards appear with correct names, photo counts, and date ranges.

**Acceptance Scenarios**:

1. **Given** the app has one or more albums, **When** the user opens the main page, **Then** each album is displayed as a card with its cover photo, name, photo count, and date range visible.
2. **Given** the app has multiple albums, **When** the main page loads for the first time, **Then** albums are ordered from most recent to oldest based on the latest photo date in each album.
3. **Given** the app has no albums yet, **When** the user opens the main page, **Then** a clear empty state message is shown prompting the user to create their first album.

---

### User Story 2 - Create an Album and Add Photos (Priority: P1)

A user creates a new album by giving it a name, then adds photos to it by selecting image files from their device. After adding photos, the album appears on the main page with the correct date range derived from the photos' embedded date metadata.

**Why this priority**: Without the ability to create albums and populate them with photos, the app has no data to work with. This is the foundational write operation.

**Independent Test**: Can be fully tested by creating an album, adding photos, and verifying the album appears on the main page with correct metadata — no other stories need to be complete.

**Acceptance Scenarios**:

1. **Given** the user is on the main page, **When** they initiate album creation and provide a name, **Then** a new empty album is created and visible on the main page.
2. **Given** an album exists, **When** the user selects one or more image files from their device and adds them to the album, **Then** the photos appear in the album and the album's date range and cover image update accordingly.
3. **Given** a photo has embedded date metadata, **When** it is added to an album, **Then** the album's date range reflects the actual date the photo was taken, not the date it was added.
4. **Given** a photo has no embedded date metadata, **When** it is added to an album, **Then** the date of import is used as the fallback photo date.
5. **Given** an album already exists, **When** the user attempts to place it inside another album, **Then** the action is prevented and the user receives a clear message that albums cannot be nested.

---

### User Story 3 - View and Sort Photos Inside an Album (Priority: P2)

A user opens an album and sees all its photos laid out in a tile grid, sorted by date (oldest first) by default. The user can switch to a manual sort mode and drag-and-drop photos within the grid to reorder them. The chosen sort mode persists with the album.

**Why this priority**: Viewing album contents is the primary consumption experience. It depends on albums and photos existing (US1, US2) but delivers its own independent value once photos are present.

**Independent Test**: Can be fully tested by opening an album containing pre-loaded photos, verifying date order, switching to manual mode, reordering a photo, and confirming the new order persists.

**Acceptance Scenarios**:

1. **Given** an album contains photos, **When** the user opens the album, **Then** all photos are displayed as square or uniformly sized preview tiles arranged in a grid, ordered by date (oldest first) by default.
2. **Given** an album is in date sort mode, **When** the user switches to manual sort mode, **Then** the existing date order is preserved as the starting manual order and photos become drag-and-droppable within the grid.
3. **Given** an album is in manual sort mode, **When** the user drags a photo tile to a new position and releases, **Then** the photo moves to that position with immediate visual feedback.
4. **Given** the user has set a manual order, **When** they switch back to date sort mode, **Then** photos revert to date order; the manual order is retained in case they switch back to manual.
5. **Given** an album contains photos, **When** the user clicks a photo tile, **Then** the photo opens full-size in a lightbox overlay on top of the album view.
6. **Given** the lightbox is open, **When** the user navigates to the previous or next photo, **Then** the lightbox displays the adjacent photo without closing.
7. **Given** the lightbox is open, **When** the user dismisses it (via a close control, pressing Escape, or clicking outside the photo), **Then** the lightbox closes and the album tile view is visible again.
8. **Given** an album contains many photos, **When** the user scrolls through the album, **Then** all photos remain accessible without layout breaks or missing tiles.
9. **Given** an album contains no photos, **When** the user opens it, **Then** an empty state message is shown with an option to add photos.

---

### User Story 4 - Reorder Albums via Drag and Drop (Priority: P2)

A user reorders their albums on the main page by dragging an album card to a different position and dropping it. The new order is saved and persists the next time the user opens the application.

**Why this priority**: Custom ordering is a differentiating feature of this app. It depends on multiple albums existing but can be tested independently once US1 and US2 deliver albums.

**Independent Test**: Can be fully tested by dragging one album before another, closing and reopening the app, and verifying the custom order is preserved.

**Acceptance Scenarios**:

1. **Given** multiple albums are visible on the main page, **When** the user drags an album card to a new position and releases it, **Then** the album moves to that position immediately with clear visual feedback during the drag.
2. **Given** the user has reordered albums via drag and drop, **When** they close and reopen the application, **Then** the custom album order is preserved exactly as they left it.
3. **Given** the user has set a custom album order, **When** a new album is created, **Then** the new album is added at the end of the current custom order (not inserted into the middle).

---

### User Story 5 - Manage Albums and Photos (Priority: P3)

A user can rename or delete an album, remove individual photos from an album to a Trash area, restore trashed photos, and permanently delete photos from the Trash. Destructive actions require a confirmation step.

**Why this priority**: Management operations are important for long-term usability but are not required for the core experience. They can be added after the primary flows are working.

**Independent Test**: Can be fully tested by renaming an album, deleting an album, sending a photo to Trash, restoring it, and permanently deleting it — all verifiable independently from other stories.

**Acceptance Scenarios**:

1. **Given** an album exists, **When** the user renames it and confirms, **Then** the album displays the new name immediately on the main page.
2. **Given** an album exists, **When** the user initiates deletion, **Then** a confirmation prompt appears before any data is removed.
3. **Given** the user confirms album deletion, **When** the action completes, **Then** the album is removed from the main page and its photos move to the Trash.
4. **Given** the user cancels a deletion, **When** they dismiss the confirmation prompt, **Then** the album and its photos remain unchanged.
5. **Given** a photo is in an album, **When** the user removes it, **Then** the photo moves to the Trash and is no longer visible in the album.
6. **Given** a photo is in the Trash, **When** the user restores it, **Then** the photo returns to its original album (if the album still exists) or the user is prompted to select a destination album.
7. **Given** a photo is in the Trash, **When** the user permanently deletes it and confirms, **Then** the photo is removed from the application entirely.
8. **Given** the Trash contains photos, **When** the user views the Trash, **Then** all trashed photos are listed with their original album name and removal date visible.

---

### Edge Cases

- What happens when the user adds a file that is not a valid image format? The system rejects it and shows a descriptive error message; valid files in the same selection are still imported.
- What happens when an album's only photo is moved to Trash? The album remains but displays its empty state.
- What happens when a user tries to restore a trashed photo whose original album has been deleted? The user is prompted to select a different destination album.
- What happens if two albums have the same name? The system allows it (names are not unique identifiers) but the albums remain independently addressable.
- What happens when the user drops an album onto itself during drag? The album returns to its original position with no change.
- What happens when the lightbox is open on the first photo and the user navigates backwards, or on the last photo and navigates forwards? Navigation wraps around to the other end of the album.

## Clarifications

### Session 2026-02-21

- Q: Where should the application store album data and photos between sessions? → A: Local file — user explicitly exports a save file to their device and imports it to restore their work.
- Q: Can users remove individual photos from an album? → A: Yes — with a trash/recycle area; photos are moved to Trash before permanent deletion and can be restored.
- Q: How are photos ordered within an album tile view? → A: Default date sort (oldest first) with a toggle to switch to manual drag-and-drop order within the album.
- Q: What is the concrete time target for photo tiles to render when opening an album? → A: All tiles visible in the initial viewport render within 500ms; off-screen tiles load progressively as the user scrolls.
- Q: Can users view a photo at full size by clicking its tile? → A: Yes — clicking a tile opens the photo full-size in a lightbox overlay within the album view, with previous/next navigation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST display all albums on a single main page.
- **FR-002**: Each album card on the main page MUST display a cover image, album name, photo count, and date range derived from the photos' dates.
- **FR-003**: Albums MUST default to chronological order (most recent first, by each album's latest photo date) until the user performs their first drag-and-drop reorder. Once the user has manually reordered albums, the custom `albumOrder` array is used as-is. A new album created after a manual reorder is appended at the end of the custom order (see FR-008, FR-015).
- **FR-004**: Users MUST be able to create a new album by providing a name.
- **FR-005**: Users MUST be able to add photos to an album by selecting image files from their device.
- **FR-006**: Album date ranges MUST be calculated from embedded photo date metadata; when metadata is absent the import date MUST be used as a fallback.
- **FR-007**: Photos within an album MUST be displayed in a tile/grid layout showing a visual preview of each photo, ordered by date (oldest first) by default.
- **FR-007a**: Albums MUST support a manual sort mode toggled by the user; in manual mode, photos MUST be reorderable via drag-and-drop within the tile grid.
- **FR-007b**: The active sort mode (date or manual) and the manual photo order MUST be saved per album and included in the exported save file.
- **FR-008**: Users MUST be able to reorder albums on the main page by dragging and dropping album cards.
- **FR-009**: Custom album order MUST be included in the exported save file and restored correctly when that file is imported.
- **FR-010**: Albums MUST exist only at the top level; nesting one album inside another MUST be technically prevented, not just discouraged.
- **FR-011**: Users MUST be able to rename an existing album.
- **FR-012**: Users MUST be able to delete an album with a confirmation step before data is removed.
- **FR-013**: The application MUST show clear empty states when no albums exist and when an album contains no photos.
- **FR-014**: The application MUST run in a standard web browser without requiring installation; photos MUST be selectable via the browser's native file picker dialog.
- **FR-015**: Albums MUST be created manually by the user with a freely chosen name; the system MUST display a derived date range on each album card based on the photos it contains, but MUST NOT automatically create or name albums from photo date metadata.
- **FR-016**: Users MUST be able to export all albums and their photos to a single save file downloadable to their device.
- **FR-017**: Users MUST be able to import a previously exported save file to restore all albums and photos.
- **FR-018**: The application MUST warn users with an unsaved-changes indicator whenever albums or photos have been modified since the last export.
- **FR-019**: Users MUST be able to move individual photos from an album to a Trash area without immediately and permanently deleting them.
- **FR-020**: The application MUST provide a dedicated Trash view listing all trashed photos with their original album name and removal date.
- **FR-021**: Users MUST be able to restore a trashed photo to its original album; if the original album no longer exists, the user MUST be prompted to select a destination album.
- **FR-022**: Users MUST be able to permanently delete individual photos from the Trash, with a confirmation step before removal.
- **FR-023**: The Trash contents MUST be included in the exported save file and restored correctly on import.
- **FR-024**: Clicking a photo tile MUST open that photo at full size in a lightbox overlay within the album view.
- **FR-025**: The lightbox MUST provide previous and next navigation controls to move between photos in the album without closing the lightbox.
- **FR-026**: The lightbox MUST close when the user activates a close control, presses Escape, or clicks outside the photo area.

### Key Entities

- **Album**: A named container for photos. Has a name, a derived date range (earliest and latest photo date), a cover image (first or user-selected photo), a custom sort position on the main page, an active photo sort mode (date or manual), and a flat list of photos. Cannot contain other albums.
- **Photo**: An image file stored within exactly one album or held in the Trash. Has a preview representation, a date (from metadata or import date), a manual sort position within its album (used when the album is in manual sort mode), belongs to one album, and retains a reference to its original album when trashed.
- **Trash**: A system-managed holding area for photos removed from albums but not yet permanently deleted. Each trashed photo retains its original album reference and removal date.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new album and add at least one photo to it in under 2 minutes on their first use.
- **SC-002**: The main page renders all album cards within 2 seconds for collections of up to 50 albums.
- **SC-003**: All photo tiles visible in the initial viewport render within 500ms of opening an album; off-screen tiles load progressively as the user scrolls, with no missing or broken tiles for albums containing up to 200 photos.
- **SC-004**: Drag-and-drop reordering provides immediate visual feedback; the album snaps to its new position within 100 ms of the user releasing it.
- **SC-005**: Custom album order is correctly restored 100% of the time when a valid save file is imported.
- **SC-006**: Zero instances of an album appearing nested inside another album under any usage scenario.
- **SC-007**: Users can complete album rename and album delete flows in under 30 seconds each.

## Assumptions

- The application runs in a web browser; photos are selected from the user's local device via the browser's file picker. No cloud storage or remote photo source is required for this initial version.
- Data is not automatically persisted between browser sessions; the user is responsible for exporting a save file before closing the app and importing it when returning.
- Each photo belongs to exactly one album; moving a photo between albums is out of scope for this version.
- There is no user account or multi-user support; the app serves a single user on a single device.
- "Grouped by date" means albums display a derived date range from their photos' dates, and default ordering on the main page is chronological. It does not imply automatic album creation by date bucket unless clarified otherwise (see FR-015).
- Cover image for an album defaults to the first photo added; user customization of the cover is out of scope for this version.
