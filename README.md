# Role-Based Access Management System (MERN Stack)

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) **Role-Based Access Management System** implementing JWT authentication, dynamic module-level authorization, user and role management, backend pagination with search and role filtering, reporting, application settings, profile management, and persistent dark/light mode.

---

## Features

- **JWT Authentication**: Email/password login (`bcryptjs` password hashing), `GET /api/auth/me` session restoration, and logout.
- **Dynamic Role-Based Authorization (RBAC)**:
  - Roles stored in MongoDB with embedded permissions across **6 modules** (`dashboard`, `userManagement`, `roleManagement`, `reports`, `settings`, `myProfile`) and **4 actions** (`view`, `create`, `edit`, `delete`).
  - Backend middleware (`authenticate` + `authorize(module, action)`) enforces permissions dynamically on every request.
  - Frontend sidebar navigation, route access (`ProtectedRoute`), and action buttons (`Create`, `Edit`, `Delete`, `Activate/Deactivate`) render dynamically from the logged-in user's permissions without hardcoding role names.
- **User Management & Backend Pagination**:
  - Create, view, edit, activate/deactivate, and delete users.
  - Privilege escalation protection and protected Admin/self-account rules.
  - Server-side MongoDB pagination (`10` users per page), search by name or email, and filtering by role.
- **Role Management**:
  - Create custom roles, edit module-wise permissions via an interactive permission matrix, and delete unassigned custom roles.
  - Protects default roles (`Admin`, `Manager`, `Employee`), prevents administrative lockout, prevents privilege escalation, and blocks deletion of roles assigned to existing users.
- **Dashboard & Reports**:
  - Live system statistics (`totalUsers`, `totalRoles`, `activeUsers`, `inactiveUsers`).
  - Role-wise user breakdown (`totalUsers`, `activeUsers`, `inactiveUsers`) with role filtering.
- **Settings & My Profile**:
  - Permission-protected user preferences (`compactLayout`, `showWelcomeMessage`) persisted in the `User` document.
  - Self-service profile viewing, editing (`name`, `email`), and password changing (`PUT /api/profile/password` with current-password verification) scoped strictly to the authenticated user (`req.user._id`).
- **Persistent Dark / Light Mode**:
  - Available globally on all 7 pages (including Login) independently of Settings permissions, persisted in `localStorage`.

---

## Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router DOM, Axios
- **Backend**: Node.js, Express.js, Mongoose, JSON Web Token (`jsonwebtoken`), `bcryptjs`, `dotenv`, `cors`
- **Database**: MongoDB

---

## Project Folder Structure

```text
Role-Based-Access-Management-System/
├── API_DOCUMENTATION.md
├── DATABASE_SCHEMA.md
├── README.md
├── .gitignore
├── Backend/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── src/
│       ├── config/
│       │   └── db.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── dashboardController.js
│       │   ├── profileController.js
│       │   ├── reportController.js
│       │   ├── roleController.js
│       │   ├── settingsController.js
│       │   └── userController.js
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   ├── errorMiddleware.js
│       │   └── permissionMiddleware.js
│       ├── models/
│       │   ├── Role.js
│       │   └── User.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── dashboardRoutes.js
│       │   ├── profileRoutes.js
│       │   ├── reportRoutes.js
│       │   ├── roleRoutes.js
│       │   ├── settingsRoutes.js
│       │   └── userRoutes.js
│       ├── scripts/
│       │   └── seed.js
│       └── server.js
└── Frontend/
    ├── .env.example
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── index.css
        ├── main.jsx
        ├── components/
        │   ├── common/
        │   │   ├── Alert.jsx
        │   │   ├── ConfirmModal.jsx
        │   │   ├── Loader.jsx
        │   │   ├── Modal.jsx
        │   │   ├── Pagination.jsx
        │   │   ├── PermissionMatrix.jsx
        │   │   └── ThemeToggle.jsx
        │   └── layout/
        │       ├── DashboardLayout.jsx
        │       ├── Navbar.jsx
        │       └── Sidebar.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   ├── ThemeContext.jsx
        │   ├── useAuth.js
        │   └── useTheme.js
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── Login.jsx
        │   ├── MyProfile.jsx
        │   ├── Reports.jsx
        │   ├── RoleManagement.jsx
        │   ├── Settings.jsx
        │   └── UserManagement.jsx
        ├── routes/
        │   ├── AppRoutes.jsx
        │   └── ProtectedRoute.jsx
        ├── services/
        │   ├── api.js
        │   ├── authService.js
        │   ├── dashboardService.js
        │   ├── profileService.js
        │   ├── reportService.js
        │   ├── roleService.js
        │   ├── settingsService.js
        │   └── userService.js
        └── utils/
            └── permissions.js
```

