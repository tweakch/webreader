---
id: "error-page-simulator"
name: "Error Page Simulator"
type: "app"
flag_key: "error-page-simulator"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "debug"
personas:
  - "08-developers"
related_features:
  - "debug-badges"
parent: null
children: []
---

# Error Page Simulator

**Flag:** `error-page-simulator` · **Lifecycle:** EXPERIMENT · **Default:** off
**Personas:** [Developers](../personas/08-developers.md)

Shows buttons in the Profile Panel to intentionally trigger 404 and 500 error pages.

## Behavior

- Adds an "Error Simulator" section in `ProfilePanel` when active
- **404**: navigates to a non-existent URL (`/does-not-exist`)
- **500**: throws an exception that triggers the `ErrorBoundary`
- Used to verify that error pages render correctly in testing and CI

## Links

- [Back to Feature Matrix](../personas.md)
- [Debug Badges](debug-badges.md) — debug companion
