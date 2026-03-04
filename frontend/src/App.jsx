import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Trades from './pages/Trades';
import VerifyEmail from './pages/VerifyEmail';
import AdminRoute from './components/AdminRoute';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import UsersList from './pages/UsersList';
import AdminDashboard from './pages/AdminDashboard';
import UserProfileAdmin from './pages/UserProfileAdmin';
import AccountSettings from './pages/AccountSettings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected Routes inside Layout */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/trades" element={
              <ProtectedRoute>
                <Layout>
                  <Trades />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <AccountSettings />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Admin Only Routes */}
            <Route path="/admin/dashboard" element={
              <AdminRoute>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </AdminRoute>
            } />

            <Route path="/admin/users" element={
              <AdminRoute>
                <Layout>
                  <UsersList />
                </Layout>
              </AdminRoute>
            } />

            <Route path="/admin/users/:id" element={
              <AdminRoute>
                <Layout>
                  <UserProfileAdmin />
                </Layout>
              </AdminRoute>
            } />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
