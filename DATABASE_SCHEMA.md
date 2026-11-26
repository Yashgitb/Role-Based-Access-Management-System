# Database Schema Documentation

The MongoDB database maintains exactly two collections: **`users`** and **`roles`**.

---

## 1. `roles` Collection (`Role` Model)

Defined in [Role.js](file:///d:/Role-Based-Access-Management-System/Backend/src/models/Role.js).

### Fields

| Field | Type | Constraints / Validation | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Auto-generated primary key | — | Unique role identifier |
| `name` | `String` | `required: true`, `unique: true`, `trim: true` | — | Dynamic role name (no `enum` restriction so custom roles are supported) |
| `permissions` | `Object` | Embedded module subdocuments (`permissionSchema`) | See below | Module-wise CRUD permissions |
| `createdAt` | `Date` | Managed via `{ timestamps: true }` | Auto | Creation timestamp |
| `updatedAt` | `Date` | Managed via `{ timestamps: true }` | Auto | Last modification timestamp |

### Embedded `permissions` Structure

Each of the 6 modules uses `permissionSchema` (`{ _id: false }`) containing 4 Boolean actions (`view`, `create`, `edit`, `delete`):

- `dashboard` — default `{ view: false, create: false, edit: false, delete: false }` (only `view` is supported in role operations)
- `userManagement` — default `{ view: false, create: false, edit: false, delete: false }`
- `roleManagement` — default `{ view: false, create: false, edit: false, delete: false }`
- `reports` — default `{ view: false, create: false, edit: false, delete: false }`
- `settings` — default `{ view: false, create: false, edit: false, delete: false }`
- `myProfile` — default `{ view: true, create: false, edit: true, delete: false }` (`create` and `delete` remain `false`)

---

## 2. `users` Collection (`User` Model)

Defined in [User.js](file:///d:/Role-Based-Access-Management-System/Backend/src/models/User.js).

### Fields

| Field | Type | Constraints / Validation | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Auto-generated primary key | — | Unique user identifier |
| `name` | `String` | `required: true`, `trim: true` | — | User's display name |
| `email` | `String` | `required: true`, `unique: true`, `lowercase: true`, `trim: true`, regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | — | Unique login email |
| `password` | `String` | `required: true`, `select: false` (bcrypt hashed) | — | Excluded from normal queries for security |
| `role` | `ObjectId` | `ref: "Role"`, `required: true` | — | Reference to a document in `roles` |
| `isActive` | `Boolean` | Boolean | `true` | Controls login and protected API access |
| `preferences` | `Object` | `{ compactLayout: Boolean, showWelcomeMessage: Boolean }` | `{ compactLayout: false, showWelcomeMessage: true }` | Application UI settings for the Settings module |
| `createdAt` | `Date` | Managed via `{ timestamps: true }` | Auto | Account creation timestamp |
| `updatedAt` | `Date` | Managed via `{ timestamps: true }` | Auto | Last modification timestamp |

---

## 3. Relationship & Design Rationale

### One-to-Many Relationship (`Role` 1 → N `User`)

```text
Role (_id)  <───────  User.role (ObjectId ref: "Role")
```

- One `Role` document can be referenced by many `User` documents.
- Every `User` references exactly one `Role` document via `ObjectId`.
- Deletion of any `Role` that is still referenced by at least one `User` (`User.exists({ role: id })`) is blocked to preserve referential integrity.

### Why Permissions Are Stored Centrally in `roles` (Not Duplicated in `users`)

1. **Single Source of Truth**: Updating a role's permissions in Role Management updates only one document in `roles`. Every user assigned to that role inherits the updated permissions immediately on their next request via `.populate("role")` in `authenticate`.
2. **Avoids Data Drift & Expensive Fan-Out**: Duplicating permission matrices inside every `User` document would require updating potentially thousands of user records whenever a role changes and risks stale/inconsistent permissions.
3. **Clean Normalization**: Keeping permissions inside `roles` (and avoiding an unnecessary third `permissions` collection) keeps authorization lookups to a single `.populate("role")` query per authenticated request.

