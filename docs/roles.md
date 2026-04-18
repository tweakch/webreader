---
title: "Role Matrix"
description: "Guest, Subscriber, Tester, Sales, and Admin roles"
---

# User Roles — Access Matrix

> 5 roles · Feature-based access control · Configurable via Admin

Roles describe **access control** (what a user is *allowed* to see). Subscription **tiers** describe *what a user is paying for* — see [Subscription Tiers](sales/tiers.md). A user's effective feature set is the intersection of their role and their tier.

## Roles

| Role | Label | Access Level | Purpose |
|---|---|---|---|
| 👤 | [Guest](roles/guest.md) | PUBLIC | Default role for new or anonymous users. |
| 💎 | [Subscriber](roles/subscriber.md) | PAID | Premium users with access to advanced reading tools. |
| 🧪 | [Tester](roles/tester.md) | INTERNAL | QA and beta users with access to experimental features. |
| 💰 | [Sales](roles/sales.md) | INTERNAL | Growth team — demo any tier, generate promo codes, inspect funnel. |
| ⚡ | [Admin](roles/admin.md) | SYSTEM | Full control over features, roles, and content. |

---

## Role Features — Access Control

Role-based access is managed in `hooks/useRole.js`. Admins can dynamically toggle features for other roles.

| Feature Category | [👤](roles/guest.md) | [💎](roles/subscriber.md) | [🧪](roles/tester.md) | [💰](roles/sales.md) | [⚡](roles/admin.md) |
|---|:---:|:---:|:---:|:---:|:---:|
| **Reader Core** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Reader Stats** | | ✓ | ✓ | ✓ | ✓ |
| **Reader UI** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Appearance** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Typography** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Navigation** | | ✓ | ✓ | ✓ | ✓ |
| **Advanced Reading** | | ✓ | ✓ | partial | ✓ |
| **Gen Alpha** | | | ✓ | | ✓ |
| **Tools** | | ✓ | ✓ | ✓ | ✓ |
| **Commerce** | | | | ✓ | ✓ |
| **Debug** | | | ✓ | | ✓ |

---

## Related

- [Personas](personas.md) — user archetypes that map to these roles.
- [Subscription Tiers](sales/tiers.md) — monetization overlay on top of roles.
- [User Stories](sales/user-stories.md) — persona × tier conversion stories.
- [Product Strategy](product-strategy.md) — monetization and platform goals.
