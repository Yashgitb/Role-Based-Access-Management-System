# Database Schema

MongoDB uses two collections: `users` and `roles`, defined in `Backend/src/models/` using Mongoose.

## Users collection (`User.js`)

| Field | Type | Validation / purpose |
|---|---|---|
| `_id` | ObjectId | Unique user ID |
| `name` | String | Required, trimmed |
| `email` | String | Required, unique, lowercase, trimmed, email validation |
| `password` | String | Required, bcrypt hash, `select: false` |
| `role` | ObjectId | Required reference to Role |
| `isActive` | Boolean | Default: true; controls account access |
| `preferences` | Object | `compactLayout: false`, `showWelcomeMessage: true` |
| `createdAt`, `updatedAt` | Date | Automatic timestamps |

## Roles collection (`Role.js`)

| Field | Type | Validation / purpose |
|---|---|---|
| `_id` | ObjectId | Unique role ID |
| `name` | String | Required, unique, trimmed; supports custom roles |
| `permissions` | Object | Embedded module-wise Boolean permissions |
| `createdAt`, `updatedAt` | Date | Automatic timestamps |

### Permission structure

Modules: `dashboard`, `userManagement`, `roleManagement`, `reports`, `settings`, `myProfile`.

Each module has four Boolean actions: `view`, `create`, `edit`, `delete`. Defaults are false except My Profile view and edit. Dashboard supports view only; My Profile supports view and edit.

Example permission entry:

```json
{"reports":{"view":true,"create":false,"edit":false,"delete":false}}
```

## Relationship and authorization

```text
Roles (1)  <-------  (many) Users
 roles._id           users.role
```

Each user references one role; many users can share the same role. Permissions are stored centrally in `roles`, not duplicated in user documents. Authentication populates the current role on each protected request, so permission changes apply to all assigned users on subsequent requests. Roles assigned to existing users cannot be deleted.
