import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import {
  Shield,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  LogOut,
  Users,
  BookOpen,
  Settings
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalApplications: 0,
    activeRules: 0,
    totalSchemes: 0,
    reviewStats: {
      pendingApproval: 0,
      underReview: 0,
      approved: 0,
      rejected: 0
    }
  });
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchApplicationsForReview();
  }, []);

  async function fetchDashboardData() {
    try {
      const { data: result } = await api.get('/admin/dashboard');
      setStats(result.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard statistics');
    }
  };

  async function fetchApplicationsForReview() {
    try {
      const { data: result } = await api.get('/admin/applications');
      setApplications(result.data);
      setError('');
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleReviewApplication = (applicationId) => {
    navigate(`/admin/applications/${applicationId}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'SUBMITTED': { color: 'bg-blue-100 text-blue-700', label: 'Submitted' },
      'UNDER_REVIEW': { color: 'bg-yellow-100 text-yellow-700', label: 'Under Review' },
      'INSPECTION': { color: 'bg-purple-100 text-purple-700', label: 'Inspection' },
      'APPROVED': { color: 'bg-green-100 text-green-700', label: 'Approved' },
      'REJECTED': { color: 'bg-red-100 text-red-700', label: 'Rejected' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-700', label: status };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf7ff] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-[#4f378a] border-[#4f378a]/20 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf7ff]">
      {/* Header */}
      <header className="bg-white border-b border-[#cbc4d2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#4f378a]" />
              <div>
                <h1 className="text-2xl font-bold text-[#1d1b20]">Admin Portal</h1>
                <p className="text-sm text-[#494551]">Authority Dashboard - Application Review & System Management</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-[#1d1b20]">{user?.name || 'Admin'}</p>
                <p className="text-xs text-[#7a7582]">Administrator</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-[#4f378a] hover:bg-[#6750a4] text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* System Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-[#cbc4d2] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-[#1d1b20]">{stats.totalUsers}</span>
            </div>
            <h3 className="text-sm font-semibold text-[#494551]">Total Users</h3>
          </div>

          <div className="bg-white rounded-xl border border-[#cbc4d2] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-[#1d1b20]">{stats.totalApplications}</span>
            </div>
            <h3 className="text-sm font-semibold text-[#494551]">Total Applications</h3>
          </div>

          <div className="bg-white rounded-xl border border-[#cbc4d2] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-[#1d1b20]">{stats.activeRules}</span>
            </div>
            <h3 className="text-sm font-semibold text-[#494551]">Active Rules</h3>
          </div>

          <div className="bg-white rounded-xl border border-[#cbc4d2] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-orange-50 rounded-lg">
                <Settings className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-3xl font-bold text-[#1d1b20]">{stats.totalSchemes}</span>
            </div>
            <h3 className="text-sm font-semibold text-[#494551]">Total Schemes</h3>
          </div>
        </div>

        {/* Application Review Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-[#cbc4d2] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-[#1d1b20]">{stats.reviewStats.pendingApproval}</span>
            </div>
            <h3 className="text-sm font-semibold text-[#494551]">Pending Review</h3>
          </div>

          <div className="bg-white rounded-xl border border-[#cbc4d2] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-3xl font-bold text-[#1d1b20]">{stats.reviewStats.underReview}</span>
            </div>
            <h3 className="text-sm font-semibold text-[#494551]">Under Review</h3>
          </div>

          <div className="bg-white rounded-xl border border-[#cbc4d2] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-[#1d1b20]">{stats.reviewStats.approved}</span>
            </div>
            <h3 className="text-sm font-semibold text-[#494551]">Approved</h3>
          </div>

          <div className="bg-white rounded-xl border border-[#cbc4d2] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-3xl font-bold text-[#1d1b20]">{stats.reviewStats.rejected}</span>
            </div>
            <h3 className="text-sm font-semibold text-[#494551]">Rejected</h3>
          </div>
        </div>

        {/* Applications for Review */}
        <div className="bg-white rounded-xl border border-[#cbc4d2] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#cbc4d2]">
            <h2 className="text-lg font-bold text-[#1d1b20]">Applications for Review</h2>
            <p className="text-sm text-[#7a7582]">Applications requiring authority review and approval</p>
          </div>

          <div className="overflow-x-auto">
            {applications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <FileText className="w-12 h-12 text-[#7a7582] mx-auto mb-3" />
                <p className="text-[#494551]">No applications to review at this time</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-[#fdf7ff]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#494551] uppercase tracking-wider">
                      Application ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#494551] uppercase tracking-wider">
                      Industry Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#494551] uppercase tracking-wider">
                      Approval Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#494551] uppercase tracking-wider">
                      Submission Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#494551] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#494551] uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#cbc4d2]">
                  {applications.map((application) => (
                    <tr key={application._id} className="hover:bg-[#fdf7ff] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[#1d1b20]">
                        {application._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#494551]">
                        {application.industryId?.companyName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#494551]">
                        {application.approvalId?.approvalType || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#494551]">
                        {formatDate(application.submissionDate)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {getStatusBadge(application.status)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleReviewApplication(application._id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-[#4f378a] hover:bg-[#6750a4] text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;