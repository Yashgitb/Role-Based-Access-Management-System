# API Documentation

Base URL: `http://localhost:5000/api`

All protected endpoints require the `Authorization: Bearer <JWT_TOKEN>` request header.

---

## 1. Health Check

### `GET /` (Root URL, non-`/api`)

- **Authentication**: None
- **Permission**: None
- **Response (`200 OK`)**: `Server is running` (plain text)

---

## 2. Authentication (`/api/auth`)

### `POST /api/auth/login`

- **Authentication**: None
- **Permission**: Public
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Login successful",
    "token": "<jwt_token>",
    "user": {
      "id": "66f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Jane Doe",
      "email": "user@example.com",
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
- **Error Status Codes**:
  - `400`: Email and password are required / Invalid JSON body
  - `401`: Invalid email or password
  - `403`: Account is deactivated or no valid role assigned
  - `500`: Internal server error

### `GET /api/auth/me`

- **Authentication**: Required (Bearer JWT)
- **Permission**: Authenticated user
- **Success Response (`200 OK`)**:
  ```json
  {
    "user": {
      "id": "66f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Jane Doe",
      "email": "user@example.com",
      "role": "Admin",
      "permissions": { "...": "..." },
      "isActive": true
    }
  }
  ```
- **Error Status Codes**:
  - `401`: Missing token / Invalid token / Token expired / User not found
  - `403`: Your account is deactivated / No valid role assigned

### `POST /api/auth/logout`

- **Authentication**: Required (Bearer JWT)
- **Permission**: Authenticated user
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Logout successful"
  }
  ```
- **Error Status Codes**: `401`, `403`

---

## 3. Dashboard (`/api/dashboard`)

### `GET /api/dashboard`

- **Authentication**: Required
- **Permission**: `dashboard.view`
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Dashboard statistics retrieved successfully",
    "totalUsers": 12,
    "totalRoles": 3,
    "activeUsers": 10,
    "inactiveUsers": 2
  }
  ```
- **Error Status Codes**: `401`, `403`, `500`

---

## 4. User Management (`/api/users`)

### `GET /api/users`

- **Authentication**: Required
- **Permission**: `userManagement.view`
- **Query Parameters**:
  - `page` (optional, integer ≥ 1, default `1`)
  - `search` (optional, string — matches `name` or `email`, case-insensitive)
  - `role` (optional, Role `ObjectId`)
- **Example Request**: `GET /api/users?page=1&search=rahul&role=66f1a2b3c4d5e6f7a8b9c0a1`
- **Success Response (`200 OK`)**:
  ```json
  {
    "users": [
      {
        "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
        "name": "Rahul Sharma",
        "email": "rahul@example.com",
        "role": {
          "_id": "66f1a2b3c4d5e6f7a8b9c0a1",
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
    "totalPages": 1,
    "totalUsers": 1,
    "limit": 10
  }
  ```
- **Error Status Codes**: `400` (Invalid page number / Invalid filter / Invalid role ID), `401`, `403`, `500`

### `GET /api/users/available-roles`

- **Authentication**: Required
- **Permission**: `userManagement.create` OR `userManagement.edit`
- **Description**: Returns only roles whose permissions do not exceed the current user's permissions (prevents privilege escalation).
- **Success Response (`200 OK`)**:
  ```json
  {
    "roles": [
      { "_id": "66f1a2b3c4d5e6f7a8b9c0a2", "name": "Employee" },
      { "_id": "66f1a2b3c4d5e6f7a8b9c0a3", "name": "Manager" }
    ]
  }
  ```
- **Error Status Codes**: `401`, `403`, `500`

### `GET /api/users/role-filters`

- **Authentication**: Required
- **Permission**: `userManagement.view`
- **Success Response (`200 OK`)**:
  ```json
  {
    "roles": [
      { "_id": "66f1a2b3c4d5e6f7a8b9c0a1", "name": "Admin" },
      { "_id": "66f1a2b3c4d5e6f7a8b9c0a2", "name": "Employee" },
      { "_id": "66f1a2b3c4d5e6f7a8b9c0a3", "name": "Manager" }
    ]
  }
  ```
