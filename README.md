# Role-Based Access Management System

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) **Role-Based Access Management System** developed as part of the Brained MERN Developer Intern assignment.

**Demo Video:** [Watch the demo](https://drive.google.com/file/d/1ri52kDVhR30tOaD1qw0cbHjMRK54Dt2A/view?usp=sharing)
 
---

## 1. Project Overview

This application lets an organization manage users, roles, and page/action permissions from one admin portal. When a user logs in, the system issues a JWT token and dynamically shows only the pages and buttons allowed by their assigned role, while enforcing the same permission checks on every backend API route.

---

## 2. Features

- **JWT Authentication**: Email and password login, session persistence on page refresh (`GET /api/auth/me`), and logout.
- **Dynamic Role-Based Authorization**: Sidebar links, routes, and action buttons adapt automatically based on the user's role permissions stored in MongoDB.
- **User Management**: Create users, edit name/email/password/role, activate or deactivate accounts, and delete users.
- **Role Management**: View default roles and create, edit, or delete custom roles with module-level permissions (`View`, `Create`, `Edit`, `Delete`).
- **Dynamic Role & Permission Allocation**: Updating a role's permissions updates access across the application without changing backend code or re-issuing tokens.
- **Dashboard Statistics**: Live counts for total users, active users, inactive users, and total roles.
- **Backend Pagination**: Server-side MongoDB pagination displaying **10 records per page** with Previous/Next controls.
- **Search and Role Filtering**: Search users by name or email and filter by role together with pagination.
- **Reports**: Role-wise user statistics (total, active, and inactive users) with role filtering.
- **Settings**: Permission-protected user preferences for compact layout and showing or hiding the dashboard welcome banner.
- **My Profile**: View account details, update name and email, and change password after verifying the current password.
- **Persistent Dark and Light Mode**: Available on all pages (including Login) and saved in `localStorage`.

---

## 3. Technology Stack

- **Frontend**: React.js (`react`, `react-dom`), Vite, React Router DOM, Axios
- **Styling**: Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication & Security**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cors`, `dotenv`

---

## 4. Default Role Permissions

These initial permissions are created when you run the seed script on a fresh database:

| Module          | Admin                      | Manager    | Employee   |
| :-------------- | :------------------------- | :--------- | :--------- |
| Dashboard       | View                       | View       | View       |
| User Management | View, Create, Edit, Delete | View       | No Access  |
| Role Management | View, Create, Edit, Delete | No Access  | No Access  |
| Reports         | View, Create, Edit, Delete | View       | No Access  |
| Settings        | View, Create, Edit, Delete | No Access  | No Access  |
| My Profile      | View, Edit                 | View, Edit | View, Edit |

---

## 5. Prerequisites

Make sure the following software is installed on your machine:

- **Node.js** (v18 or later recommended)
- **npm**
- **MongoDB** (local installation or a **MongoDB Atlas** cluster)
- **Git**

---

## 6. Installation and Setup

### Step 1: Clone the repository

```bash
git clone https://github.com/Yashgitb/Role-Based-Access-Management-System.git
cd Role-Based-Access-Management-System
```

### Step 2: Install backend dependencies

```bash
cd Backend
npm install
```

### Step 3: Configure backend environment variables

Create a `.env` file inside the `Backend/` folder and add your own values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
JWT_SECRET=<your_jwt_secret_key>
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
ADMIN_NAME=System Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<your_admin_password>
```

- `MONGO_URI`: Your local MongoDB URI or MongoDB Atlas connection string.
- `JWT_SECRET`: A strong secret string used to sign JWT tokens.
- `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`: Used once by the seed script to create the first Admin account.

### Step 4: Seed the initial roles and Admin account

Run this command once from the `Backend/` folder on a fresh database:

```bash
node ./src/scripts/seed.js
```

This creates the three default roles (`Admin`, `Manager`, `Employee`) and the initial Admin user using the credentials in `Backend/.env`.

### Step 5: Install frontend dependencies

Open or switch to the `Frontend/` folder:

```bash
cd ../Frontend
npm install
```

### Step 6: Configure frontend API URL (optional)

By default, the frontend sends API requests to `/api` (which Vite proxies to `http://localhost:5000` locally, and Vercel routes to the backend in production). If your backend runs at a different URL, create a `.env` file inside `Frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 7. Running the Application

Run the backend and frontend in **two separate terminals**:

### Terminal 1: Start the Backend

```bash
cd Backend
npm run dev
```

For production mode without `nodemon`, you can run `npm start`.

- **Backend URL**: `http://localhost:5000`

### Terminal 2: Start the Frontend

```bash
cd Frontend
npm run dev
```

- **Frontend URL**: `http://localhost:5173`

Open `http://localhost:5173` in your browser to use the application.

---

## 8. Login Credentials

There is no public sign-up page. User accounts are created through the initial seed script or by an authorized user inside **User Management**.

- **Initial Admin Login**: Use the `ADMIN_EMAIL` and `ADMIN_PASSWORD` values you configured in `Backend/.env` before running `node ./src/scripts/seed.js`.
- **Testing Other Roles**: After logging in as Admin, open **User Management** and create test users with the `Manager` and `Employee` roles (using any test password of at least 8 characters), then log in with those accounts to verify role-based restrictions.

---

## 9. Project Folder Structure

```text
Role-Based-Access-Management-System/
├── API_DOCUMENTATION.md
├── DATABASE_SCHEMA.md
├── README.md
├── Backend/
│   ├── package.json
│   └── src/
│       ├── config/          # MongoDB connection (db.js)
│       ├── controllers/     # Route logic for auth, users, roles, dashboard, reports, settings, profile
│       ├── middleware/      # JWT authentication, dynamic permission authorization, error handling
│       ├── models/          # Mongoose schemas (User.js, Role.js)
│       ├── routes/          # Express API route definitions
│       ├── scripts/         # Database seeding script (seed.js)
│       └── server.js        # Express app entry point
└── Frontend/
    ├── index.html
    ├── package.json
    └── src/
        ├── components/      # Reusable UI components (common & layout)
        ├── context/         # AuthContext and ThemeContext
        ├── pages/           # Login, Dashboard, UserManagement, RoleManagement, Reports, Settings, MyProfile
        ├── routes/          # AppRoutes and ProtectedRoute
        ├── services/        # Axios instance and API service functions
        └── utils/           # Permission helpers and formatting utilities
```

---

## 10. Application Usage

1. **Log in as Admin**: Open `http://localhost:5173/login` and sign in with your seeded Admin email and password.
2. **Create Users**: Go to **User Management**, click **+ Create User**, enter Name, Email, Password, and pick a Role from the dropdown.
3. **Create Custom Roles & Assign Permissions**: Go to **Role Management**, click **+ Create Role**, enter a role name, check the desired module permissions (`View`, `Create`, `Edit`, `Delete`), and save. You can also click **Edit** on existing roles to update permissions dynamically.
4. **Change a User's Role**: In **User Management**, click **Edit** on a user row, select a new role (or update name, email, or password), and click **Save Changes**.
5. **Test Pagination, Search, and Filtering**: In **User Management** (with more than 10 users), use **Previous** and **Next** to switch pages (10 users per page), type a name or email in the search bar, or filter by role. Changing search or filter resets the page back to 1.
6. **Verify Manager and Employee Authorization**:
   - Log in as a **Manager** to confirm the sidebar shows only **Dashboard**, **User Management** (view-only, no Create/Edit/Delete buttons), **Reports**, and **My Profile**.
   - Log in as an **Employee** to confirm the sidebar shows only **Dashboard** and **My Profile**, and that visiting `/users`, `/roles`, `/reports`, or `/settings` directly in the URL bar displays **403 — Access Denied**.
7. **Switch Dark and Light Mode**: Click the **Dark Mode / Light Mode** button in the top-right corner of the Login page or navigation bar. Refresh the browser to confirm the selected theme persists.

---

## 11. API and Database Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema Documentation](./DATABASE_SCHEMA.md)

---

## 12. Application Demonstration

- **Demo Video Link**: _Add your recorded project demonstration link here._
