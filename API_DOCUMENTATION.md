# Role-Based Access Management System — API Documentation

- **Base URL:** `http://localhost:5000/api` *(Health check at `http://localhost:5000/`)*
- **Content-Type:** `application/json`
- **Authentication Scheme:** HTTP Bearer JWT (`Authorization: Bearer <token>`)

---

## Endpoint Index by Entity

| Entity | Method | Endpoint | Summary | Auth / Permission |
| :--- | :--- | :--- | :--- | :--- |
| **System** | `GET` | `/` | Health check | Public |
| **Auth** | `POST` | `/api/auth/login` | Login and obtain JWT | Public |
| **Auth** | `GET` | `/api/auth/me` | Get current authenticated user | Bearer JWT |
| **Auth** | `POST` | `/api/auth/logout` | Logout current user | Bearer JWT |
| **Dashboard** | `GET` | `/api/dashboard` | Get system counts | `dashboard.view` |
| **Users** | `GET` | `/api/users` | List paginated users (search & filter) | `userManagement.view` |
| **Users** | `GET` | `/api/users/available-roles` | List assignable roles | `userManagement.create` or `edit` |
| **Users** | `GET` | `/api/users/role-filters` | List roles for filter dropdown | `userManagement.view` |
| **Users** | `GET` | `/api/users/{id}` | Get user by ID | `userManagement.view` |
| **Users** | `POST` | `/api/users` | Create a new user | `userManagement.create` |
| **Users** | `PUT` | `/api/users/{id}` | Update user details/password/role | `userManagement.edit` |
| **Users** | `PATCH` | `/api/users/{id}/status` | Activate or deactivate user | `userManagement.edit` |
| **Users** | `DELETE` | `/api/users/{id}` | Delete user by ID | `userManagement.delete` |
| **Roles** | `GET` | `/api/roles` | List all roles | `roleManagement.view` |
| **Roles** | `GET` | `/api/roles/{id}` | Get role by ID | `roleManagement.view` |
| **Roles** | `POST` | `/api/roles` | Create a custom role | `roleManagement.create` |
| **Roles** | `PUT` | `/api/roles/{id}` | Update role name and permissions | `roleManagement.edit` |
| **Roles** | `DELETE` | `/api/roles/{id}` | Delete an unassigned custom role | `roleManagement.delete` |
| **Reports** | `GET` | `/api/reports` | Get summary and role-wise user stats | `reports.view` |
| **Reports** | `GET` | `/api/reports/roles` | Get role-wise breakdown | `reports.view` |
| **Settings** | `GET` | `/api/settings` | Get user preferences | `settings.view` |
| **Settings** | `PUT` | `/api/settings` | Update user preferences | `settings.edit` |
| **Profile** | `GET` | `/api/profile` | Get logged-in user's profile | `myProfile.view` |
| **Profile** | `PUT` | `/api/profile` | Update logged-in user's name/email | `myProfile.edit` |
| **Profile** | `PUT` | `/api/profile/password` | Change logged-in user's password | `myProfile.edit` |

---

## 1. Entity: `System`

### `GET /` — Health Check

- **Auth:** None
- **Parameters:** None

#### Responses

- **`200 OK`** *(text/plain)*
  ```text
  Server is running
  ```
- **`404 Not Found`** *(for unknown API routes)*
  ```json
  {
    "message": "Route not found: GET /api/unknown"
  }
  ```

---

## 2. Entity: `Auth`

### `POST /api/auth/login` — User Login

Authenticates a user by email and password and returns a signed JWT plus the user's current role and permissions.

- **Auth:** None
- **Request Body** *(application/json, required)*:

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | `string` | Yes | Registered email address |
| `password` | `string` | Yes | Plaintext account password |

```json
{
  "email": "admin@example.com",
  "password": "StrongPassword123"
}
```

#### Responses

