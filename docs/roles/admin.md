---
id: "admin"
name: "Admin"
emoji: "⚡"
access_level: "SYSTEM"
description: "Full control over features, roles, and content."
features:
  - ALL
---

# ⚡ Admin Role

**Access Level:** SYSTEM
**Purpose:** Full control over features, roles, and content.

## Access Profile

The Admin role is the root-level role for the application. It bypasses all normal feature flag constraints and provides a management interface for the system itself.

## Key Capabilities

| Capability | Description |
|---|---|
| **Feature Visibility** | Access to all features, including those in development or not yet assigned to any role. |
| **Role Management** | Dynamically assign or remove features from the Guest, Subscriber, and Tester roles. |
| **Debug Mode** | Immediate access to all debug tools and page simulators. |
| **Unrestricted Content** | Full visibility into all story metadata and content without filtering. |

## Implementation Notes

Admin status is checked directly in `hooks/useRole.js` via `isAdmin`. This status is used in `ProfilePanel` to render the role-management UI, allowing features to be toggled for other roles on-the-fly.

## Strategic Purpose

The Admin role is the internal development and management portal. It allows the team to ship features, adjust the product offering for different tiers, and troubleshoot issues without requiring a code deployment for simple feature-to-role assignments.

## Links

- [Back to Role Matrix](../roles.md)
- [Tester ←](tester.md)
- [Developers Persona →](../personas/08-developers.md)
