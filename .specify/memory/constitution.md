<!--
SYNC IMPACT REPORT
==================
Version change: (none) → 1.0.0
Action: Initial constitution established.

Added principles:
  - I. Code Quality (new)
  - II. Testing Standards (new)
  - III. User Experience Consistency (new)
  - IV. Performance Requirements (new)

Added sections:
  - Quality Gates (new)
  - Development Workflow (new)
  - Governance (new)

Removed sections: none

Template alignment:
  - .specify/templates/plan-template.md   ✅ Constitution Check section present; Performance Goals field aligns with Principle IV
  - .specify/templates/spec-template.md   ✅ Measurable Outcomes section aligns with Principle IV; User Scenarios align with Principle III
  - .specify/templates/tasks-template.md  ✅ Test-first task ordering (tests before implementation) aligns with Principle II; Performance task in Polish phase aligns with Principle IV

Deferred TODOs:
  - TODO(RATIFICATION_DATE): Set to today (2026-02-21) as this is the initial adoption. Update if a formal sign-off date differs.
-->

# Photoapp Constitution

## Core Principles

### I. Code Quality

Every line of code committed to this project MUST be purposeful, readable, and maintainable.

- Functions and methods MUST have a single, clearly defined responsibility; multi-concern functions MUST be refactored.
- Dead code MUST NOT be committed; remove unused variables, imports, and branches rather than commenting them out.
- Magic numbers and strings MUST NOT appear in implementation code; all constants MUST be named and placed in a dedicated constants module/file.
- Complexity MUST be justified: when a more complex approach is chosen over a simpler one, the rationale MUST be documented in a code comment or the associated spec.
- All code MUST pass linting and formatting checks before review; style debates MUST be resolved by tooling, not by humans.

*Rationale*: A photo app accumulates media-handling, networking, and UI complexity rapidly. Disciplined code quality prevents compounding technical debt that degrades velocity and reliability over time.

### II. Testing Standards

Test-First Development is MANDATORY — no exceptions.

- Tests MUST be written before implementation code is written.
- The Red-Green-Refactor cycle MUST be followed: tests MUST be verified to fail (Red) before any implementation begins (Green), then code MUST be cleaned up (Refactor) without breaking tests.
- Unit tests MUST cover all business logic; a function with no unit test MUST NOT be merged.
- Integration tests MUST cover all inter-component interactions and all API contract boundaries.
- Test coverage for new features MUST NOT fall below 80%; regressions below this threshold MUST block merge.
- Every acceptance scenario defined in a feature specification MUST have a corresponding automated test case.

*Rationale*: Photo apps handle complex state (uploads, edits, caching, permissions). Test-first development surfaces integration failures and regressions before they reach users, making the codebase safe to evolve quickly.

### III. User Experience Consistency

Every user-facing interaction MUST be predictable, accessible, and consistent across the entire application.

- All UI components MUST conform to the project's established design system; ad-hoc styles that diverge from the system MUST NOT be merged without design review and constitution amendment.
- Loading, empty, and error states MUST be implemented for every user-facing data operation — absent states are not acceptable.
- Error messages MUST be written in plain language, explain what went wrong, and tell the user what to do next; raw error codes or stack traces MUST NOT be surfaced to users.
- Accessibility MUST meet WCAG 2.1 AA standards; interactive elements MUST be keyboard and screen-reader navigable.
- Navigation patterns (tab order, back behavior, deep links) MUST be consistent; deviations require explicit justification in the spec.

*Rationale*: Users form trust with photo apps through tactile consistency. Inconsistent states or error handling erode confidence and drive abandonment. Accessibility is non-negotiable as an expression of inclusive design.

### IV. Performance Requirements

The application MUST meet defined performance budgets; regressions MUST be caught before merge.

- Application cold start MUST complete in under 3 seconds on mid-range target devices.
- Photo browsing and rendering MUST achieve 60 fps on supported devices; frame drops are a defect, not a polish item.
- All network requests MUST have a p95 latency target defined in the feature spec; the default ceiling is 500 ms.
- Memory usage MUST NOT exceed 150 MB during normal photo browsing; spikes during upload/edit are permitted but MUST return to baseline within 5 seconds.
- Every feature that introduces a new network call, image decode, or background task MUST include a performance acceptance criterion in its specification.
- Automated performance regression tests MUST run in CI; a measured regression against baselines MUST block merge.

*Rationale*: Photo apps are judged harshly on speed and smoothness. Performance is a first-class feature, not an afterthought. Defining budgets upfront and enforcing them in CI prevents the gradual degradation that makes apps feel sluggish over time.

## Quality Gates

Every pull request MUST satisfy all of the following gates before merging:

- **Tests green**: The full automated test suite MUST pass with zero failures.
- **Coverage maintained**: Test coverage MUST not regress below the 80% threshold defined in Principle II.
- **Lint and format clean**: All linting and formatting checks MUST pass; no suppressions without a documented justification comment.
- **Performance baseline held**: Automated performance benchmarks MUST not regress beyond a 5% tolerance from the recorded baseline.
- **Accessibility check**: Any PR touching UI components MUST pass the automated a11y audit tool integrated in CI.
- **Constitution compliance**: At least one reviewer MUST explicitly verify that the change does not violate any principle; this check MUST be recorded in the code review.
- **No unresolved TODOs**: `TODO` and `FIXME` comments MUST NOT be merged unless they reference a linked, open issue by ID.

## Development Workflow

- **Spec before code**: Every new feature MUST have an approved specification (`spec.md`) before implementation begins. Unspecified features MUST NOT be committed.
- **Branch naming**: Feature branches MUST follow the pattern `[###-feature-name]` where `###` is the issue/ticket number.
- **Constitution check at plan time**: The Implementation Plan MUST include a Constitution Check section that is reviewed against the current constitution before Phase 0 research begins, and re-verified after Phase 1 design.
- **Commit discipline**: Commits MUST be atomic — one logical change per commit. Commit messages MUST be imperative, present-tense, and reference the task ID where applicable.
- **Review cadence**: Code review MUST occur within one business day of PR opening; stale PRs without review MUST be escalated by the author.

## Governance

This constitution supersedes all other development practices and informal agreements. When a conflict exists between a team habit and this document, this document wins.

**Amendment procedure**:
1. Author proposes amendment in writing, referencing the principle(s) affected and the rationale for change.
2. Amendment is discussed and approved by the majority of active contributors.
3. A migration plan MUST be included for any amendment that invalidates existing code or specs.
4. The constitution version MUST be incremented according to the semantic versioning policy below.
5. All dependent templates (`plan-template.md`, `spec-template.md`, `tasks-template.md`) MUST be reviewed and updated within one sprint of the amendment.

**Versioning policy**:
- MAJOR: A principle is removed, fundamentally redefined, or a governance rule is made backward-incompatible.
- MINOR: A new principle or section is added, or existing guidance is materially expanded.
- PATCH: Clarifications, wording improvements, or non-semantic refinements.

**Compliance reviews**: At the start of each development cycle (sprint/milestone), the team MUST review the constitution to confirm it still reflects current practice. If the constitution has drifted from reality, either the code or the constitution MUST be corrected — both cannot be right.

**Version**: 1.0.0 | **Ratified**: 2026-02-21 | **Last Amended**: 2026-02-21