- **`200 OK`** — Login successful
  ```json
  {
    "message": "Login successful",
    "token": "<jwt_token>",
    "user": {
      "id": "66f1a2b3c4d5e6f7a8b9c0d1",
      "name": "System Admin",
      "email": "admin@example.com",
      "role": "Admin",
      "permissions": {
        "dashboard": { "view": true, "create": false, "edit": false, "delete": false },
        "userManagement": { "view": true, "create": true, "edit": true, "delete": true },
        "roleManagement": { "view": true, "create": true, "edit": true, "delete": true },
        "reports": { "view": true, "create": true, "edit": true, "delete": true },
        "settings": { "view": true, "create": true, "edit": true, "delete": true },
        "myProfile": { "view": true, "create": false, "edit": true, "delete": false }
      },
      "isActive": true
    }
  }
  ```
- **`400 Bad Request`** — Missing email/password or malformed JSON body
  ```json
  { "message": "Email and password are required" }
  ```
- **`401 Unauthorized`** — Invalid credentials
  ```json
  { "message": "Invalid email or password" }
  ```
- **`403 Forbidden`** — Deactivated account or no valid role
  ```json
  { "message": "Your account is deactivated" }
  ```

---

### `GET /api/auth/me` — Get Current User

Returns the latest authenticated user profile and dynamic role permissions from MongoDB.

- **Auth:** Bearer JWT
- **Permission:** Authenticated user

#### Responses

- **`200 OK`**
  ```json
  {
    "user": {
      "id": "66f1a2b3c4d5e6f7a8b9c0d1",
      "name": "System Admin",
      "email": "admin@example.com",
      "role": "Admin",
      "permissions": {
        "dashboard": { "view": true, "create": false, "edit": false, "delete": false },
        "userManagement": { "view": true, "create": true, "edit": true, "delete": true },
        "roleManagement": { "view": true, "create": true, "edit": true, "delete": true },
        "reports": { "view": true, "create": true, "edit": true, "delete": true },
        "settings": { "view": true, "create": true, "edit": true, "delete": true },
        "myProfile": { "view": true, "create": false, "edit": true, "delete": false }
      },
      "isActive": true
    }
  }
  ```
- **`401 Unauthorized`** — `"Authentication token required"`, `"Token expired"`, `"Invalid token"`, or `"User not found"`
- **`403 Forbidden`** — `"Your account is deactivated"` or `"No valid role assigned"`

---

### `POST /api/auth/logout` — Logout

Acknowledges user logout. The client clears the stored JWT (`localStorage`).

- **Auth:** Bearer JWT
- **Permission:** Authenticated user

#### Responses

- **`200 OK`**
  ```json
  {
    "message": "Logout successful"
  }
  ```
- **`401 Unauthorized`** / **`403 Forbidden`** — Standard auth middleware errors

---

## 3. Entity: `Dashboard`

### `GET /api/dashboard` — Get Dashboard Statistics

Returns live user and role counts from MongoDB.

- **Auth:** Bearer JWT
- **Permission:** `dashboard.view`

#### Responses

- **`200 OK`**
  ```json
  {
    "message": "Dashboard statistics retrieved successfully",
    "totalUsers": 27,
    "totalRoles": 3,
    "activeUsers": 25,
    "inactiveUsers": 2
  }
  ```
- **`401 Unauthorized`** — Missing/invalid/expired JWT
- **`403 Forbidden`** — `{ "message": "Access denied. Insufficient permissions." }`

---

## 4. Entity: `Users`

### `GET /api/users` — List Paginated Users

Retrieves users using server-side pagination (`10` records per page), optional name/email search, and optional role filtering.

- **Auth:** Bearer JWT
- **Permission:** `userManagement.view`
- **Query Parameters:**

| Name | In | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `page` | `query` | `integer` | No | `1` | Positive page number (`>= 1`) |
| `search` | `query` | `string` | No | `""` | Case-insensitive match on `name` or `email` |
| `role` | `query` | `string (ObjectId)` | No | `""` | Filter users by Role `_id` |

#### Responses