---

## Setup Instructions

### Prerequisites

- Node.js (v18+ recommended)
- npm
- MongoDB (MongoDB Atlas cluster or local MongoDB instance)

### 1. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/` (use `Backend/.env.example` as a template):

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
JWT_SECRET=<your_jwt_secret_key>
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
ADMIN_NAME=System Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<strong_admin_password>
```

#### Initial Database Seeding (First-Time Setup Only)

Run the seed script once on a fresh database to create the default `Admin`, `Manager`, and `Employee` roles and the initial Admin user:

```bash
cd Backend
node ./src/scripts/seed.js
```

> **Note**: Only run `seed.js` for initial setup. Do not re-run it if you want to keep modified role permissions untouched or avoid unintended checks.

### 2. Frontend Setup

```bash
cd Frontend
npm install
```

Optionally create `Frontend/.env` (defaults to `http://localhost:5000/api` if omitted):

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Running the Application

Start both servers in separate terminals:

**Backend (port 5000):**

```bash
cd Backend
npm run dev
```

**Frontend (port 5173):**

```bash
cd Frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Default Role Permission Matrix

| Module | Admin | Manager | Employee |
| :--- | :--- | :--- | :--- |
| **Dashboard** | View | View | View |
| **User Management** | Full Access (`view`, `create`, `edit`, `delete`) | View | No Access |
| **Role Management** | Full Access (`view`, `create`, `edit`, `delete`) | No Access | No Access |
| **Reports** | Full Access (`view`, `create`, `edit`, `delete`) | View | No Access |
| **Settings** | Full Access (`view`, `create`, `edit`, `delete`) | No Access | No Access |
| **My Profile** | View & Edit | View & Edit | View & Edit |

> These are initial seeded permissions. An Admin can dynamically adjust permissions (or create new custom roles) through **Role Management** without changing backend code or issuing new tokens.

---

## Authentication & Authorization Architecture

1. **Login**: `POST /api/auth/login` verifies credentials using `bcryptjs` and returns a signed JWT containing `userId`, along with the user's current role name and permissions.
2. **Request Lifecycle**:
   `Client Request → Express Route → authenticate → authorize(module, action) → Controller → Mongoose → MongoDB`
3. **`authenticate` Middleware**:
   - Reads the `Authorization: Bearer <token>` header and verifies the JWT with `JWT_SECRET`.
   - Loads the latest user document from MongoDB with `.populate("role")`.
   - Rejects deleted users (`401`), deactivated accounts (`403`), and users without a valid role (`403`).
4. **`authorize(module, action)` Middleware**:
   - Checks `req.user.role.permissions?.[module]?.[action] === true` dynamically from the database on every request.
5. **Frontend Sync**:
   - Axios attaches the Bearer token automatically.
   - `ProtectedRoute` refreshes `GET /api/auth/me` on route changes so updated role permissions reflect in the UI without requiring re-login.

---

## Pagination Implementation

`GET /api/users` implements MongoDB-level pagination:

- Fixed page size of **10 records per page**.
- Query parameters: `page` (positive integer, default `1`), `search` (case-insensitive regex on `name` or `email`), and `role` (Role `ObjectId`).
- Uses `User.countDocuments(filter)`, `.skip(skip)`, and `.limit(10)` — never loads the full collection into memory.
- Clamps `currentPage` safely if items are deleted on the last page (`Math.min(page, Math.max(totalPages, 1))`).
- The frontend resets `page` to `1` whenever search or role filters change and cancels stale in-flight requests using `AbortController`.

---

## Testing & Verification

- **Frontend Lint & Build**:
  ```bash
  cd Frontend
  npm run lint
  npm run build
  ```
- **Backend Syntax Check**:
  Check all backend files under `Backend/src` with `node --check`.
- **End-to-End Scenarios**:
  Verify authentication (valid/invalid/expired/missing JWT, deactivated account), dynamic role permissions, privilege escalation blocks, backend pagination/search/filtering, Dashboard, Reports, Settings, Profile updates, and dark/light theme persistence.

---

## Known Limitations

- **Stateless JWT Logout**: `POST /api/auth/logout` returns a success response and the frontend clears the stored token from `localStorage`. Because tokens are stateless without a server-side token blocklist collection, previously issued JWTs remain valid until expiration unless the user is deactivated (`isActive: false`) or deleted.
- **Browser Automation Availability**: In headless/CLI environments where Chrome remote debugging is not active, end-to-end browser UI clicks must be verified manually in a browser alongside automated backend API integration tests.
