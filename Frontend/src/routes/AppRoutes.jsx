import { Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from '../pages/Dashboard.jsx'
import Login from '../pages/Login.jsx'
import MyProfile from '../pages/MyProfile.jsx'
import Reports from '../pages/Reports.jsx'
import RoleManagement from '../pages/RoleManagement.jsx'
import Settings from '../pages/Settings.jsx'
import UserManagement from '../pages/UserManagement.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/roles" element={<RoleManagement />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/profile" element={<MyProfile />} />
    </Routes>
  )
}