- **`200 OK`**
  ```json
  {
    "users": [
      {
        "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
        "name": "Rahul Sharma",
        "email": "rahul@example.com",
        "role": {
          "_id": "66f1a2b3c4d5e6f7a8b9c0a2",
          "name": "Employee"
        },
        "isActive": true,
        "preferences": {
          "compactLayout": false,
          "showWelcomeMessage": true
        },
        "createdAt": "2026-11-26T09:00:00.000Z",
        "updatedAt": "2026-11-26T09:00:00.000Z"
      }
    ],
    "currentPage": 1,
    "totalPages": 3,
    "totalUsers": 27,
    "limit": 10
  }
  ```
- **`400 Bad Request`** — `"Invalid page number"`, `"Invalid filter"`, or `"Invalid role ID"`
- **`401 Unauthorized`** / **`403 Forbidden`**

---

### `GET /api/users/available-roles` — Get Assignable Roles

Returns roles that the logged-in user is permitted to assign without privilege escalation.

- **Auth:** Bearer JWT
- **Permission:** `userManagement.create` OR `userManagement.edit`

#### Responses

- **`200 OK`**
  ```json
  {
    "roles": [
      { "_id": "66f1a2b3c4d5e6f7a8b9c0a1", "name": "Admin" },
      { "_id": "66f1a2b3c4d5e6f7a8b9c0a2", "name": "Employee" },
      { "_id": "66f1a2b3c4d5e6f7a8b9c0a3", "name": "Manager" }
    ]
  }
  ```
- **`401 Unauthorized`** / **`403 Forbidden`** — `{ "message": "Access denied" }`

---

### `GET /api/users/role-filters` — Get Role Filter Options

Returns all roles (`_id` and `name`) for filtering users in the UI.

- **Auth:** Bearer JWT
- **Permission:** `userManagement.view`

#### Responses

- **`200 OK`**
  ```json
  {
    "roles": [
      { "_id": "66f1a2b3c4d5e6f7a8b9c0a1", "name": "Admin" },
      { "_id": "66f1a2b3c4d5e6f7a8b9c0a2", "name": "Employee" },
      { "_id": "66f1a2b3c4d5e6f7a8b9c0a3", "name": "Manager" }
    ]
  }
  ```
- **`401 Unauthorized`** / **`403 Forbidden`**

---

### `GET /api/users/{id}` — Get User by ID

- **Auth:** Bearer JWT
- **Permission:** `userManagement.view`
- **Path Parameters:**

| Name | In | Type | Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `path` | `string (ObjectId)` | Yes | Target User `_id` |

#### Responses

- **`200 OK`**
  ```json
  {
    "user": {
      "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "role": { "_id": "66f1a2b3c4d5e6f7a8b9c0a2", "name": "Employee" },
      "isActive": true,
      "preferences": {
        "compactLayout": false,
        "showWelcomeMessage": true
      },
      "createdAt": "2026-11-26T09:00:00.000Z",
      "updatedAt": "2026-11-26T09:00:00.000Z"
    }
  }
  ```
- **`400 Bad Request`** — `{ "message": "Invalid user ID" }`
- **`404 Not Found`** — `{ "message": "User not found" }`
- **`401 Unauthorized`** / **`403 Forbidden`**

---

### `POST /api/users` — Create User

- **Auth:** Bearer JWT
- **Permission:** `userManagement.create`
- **Request Body** *(application/json, required)*:

