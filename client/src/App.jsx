import 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Wizard from './pages/Wizard';
import Analysis from './pages/Analysis';
import ApprovalRoadmap from './pages/ApprovalRoadmap';
import ApprovalDetail from './pages/ApprovalDetail';
import Documents from './pages/Documents';
import ApplicationTracking from './pages/ApplicationTracking';
import ComplianceDashboard from './pages/ComplianceDashboard';
import ComplianceDetail from './pages/ComplianceDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminApplicationReview from './pages/AdminApplicationReview';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Industry */}
          <Route path="/dashboard"                   element={<ProtectedRoute allowedRoles={['Industry']}><Dashboard /></ProtectedRoute>} />
          <Route path="/wizard"                      element={<ProtectedRoute allowedRoles={['Industry']}><Wizard /></ProtectedRoute>} />
          <Route path="/analyze"                     element={<ProtectedRoute allowedRoles={['Industry']}><Analysis /></ProtectedRoute>} />
          <Route path="/roadmap/:industryId"         element={<ProtectedRoute allowedRoles={['Industry']}><ApprovalRoadmap /></ProtectedRoute>} />
          <Route path="/approval/:approvalId/detail" element={<ProtectedRoute allowedRoles={['Industry']}><ApprovalDetail /></ProtectedRoute>} />
          <Route path="/documents"                   element={<ProtectedRoute allowedRoles={['Industry']}><Documents /></ProtectedRoute>} />
          <Route path="/applications"                element={<ProtectedRoute allowedRoles={['Industry']}><ApplicationTracking /></ProtectedRoute>} />
          <Route path="/compliance"                  element={<ProtectedRoute allowedRoles={['Industry']}><ComplianceDashboard /></ProtectedRoute>} />
          <Route path="/compliance/:id"              element={<ProtectedRoute allowedRoles={['Industry']}><ComplianceDetail /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard"        element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/applications/:id" element={<ProtectedRoute allowedRoles={['Admin']}><AdminApplicationReview /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
