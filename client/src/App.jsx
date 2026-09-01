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
import IndustryHub from './pages/IndustryHub';
import AdminDashboard from './pages/AdminDashboard';
import AdminApplicationReview from './pages/AdminApplicationReview';
import AdminApplicationsList from './pages/AdminApplicationsList';
import AdminRules from './pages/AdminRules';
import AdminSchemes from './pages/AdminSchemes';
import AdminRegulations from './pages/AdminRegulations';
import AdminKnowledgeBase from './pages/AdminKnowledgeBase';
import AdminAuditLog from './pages/AdminAuditLog';

const A = ({ children }) => <ProtectedRoute allowedRoles={['Admin']}>{children}</ProtectedRoute>;
const I = ({ children }) => <ProtectedRoute allowedRoles={['Industry']}>{children}</ProtectedRoute>;

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Industry */}
          <Route path="/dashboard"                   element={<I><Dashboard /></I>} />
          <Route path="/wizard"                      element={<I><Wizard /></I>} />
          <Route path="/analyze"                     element={<I><Analysis /></I>} />
          <Route path="/roadmap/:industryId"         element={<I><ApprovalRoadmap /></I>} />
          <Route path="/approval/:approvalId/detail" element={<I><ApprovalDetail /></I>} />
          <Route path="/documents"                   element={<I><Documents /></I>} />
          <Route path="/applications"                element={<I><ApplicationTracking /></I>} />
          <Route path="/compliance"                  element={<I><ComplianceDashboard /></I>} />
          <Route path="/compliance/:id"              element={<I><ComplianceDetail /></I>} />
          <Route path="/hub"                         element={<I><IndustryHub /></I>} />

          {/* Admin */}
          <Route path="/admin/dashboard"        element={<A><AdminDashboard /></A>} />
          <Route path="/admin/applications"     element={<A><AdminApplicationsList /></A>} />
          <Route path="/admin/applications/:id" element={<A><AdminApplicationReview /></A>} />
          <Route path="/admin/rules"            element={<A><AdminRules /></A>} />
          <Route path="/admin/schemes"          element={<A><AdminSchemes /></A>} />
          <Route path="/admin/regulations"      element={<A><AdminRegulations /></A>} />
          <Route path="/admin/knowledge"        element={<A><AdminKnowledgeBase /></A>} />
          <Route path="/admin/audit"            element={<A><AdminAuditLog /></A>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