- **Error Status Codes**: `401`, `403`, `500`

### `GET /api/users/:id`

- **Authentication**: Required
- **Permission**: `userManagement.view`
- **Success Response (`200 OK`)**:
  ```json
  {
    "user": {
      "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "role": { "_id": "66f1a2b3c4d5e6f7a8b9c0a2", "name": "Employee" },
      "isActive": true,
      "createdAt": "2026-11-26T09:00:00.000Z",
      "updatedAt": "2026-11-26T09:00:00.000Z"
    }
  }
  ```
- **Error Status Codes**: `400` (Invalid user ID), `401`, `403`, `404` (User not found), `500`

### `POST /api/users`

- **Authentication**: Required
- **Permission**: `userManagement.create`
- **Request Body**:
  ```json
  {
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "password": "Password123!",
    "role": "66f1a2b3c4d5e6f7a8b9c0a2"
  }
  ```
- **Success Response (`201 Created`)**:
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
- **Error Status Codes**: `400` (Missing fields / Password length / Invalid role ID / Validation error), `401`, `403` (Insufficient permission or unauthorized role assignment), `404` (Role not found), `409` (Email already exists), `500`

### `PUT /api/users/:id`

- **Authentication**: Required
- **Permission**: `userManagement.edit`
- **Request Body** (`name`, `email`, `password`, and `role` are optional; omit `password` to keep existing password):
  ```json
  {
    "name": "Rahul S.",
    "email": "rahul.s@example.com",
    "password": "NewPassword123!",
    "role": "66f1a2b3c4d5e6f7a8b9c0a3"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "User updated successfully",
    "user": {
      "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Rahul S.",
      "email": "rahul.s@example.com",
      "role": { "_id": "66f1a2b3c4d5e6f7a8b9c0a3", "name": "Manager" },
      "isActive": true
    }
  }
  ```
- **Error Status Codes**: `400`, `401`, `403` (Cannot modify Admin, self, or assign higher-privileged role), `404`, `409` (Email already exists), `500`

### `PATCH /api/users/:id/status`

- **Authentication**: Required
- **Permission**: `userManagement.edit`
- **Request Body**:
  ```json
  {
    "isActive": false
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "User deactivated successfully",
    "user": { "...": "..." }
  }
  ```
- **Error Status Codes**: `400` (`isActive` must be Boolean / Invalid ID), `401`, `403`, `404`, `500`

### `DELETE /api/users/:id`

- **Authentication**: Required
- **Permission**: `userManagement.delete`
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "User deleted successfully"
  }
  ```
- **Error Status Codes**: `400`, `401`, `403` (Cannot delete Admin, self, or higher-privileged user), `404`, `500`

---

## 5. Role Management (`/api/roles`)

### `GET /api/roles`

- **Authentication**: Required
- **Permission**: `roleManagement.view`
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Roles retrieved successfully",
    "totalRoles": 3,
    "roles": [
      {
        "_id": "66f1a2b3c4d5e6f7a8b9c0a1",
        "name": "Admin",
        "permissions": { "...": "..." },
        "createdAt": "2026-11-26T08:00:00.000Z",
        "updatedAt": "2026-11-26T08:00:00.000Z"
      }
    ]
  }
  ```
- **Error Status Codes**: `401`, `403`, `500`

### `GET /api/roles/:id`

- **Authentication**: Required
- **Permission**: `roleManagement.view`
- **Success Response (`200 OK`)**: `{ "role": { ... } }`
- **Error Status Codes**: `400`, `401`, `403`, `404`, `500`

### `POST /api/roles`

- **Authentication**: Required
- **Permission**: `roleManagement.create`
- **Request Body**:
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
- **Success Response (`201 Created`)**:
  ```json
  {
    "message": "Role created successfully",
    "role": {
      "_id": "66f1a2b3c4d5e6f7a8b9c0f0",
      "name": "Auditor",
      "permissions": { "...": "..." }
    }
  }
  ```
- **Error Status Codes**: `400` (Missing name / Invalid permissions), `401`, `403` (Privilege escalation), `409` (Role already exists), `500`

### `PUT /api/roles/:id`

