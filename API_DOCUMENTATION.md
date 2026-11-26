# API Documentation

Base URL: `http://localhost:5000/api`. All endpoints require `Authorization: Bearer <JWT_TOKEN>` except login and the server health check (`GET http://localhost:5000/`).

## Endpoints

| Method | Endpoint (relative to `/api`) | Required permission | Success / response fields |
|---|---|---|---|
| POST | `/auth/login` | Public | 200: message, token, user |
| GET | `/auth/me` | Authenticated | 200: user |
| POST | `/auth/logout` | Authenticated | 200: message |
| GET | `/dashboard` | dashboard.view | 200: message, totalUsers, totalRoles, activeUsers, inactiveUsers |
| GET | `/users` | userManagement.view | 200: users, currentPage, totalPages, totalUsers, limit |
| GET | `/users/available-roles` | userManagement.create OR edit | 200: roles (assignable) |
| GET | `/users/role-filters` | userManagement.view | 200: roles |
| GET | `/users/:id` | userManagement.view | 200: user |
| POST | `/users` | userManagement.create | 201: message, user |
| PUT | `/users/:id` | userManagement.edit | 200: message, user |
| PATCH | `/users/:id/status` | userManagement.edit | 200: message, user |
| DELETE | `/users/:id` | userManagement.delete | 200: message |
| GET | `/roles` | roleManagement.view | 200: message, totalRoles, roles |
| GET | `/roles/:id` | roleManagement.view | 200: role |
| POST | `/roles` | roleManagement.create | 201: message, role |
| PUT | `/roles/:id` | roleManagement.edit | 200: message, role |
| DELETE | `/roles/:id` | roleManagement.delete | 200: message |
| GET | `/reports` | reports.view | 200: message, summary, roleReports |
| GET | `/reports/roles` | reports.view | 200: message, roles |
| GET | `/settings` | settings.view | 200: message, settings |
| PUT | `/settings` | settings.edit | 200: message, settings |
| GET | `/profile` | myProfile.view | 200: message, profile |
| PUT | `/profile` | myProfile.edit | 200: message, profile |
| PUT | `/profile/password` | myProfile.edit | 200: message |

## Request and response examples

Examples below are abbreviated; identifiers and credentials are illustrative.

**Login — POST `/auth/login`**

Request: `{"email":"user@example.com","password":"Password123!"}`

Response: `{"message":"Login successful","token":"<jwt_token>","user":{"id":"<user_id>","name":"Jane Doe","email":"user@example.com","role":"Employee","permissions":{"dashboard":{"view":true}},"isActive":true}}`

**Users — GET `/users?page=1&search=rahul&role=<role_id>`**

`page` defaults to 1; `search` matches name or email; `role` is an optional Role ObjectId. Filters are combined before backend pagination (10 records per page).

```json
{
  "users": [{"_id":"<user_id>","name":"Rahul Sharma","email":"rahul@example.com","role":{"_id":"<role_id>","name":"Employee"},"isActive":true}],
  "currentPage": 1,
  "totalPages": 1,
  "totalUsers": 1,
  "limit": 10
}
```

**Other write requests** (JSON bodies):

| Endpoint | Example body |
|---|---|
| POST `/users` | `{"name":"Rahul Sharma","email":"rahul@example.com","password":"Password123!","role":"<role_id>"}` |
| PUT `/users/:id` | `{"name":"Rahul S.","email":"rahul.s@example.com","role":"<role_id>"}` (optional password reset also supported) |
| PATCH `/users/:id/status` | `{"isActive":false}` |
| POST `/roles` | `{"name":"Auditor","permissions":{"dashboard":{"view":true},"reports":{"view":true}}}` |
| PUT `/roles/:id` | `{"permissions":{"reports":{"view":false}}}` |
| PUT `/settings` | `{"compactLayout":true,"showWelcomeMessage":false}` |
| PUT `/profile` | `{"name":"Jane Smith","email":"jane.smith@example.com"}` |
| PUT `/profile/password` | `{"currentPassword":"OldPassword123!","newPassword":"NewPassword123!"}` |

**Representative success responses** (abbreviated):

| Endpoint | Example response |
|---|---|
| POST `/users` | `{"message":"User created successfully","user":{"_id":"<user_id>","name":"Rahul Sharma"}}` |
| POST `/roles` | `{"message":"Role created successfully","role":{"_id":"<role_id>","name":"Auditor"}}` |
| GET `/dashboard` | `{"totalUsers":12,"totalRoles":3,"activeUsers":10,"inactiveUsers":2}` |
| GET `/reports?role=<role_id>` | `{"summary":{"totalRoles":1,"totalUsers":1,"activeUsers":1,"inactiveUsers":0},"roleReports":[{"_id":"<role_id>","roleName":"Admin","totalUsers":1,"activeUsers":1,"inactiveUsers":0}]}` |
| GET `/reports/roles` | `{"roles":[{"_id":"<role_id>","roleName":"Admin","totalUsers":1,"activeUsers":1,"inactiveUsers":0}]}` |
| GET `/settings` | `{"settings":{"compactLayout":false,"showWelcomeMessage":true}}` |
| GET `/profile` | `{"profile":{"id":"<user_id>","name":"Jane Doe","email":"jane@example.com","role":"Employee","isActive":true}}` |
| PUT `/profile/password` | `{"message":"Password changed successfully"}` |

Both report endpoints accept an optional `role` filter.

## Error codes and security

| Status | Meaning |
|---|---|
| 400 | Invalid input, ID or request body |
| 401 | Missing, invalid or expired JWT; incorrect login credentials |
| 403 | Insufficient permissions or deactivated account |
| 404 | Resource not found |
| 409 | Duplicate email or role name |
| 500 | Internal server error |

Permissions are checked on the backend using the current assigned role. Password hashes are not returned. Role assignment prevents privilege escalation; default roles and roles assigned to users cannot be deleted. Profile updates are restricted to the current user.
