import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Landing
import LandingPage from './pages/LandingPage';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

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

// Merchant Pages
import MerchantDashboard from './pages/merchant/MerchantDashboard';
import MerchantStores from './pages/merchant/MerchantStores';
import MerchantAdmins from './pages/merchant/MerchantAdmins';
import MerchantReports from './pages/merchant/MerchantReports';

// ── Protected Route ──
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useSelector((state) => state.auth);
  if (!token || !user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>

        {/* ── Public ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Clerk Routes ── */}
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

        {/* ── Admin Routes ── */}
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

        {/* ── Merchant Routes ── */}
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

        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;