- **Authentication**: Required
- **Permission**: `roleManagement.edit`
- **Request Body**:
  ```json
  {
    "name": "Senior Auditor",
    "permissions": {
      "reports": { "view": true, "create": false }
    }
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Role updated successfully",
    "role": { "...": "..." }
  }
  ```
- **Error Status Codes**: `400` (Default roles cannot be renamed / Essential Admin permissions cannot be removed / Invalid permissions), `401`, `403` (Cannot modify Admin or higher-privileged role), `404`, `409` (Role name already exists), `500`

### `DELETE /api/roles/:id`

- **Authentication**: Required
- **Permission**: `roleManagement.delete`
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Role deleted successfully"
  }
  ```
- **Error Status Codes**: `400` (Default roles cannot be deleted / Role assigned to existing users / Invalid ID), `401`, `403`, `404`, `500`

---

## 6. Reports (`/api/reports`)

### `GET /api/reports`

- **Authentication**: Required
- **Permission**: `reports.view`
- **Query Parameters**:
  - `role` (optional, Role `ObjectId`)
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Reports retrieved successfully",
    "summary": {
      "totalRoles": 3,
      "totalUsers": 12,
      "activeUsers": 10,
      "inactiveUsers": 2
    },
    "roleReports": [
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
- **Error Status Codes**: `400` (Invalid role ID / Invalid role filter), `401`, `403`, `500`

### `GET /api/reports/roles`

- **Authentication**: Required
- **Permission**: `reports.view`
- **Query Parameters**: `role` (optional, Role `ObjectId`)
- **Success Response (`200 OK`)**:
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
- **Error Status Codes**: `400`, `401`, `403`, `500`

---

## 7. Settings (`/api/settings`)

### `GET /api/settings`

- **Authentication**: Required
- **Permission**: `settings.view`
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Settings retrieved successfully",
    "settings": {
      "compactLayout": false,
      "showWelcomeMessage": true
    }
  }
  ```
- **Error Status Codes**: `401`, `403`, `500`

### `PUT /api/settings`

- **Authentication**: Required
- **Permission**: `settings.edit`
- **Request Body**:
  ```json
  {
    "compactLayout": true,
    "showWelcomeMessage": false
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Settings updated successfully",
    "settings": {
      "compactLayout": true,
      "showWelcomeMessage": false
    }
  }
  ```
- **Error Status Codes**: `400` (Invalid body, unknown field, non-Boolean value), `401`, `403`, `500`

---

## 8. My Profile (`/api/profile`)

### `GET /api/profile`

- **Authentication**: Required
- **Permission**: `myProfile.view`
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Profile retrieved successfully",
    "profile": {
      "id": "66f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "Employee",
      "isActive": true,
      "createdAt": "2026-11-26T09:00:00.000Z",
      "updatedAt": "2026-11-26T09:00:00.000Z"
    }
  }
  ```
- **Error Status Codes**: `401`, `403`, `500`

### `PUT /api/profile`

- **Authentication**: Required
- **Permission**: `myProfile.edit`
- **Description**: Updates only `name` and/or `email` for the logged-in user (`req.user._id`). Attempts to modify `role`, `permissions`, `isActive`, or `password` are rejected.
- **Request Body**:
  ```json
  {
    "name": "Jane Smith",
    "email": "jane.smith@example.com"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Profile updated successfully",
    "profile": {
      "id": "66f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "role": "Employee",
      "isActive": true,
      "createdAt": "2026-11-26T09:00:00.000Z",
      "updatedAt": "2026-11-26T10:00:00.000Z"
    }
  }
  ```
- **Error Status Codes**: `400` (Empty/invalid name or email), `401`, `403` (Insufficient permission or restricted field tampering), `409` (Email already exists), `500`

### `PUT /api/profile/password`

- **Authentication**: Required
- **Permission**: `myProfile.edit`
- **Description**: Allows any authenticated user with `myProfile.edit` permission to change their own password (`req.user._id`) after verifying their current password.
- **Request Body**:
  ```json
  {
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword123!"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Password changed successfully"
  }
  ```
- **Error Status Codes**: `400` (Missing fields / Incorrect current password / Weak password / Same password), `401`, `403` (Insufficient permission), `500`

