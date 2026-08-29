import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Wizard from './pages/Wizard';
import AdminDashboard from './pages/AdminDashboard';
import AdminApplicationReview from './pages/AdminApplicationReview';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['Industry']}><Dashboard /></ProtectedRoute>} />
          <Route path="/wizard" element={<ProtectedRoute allowedRoles={['Industry']}><Wizard /></ProtectedRoute>} />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/applications/:id" element={<ProtectedRoute allowedRoles={['Admin']}><AdminApplicationReview /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
