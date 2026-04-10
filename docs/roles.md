---
title: "Role Matrix"
description: "Guest, Subscriber, Tester, and Admin roles"
---

# User Roles — Access Matrix

> 4 roles · Feature-based access control · Configurable via Admin

## Roles

| Role | Label | Access Level | Purpose |
|---|---|---|---|
| 👤 | [Guest](roles/guest.md) | PUBLIC | Default role for new or anonymous users. |
| 💎 | [Subscriber](roles/subscriber.md) | PAID | Premium users with access to advanced reading tools. |
| 🧪 | [Tester](roles/tester.md) | INTERNAL | QA and beta users with access to experimental features. |
| ⚡ | [Admin](roles/admin.md) | SYSTEM | Full control over features, roles, and content. |

---

## Role Features — Access Control

Role-based access is managed in `hooks/useRole.js`. Admins can dynamically toggle features for other roles.

| Feature Category | [👤](roles/guest.md) | [💎](roles/subscriber.md) | [🧪](roles/tester.md) | [⚡](roles/admin.md) |
|---|:---:|:---:|:---:|:---:|
| **Reader Core** | ✓ | ✓ | ✓ | ✓ |
| **Reader Stats** | | ✓ | ✓ | ✓ |
| **Reader UI** | ✓ | ✓ | ✓ | ✓ |
| **Appearance** | ✓ | ✓ | ✓ | ✓ |
| **Typography** | ✓ | ✓ | ✓ | ✓ |
| **Navigation** | | ✓ | ✓ | ✓ |
| **Advanced Reading** | | ✓ | ✓ | ✓ |
| **Gen Alpha** | | | ✓ | ✓ |
| **Tools** | | ✓ | ✓ | ✓ |
| **Debug** | | | ✓ | ✓ |

---

## Related

- [Personas](personas.md) — user archetypes that map to these roles.
- [Product Strategy](product-strategy.md) — monetization and platform goals.
