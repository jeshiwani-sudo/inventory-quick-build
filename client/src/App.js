import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Profile Pages
import EditProfile from './pages/profile/EditProfile';
import ChangePassword from './pages/profile/ChangePassword';

// Landing Page
import LandingPage from './pages/LandingPage';

// Clerk Pages
import ClerkDashboard from './pages/clerk/ClerkDashboard';
import RecordEntry from './pages/clerk/RecordEntry';
import ClerkMyEntries from './pages/clerk/ClerkMyEntries';
import ClerkSupplyRequests from './pages/clerk/ClerkSupplyRequests';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminInventory from './pages/admin/AdminInventory';
import AdminSupplyRequests from './pages/admin/AdminSupplyRequests';
import AdminClerks from './pages/admin/AdminClerks';
import AdminReports from './pages/admin/AdminReports';

// Merchant Pages
import MerchantDashboard from './pages/merchant/MerchantDashboard';
import MerchantStores from './pages/merchant/MerchantStores';
import MerchantAdmins from './pages/merchant/MerchantAdmins';
import MerchantReports from './pages/merchant/MerchantReports';

// Protected Route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useSelector((state) => state.auth);
  if (!token || !user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Clerk Routes */}
        <Route path="/clerk/dashboard" element={
          <ProtectedRoute allowedRoles={['clerk']}>
            <ClerkDashboard />
          </ProtectedRoute>
        } />
        <Route path="/clerk/record-entry" element={
          <ProtectedRoute allowedRoles={['clerk']}>
            <RecordEntry />
          </ProtectedRoute>
        } />
        <Route path="/clerk/my-entries" element={
          <ProtectedRoute allowedRoles={['clerk']}>
            <ClerkMyEntries />
          </ProtectedRoute>
        } />
        <Route path="/clerk/supply-requests" element={
          <ProtectedRoute allowedRoles={['clerk']}>
            <ClerkSupplyRequests />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/products" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminProducts />
          </ProtectedRoute>
        } />
        <Route path="/admin/inventory" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminInventory />
          </ProtectedRoute>
        } />
        <Route path="/admin/supply-requests" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminSupplyRequests />
          </ProtectedRoute>
        } />
        <Route path="/admin/clerks" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminClerks />
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminReports />
          </ProtectedRoute>
        } />

        {/* Merchant Routes */}
        <Route path="/merchant/dashboard" element={
          <ProtectedRoute allowedRoles={['merchant']}>
            <MerchantDashboard />
          </ProtectedRoute>
        } />
        <Route path="/merchant/stores" element={
          <ProtectedRoute allowedRoles={['merchant']}>
            <MerchantStores />
          </ProtectedRoute>
        } />
        <Route path="/merchant/admins" element={
          <ProtectedRoute allowedRoles={['merchant']}>
            <MerchantAdmins />
          </ProtectedRoute>
        } />
        <Route path="/merchant/reports" element={
          <ProtectedRoute allowedRoles={['merchant']}>
            <MerchantReports />
          </ProtectedRoute>
        } />

        {/* Profile Routes (accessible by all logged-in users) */}
        <Route path="/profile/edit" element={
          <ProtectedRoute allowedRoles={['merchant', 'admin', 'clerk']}>
            <EditProfile />
          </ProtectedRoute>
        } />
        <Route path="/profile/change-password" element={
          <ProtectedRoute allowedRoles={['merchant', 'admin', 'clerk']}>
            <ChangePassword />
          </ProtectedRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;