| Field | Type | Required | Constraints |
| :--- | :--- | :--- | :--- |
| `name` | `string` | Yes | Non-empty string |
| `email` | `string` | Yes | Valid unique email |
| `password` | `string` | Yes | `8` chars min, `72` UTF-8 bytes max |
| `role` | `string (ObjectId)` | Yes | Valid Role `_id` user can assign |

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "Password123!",
  "role": "66f1a2b3c4d5e6f7a8b9c0a2"
}
```

#### Responses

- **`201 Created`**
  ```json
  {
    "message": "User created successfully",
    "user": {
      "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "role": { "_id": "66f1a2b3c4d5e6f7a8b9c0a2", "name": "Employee" },
      "isActive": true
    }
  }
  ```
- **`400 Bad Request`** — Missing fields, invalid password length, invalid role ID, or validation error
- **`403 Forbidden`** — Insufficient permissions or `"You cannot assign this role"`
- **`404 Not Found`** — `{ "message": "Role not found" }`
- **`409 Conflict`** — `{ "message": "Email already exists" }`

---

### `PUT /api/users/{id}` — Update User

Updates user name, email, optional password, or assigned role. Protected against modifying Admin accounts, self-modification, and privilege escalation.

- **Auth:** Bearer JWT
- **Permission:** `userManagement.edit`
- **Path Parameters:** `id` (`string (ObjectId)`, required)
- **Request Body** *(application/json, all fields optional)*:

| Field | Type | Required | Constraints |
| :--- | :--- | :--- | :--- |
| `name` | `string` | No | Non-empty string |
| `email` | `string` | No | Valid unique email |
| `password` | `string` | No | Omit to keep current; if provided, `8` chars min / `72` bytes max |
| `role` | `string (ObjectId)` | No | Valid assignable Role `_id` |

```json
{
  "name": "Rahul S.",
  "email": "rahul.s@example.com",
  "password": "NewPassword123!",
  "role": "66f1a2b3c4d5e6f7a8b9c0a3"
}
```

#### Responses

- **`200 OK`** *(password hash is omitted)*
  ```json
  {
    "message": "User updated successfully",
    "user": {
      "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Rahul S.",
      "email": "rahul.s@example.com",
      "role": { "_id": "66f1a2b3c4d5e6f7a8b9c0a3", "name": "Manager" },
      "isActive": true,
      "preferences": {
        "compactLayout": false,
        "showWelcomeMessage": true
      },
      "createdAt": "2026-11-26T09:00:00.000Z",
      "updatedAt": "2026-11-26T10:30:00.000Z"
    }
  }
  ```
- **`400 Bad Request`** — Invalid ID, name, email, password, or role ID
- **`403 Forbidden`** — `"You cannot modify this user"` or `"You cannot assign this role"`
- **`404 Not Found`** — `"User not found"` or `"Role not found"`
- **`409 Conflict`** — `{ "message": "Email already exists" }`

---

### `PATCH /api/users/{id}/status` — Update User Activation Status

- **Auth:** Bearer JWT
- **Permission:** `userManagement.edit`
- **Path Parameters:** `id` (`string (ObjectId)`, required)
- **Request Body** *(application/json, required)*:

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `isActive` | `boolean` | Yes | `true` to activate, `false` to deactivate |

```json
{
  "isActive": false
}
```

#### Responses

- **`200 OK`**
  ```json
  {
    "message": "User deactivated successfully",
    "user": {
      "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "role": {
        "_id": "66f1a2b3c4d5e6f7a8b9c0a2",
        "name": "Employee",
        "permissions": { "...": "..." }
      },
      "isActive": false
    }
  }
  ```
- **`400 Bad Request`** — `"Invalid user ID"` or `"isActive must be a Boolean"`
- **`403 Forbidden`** — `"You cannot change this user's status"`
- **`404 Not Found`** — `"User not found"`

---

### `DELETE /api/users/{id}` — Delete User

- **Auth:** Bearer JWT
- **Permission:** `userManagement.delete`
- **Path Parameters:** `id` (`string (ObjectId)`, required)

#### Responses

- **`200 OK`**
  ```json
  {
    "message": "User deleted successfully"
  }
  ```
- **`400 Bad Request`** — `{ "message": "Invalid user ID" }`
- **`403 Forbidden`** — `{ "message": "You cannot delete this user" }`
- **`404 Not Found`** — `{ "message": "User not found" }`

---

## 5. Entity: `Roles`

### `GET /api/roles` — List All Roles

- **Auth:** Bearer JWT
- **Permission:** `roleManagement.view`

#### Responses

- **`200 OK`**
  ```json
  {
    "message": "Roles retrieved successfully",
    "totalRoles": 3,
    "roles": [
      {
        "_id": "66f1a2b3c4d5e6f7a8b9c0a1",
        "name": "Admin",
        "permissions": {
          "dashboard": { "view": true, "create": false, "edit": false, "delete": false },
          "userManagement": { "view": true, "create": true, "edit": true, "delete": true },
          "roleManagement": { "view": true, "create": true, "edit": true, "delete": true },
          "reports": { "view": true, "create": true, "edit": true, "delete": true },
          "settings": { "view": true, "create": true, "edit": true, "delete": true },
          "myProfile": { "view": true, "create": false, "edit": true, "delete": false }
        },
        "createdAt": "2026-11-26T08:00:00.000Z",
        "updatedAt": "2026-11-26T08:00:00.000Z"
      }
    ]
  }
  ```
- **`401 Unauthorized`** / **`403 Forbidden`**

---

### `GET /api/roles/{id}` — Get Role by ID

- **Auth:** Bearer JWT
- **Permission:** `roleManagement.view`
- **Path Parameters:** `id` (`string (ObjectId)`, required)

#### Responses

- **`200 OK`**
  ```json
  {
    "role": {
      "_id": "66f1a2b3c4d5e6f7a8b9c0a2",
      "name": "Employee",
      "permissions": { "...": "..." }
    }
  }
  ```
- **`400 Bad Request`** — `{ "message": "Invalid role ID" }`
- **`404 Not Found`** — `{ "message": "Role not found" }`

---

### `POST /api/roles` — Create Role

Creates a new custom role. Unsupported operations (`dashboard.create/edit/delete` and `myProfile.create/delete`) are forced to `false`.

- **Auth:** Bearer JWT
- **Permission:** `roleManagement.create`
- **Request Body** *(application/json, required)*:

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | Yes | Unique role name (case-insensitive check) |
| `permissions` | `PermissionsMap` | No | Module-wise boolean flags (`view`, `create`, `edit`, `delete`) |

```json
{
  "name": "Auditor",
  "permissions": {
    "dashboard": { "view": true },
    "reports": { "view": true },
    "myProfile": { "view": true, "edit": true }
  }
}
```

#### Responses

- **`201 Created`**
  ```json
  {
    "message": "Role created successfully",
    "role": {
      "_id": "66f1a2b3c4d5e6f7a8b9c0f0",
      "name": "Auditor",
      "permissions": {
        "dashboard": { "view": true, "create": false, "edit": false, "delete": false },
        "userManagement": { "view": false, "create": false, "edit": false, "delete": false },
        "roleManagement": { "view": false, "create": false, "edit": false, "delete": false },
        "reports": { "view": true, "create": false, "edit": false, "delete": false },
        "settings": { "view": false, "create": false, "edit": false, "delete": false },
        "myProfile": { "view": true, "create": false, "edit": true, "delete": false }
      }
    }
  }
  ```
- **`400 Bad Request`** — `"Role name is required"` or `"Invalid permissions"`
- **`403 Forbidden`** — Non-Admin user granting permissions they do not possess
- **`409 Conflict`** — `{ "message": "Role already exists" }`

---

### `PUT /api/roles/{id}` — Update Role

Updates role name (custom roles only) and/or module permissions dynamically. Preserves Admin lockout protection.

- **Auth:** Bearer JWT
- **Permission:** `roleManagement.edit`
- **Path Parameters:** `id` (`string (ObjectId)`, required)
- **Request Body** *(application/json)*:

| Field | Type | Required | Constraints |
| :--- | :--- | :--- | :--- |
| `name` | `string` | No | Default roles (`Admin`, `Manager`, `Employee`) cannot be renamed |
| `permissions` | `PermissionsMap` | No | Partial or full module permission object |

```json
{
  "name": "Senior Auditor",
  "permissions": {
    "reports": { "view": true, "create": false }
  }
}
```

#### Responses

- **`200 OK`**
  ```json
  {
    "message": "Role updated successfully",
    "role": { "_id": "66f1a2b3c4d5e6f7a8b9c0f0", "name": "Senior Auditor", "permissions": { "...": "..." } }
  }
  ```
- **`400 Bad Request`** — `"Invalid role ID"`, `"Default roles cannot be renamed"`, `"Invalid permissions"`, or `"Essential Admin permissions cannot be removed"`
- **`403 Forbidden`** — `"Cannot modify the Admin role"`, `"Cannot modify a role with higher permissions"`, or `"Cannot grant permissions you do not possess"`
- **`404 Not Found`** — `"Role not found"`
- **`409 Conflict`** — `{ "message": "Role name already exists" }`

---

### `DELETE /api/roles/{id}` — Delete Role

Deletes an unassigned custom role. Blocks deleting default roles (`Admin`, `Manager`, `Employee`) or any role currently assigned to users.

- **Auth:** Bearer JWT
- **Permission:** `roleManagement.delete`
- **Path Parameters:** `id` (`string (ObjectId)`, required)

#### Responses

- **`200 OK`**
  ```json
  {
    "message": "Role deleted successfully"
  }
  ```
- **`400 Bad Request`** — `"Invalid role ID"`, `"Default roles cannot be deleted"`, or `"Cannot delete role assigned to existing users"`
- **`403 Forbidden`** — `{ "message": "Cannot delete a role with higher permissions" }`
- **`404 Not Found`** — `{ "message": "Role not found" }`

---

## 6. Entity: `Reports`

### `GET /api/reports` — Get Summary & Role-Wise Reports

Aggregates total, active, and inactive users grouped by role (including roles with `0` users).

- **Auth:** Bearer JWT
- **Permission:** `reports.view`
- **Query Parameters:**

| Name | In | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `role` | `query` | `string (ObjectId)` | No | `""` | Filter statistics to a single Role `_id` |

#### Responses

- **`200 OK`**
  ```json
  {
    "message": "Reports retrieved successfully",
    "summary": {
      "totalRoles": 3,
      "totalUsers": 27,
      "activeUsers": 25,
      "inactiveUsers": 2
    },
    "roleReports": [
      {
        "_id": "66f1a2b3c4d5e6f7a8b9c0a1",
        "roleName": "Admin",
        "totalUsers": 1,
        "activeUsers": 1,
        "inactiveUsers": 0
      },
      {
        "_id": "66f1a2b3c4d5e6f7a8b9c0a2",
        "roleName": "Employee",
        "totalUsers": 20,
        "activeUsers": 18,
        "inactiveUsers": 2
      }
    ]
  }
  ```
- **`400 Bad Request`** — `"Invalid role filter"` or `"Invalid role ID"`
- **`401 Unauthorized`** / **`403 Forbidden`**

---

### `GET /api/reports/roles` — Get Role-Wise Breakdown

- **Auth:** Bearer JWT
- **Permission:** `reports.view`
- **Query Parameters:** `role` (`string (ObjectId)`, optional)

#### Responses

- **`200 OK`**
  ```json
  {
    "message": "Role statistics retrieved successfully",
    "roles": [
      {
        "_id": "66f1a2b3c4d5e6f7a8b9c0a1",
        "roleName": "Admin",
        "totalUsers": 1,
        "activeUsers": 1,
        "inactiveUsers": 0
      }
    ]
  }
  ```
- **`400 Bad Request`** / **`401 Unauthorized`** / **`403 Forbidden`**

---

## 7. Entity: `Settings`

### `GET /api/settings` — Get User Application Settings

- **Auth:** Bearer JWT
- **Permission:** `settings.view`

#### Responses

- **`200 OK`**
  ```json
  {
    "message": "Settings retrieved successfully",
    "settings": {
      "compactLayout": false,
      "showWelcomeMessage": true
    }
  }
  ```
- **`401 Unauthorized`** / **`403 Forbidden`**

---

### `PUT /api/settings` — Update User Application Settings

- **Auth:** Bearer JWT
- **Permission:** `settings.edit`
- **Request Body** *(application/json, at least one field required; unknown keys rejected)*:

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `compactLayout` | `boolean` | No | Compact spacing across sidebar, navbar, cards, and tables |
| `showWelcomeMessage` | `boolean` | No | Show or hide welcome banner on Dashboard |

```json
{
  "compactLayout": true,
  "showWelcomeMessage": false
}
```

#### Responses

- **`200 OK`**
  ```json
  {
    "message": "Settings updated successfully",
    "settings": {
      "compactLayout": true,
      "showWelcomeMessage": false
    }
  }
  ```
- **`400 Bad Request`** — Invalid body, no fields provided, unknown settings field, or non-Boolean value
- **`401 Unauthorized`** / **`403 Forbidden`**

---

## 8. Entity: `Profile`

### `GET /api/profile` — Get My Profile

Returns the logged-in user's personal information (`req.user._id`).

- **Auth:** Bearer JWT
- **Permission:** `myProfile.view`

#### Responses

- **`200 OK`**
  ```json
  {
    "message": "Profile retrieved successfully",
    "profile": {
      "id": "66f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "role": "Employee",
      "isActive": true,
      "createdAt": "2026-11-26T09:00:00.000Z",
      "updatedAt": "2026-11-26T09:00:00.000Z"
    }
  }
  ```
- **`401 Unauthorized`** / **`403 Forbidden`**

---

### `PUT /api/profile` — Update My Profile

Updates only `name` and/or `email` for the authenticated user (`req.user._id`). Attempting to pass `role`, `permissions`, `isActive`, or `password` is rejected.

- **Auth:** Bearer JWT
- **Permission:** `myProfile.edit`
- **Request Body** *(application/json, at least one field required)*:

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | No | Non-empty display name |
| `email` | `string` | No | Valid unique email address |

```json
{
  "name": "Rahul Verma",
  "email": "rahul.verma@example.com"
}
```

#### Responses

- **`200 OK`**
  ```json
  {
    "message": "Profile updated successfully",
    "profile": {
      "id": "66f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Rahul Verma",
      "email": "rahul.verma@example.com",
      "role": "Employee",
      "isActive": true,
      "createdAt": "2026-11-26T09:00:00.000Z",
      "updatedAt": "2026-11-26T10:00:00.000Z"
    }
  }
  ```
- **`400 Bad Request`** — Missing fields, empty name/email, or invalid email format
- **`403 Forbidden`** — Insufficient permission or restricted field tampering (`role`, `permissions`, `isActive`, `password`)
- **`409 Conflict`** — `{ "message": "Email already exists" }`

---

### `PUT /api/profile/password` — Change My Password

Allows any authenticated user with `myProfile.edit` permission to change their own password after verifying their current password.

- **Auth:** Bearer JWT
- **Permission:** `myProfile.edit`
- **Request Body** *(application/json, required)*:

| Field | Type | Required | Constraints |
| :--- | :--- | :--- | :--- |
| `currentPassword` | `string` | Yes | Must match existing password |
| `newPassword` | `string` | Yes | `8` chars min, `72` bytes max; distinct from current password |

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

#### Responses

- **`200 OK`**
  ```json
  {
    "message": "Password changed successfully"
  }
  ```
- **`400 Bad Request`** — Missing fields, `"Current password is incorrect"`, weak password, or `"New password must be different from your current password"`
- **`401 Unauthorized`** / **`403 Forbidden`**

---

## Schemas (Data Models)

### `PermissionSet`

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `view` | `boolean` | `false` | Read/view access to the module |
| `create` | `boolean` | `false` | Create resource access |
| `edit` | `boolean` | `false` | Update/toggle access |
| `delete` | `boolean` | `false` | Delete resource access |

### `PermissionsMap`

| Module Key | Type | Notes |
| :--- | :--- | :--- |
| `dashboard` | `PermissionSet` | Only `view` supported |
| `userManagement` | `PermissionSet` | All 4 actions supported |
| `roleManagement` | `PermissionSet` | All 4 actions supported |
| `reports` | `PermissionSet` | All 4 actions supported |
| `settings` | `PermissionSet` | All 4 actions supported |
| `myProfile` | `PermissionSet` | Only `view` and `edit` supported |

### `ErrorResponse`

| Field | Type | Description |
| :--- | :--- | :--- |
| `message` | `string` | Human-readable error message (`400`, `401`, `403`, `404`, `409`, `500`) |
