import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  XCircle,
  MessageSquare,
  Search,
  Building,
  Calendar,
  FileText,
  Download
} from 'lucide-react';

const AdminApplicationReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Review form state
  const [action, setAction] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  async function fetchApplicationDetails() {
    try {
      setLoading(true);
      const { data: result } = await api.get(`/admin/applications/${id}`);
      setApplication(result.data.application);
      setDocuments(result.data.documents || []);
      setError('');
    } catch (err) {
      console.error('Error fetching application:', err);
      setError('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!action) return;

    try {
      setActionLoading(true);
      await api.put(`/admin/applications/${id}/review`, {
        action,
        remarks
      });

      // Refresh application data
      await fetchApplicationDetails();
      
      setShowReviewForm(false);
      setAction('');
      setRemarks('');
      
      // Show success message
      alert(`Application ${action}d successfully!`);
    } catch (err) {
      console.error('Error reviewing application:', err);
      setError(err.response?.data?.error?.message || 'Failed to review application');
    } finally {
      setActionLoading(false);
    }
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
      <span className={`px-3 py-2 rounded-full text-sm font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canReview = () => {
    return application && ['SUBMITTED', 'UNDER_REVIEW'].includes(application.status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf7ff] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-[#4f378a] border-[#4f378a]/20 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-[#fdf7ff] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error || 'Application not found'}</div>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-4 py-2 bg-[#4f378a] text-white rounded-lg hover:bg-[#6750a4]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf7ff]">
      {/* Header */}
      <header className="bg-white border-b border-[#cbc4d2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2 px-3 py-2 text-[#4f378a] hover:bg-[#fdf7ff] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>

            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#4f378a]" />
              <div>
                <h1 className="text-xl font-bold text-[#1d1b20]">
                  Application Review - {application._id.slice(-8).toUpperCase()}
                </h1>
                <p className="text-sm text-[#494551]">{application.approvalId?.approvalType || 'N/A'}</p>
              </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Application Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Application Info */}
            <div className="bg-white rounded-xl border border-[#cbc4d2] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#1d1b20]">Application Information</h2>
                {getStatusBadge(application.status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#494551]">Application ID</p>
                  <p className="text-[#1d1b20]">{application._id.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#494551]">Approval Type</p>
                  <p className="text-[#1d1b20]">{application.approvalId?.approvalType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#494551]">Submission Date</p>
                  <p className="text-[#1d1b20] flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(application.submissionDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#494551]">Expected Completion</p>
                  <p className="text-[#1d1b20]">{formatDate(application.expectedCompletionDate)}</p>
                </div>
              </div>

              {application.remarks && (
                <div className="mt-4 pt-4 border-t border-[#cbc4d2]">
                  <p className="text-sm font-semibold text-[#494551] mb-2">Remarks</p>
                  <p className="text-[#1d1b20] bg-[#fdf7ff] p-3 rounded-lg">{application.remarks}</p>
                </div>
              )}
            </div>

            {/* Industry Information */}
            <div className="bg-white rounded-xl border border-[#cbc4d2] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Building className="w-5 h-5 text-[#4f378a]" />
                <h2 className="text-lg font-bold text-[#1d1b20]">Industry Information</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#494551]">Company Name</p>
                  <p className="text-[#1d1b20]">{application.industryId?.companyName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#494551]">Sector</p>
                  <p className="text-[#1d1b20]">{application.industryId?.sector || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#494551]">Location</p>
                  <p className="text-[#1d1b20]">
                    {[application.industryId?.district, application.industryId?.state].filter(Boolean).join(', ') || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#494551]">Project Stage</p>
                  <p className="text-[#1d1b20]">{application.industryId?.projectStage || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#494551]">Employees</p>
                  <p className="text-[#1d1b20]">{application.industryId?.employees ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#494551]">Investment</p>
                  <p className="text-[#1d1b20]">
                    {application.industryId?.investment
                      ? `₹${Number(application.industryId.investment).toLocaleString('en-IN')}`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Status History */}
            {application.statusHistory && application.statusHistory.length > 0 && (
              <div className="bg-white rounded-xl border border-[#cbc4d2] p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#1d1b20] mb-4">Status History</h2>
                <div className="space-y-3">
                  {application.statusHistory.map((entry, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-[#fdf7ff] rounded-lg">
                      <div className="w-2 h-2 bg-[#4f378a] rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#1d1b20]">{entry.status}</span>
                          <span className="text-xs text-[#7a7582]">{formatDate(entry.changedAt)}</span>
                        </div>
                        {entry.remarks && <p className="text-sm text-[#494551] mt-1">{entry.remarks}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Documents & Actions */}
          <div className="space-y-6">
            
            {/* Action Buttons */}
            {canReview() && (
              <div className="bg-white rounded-xl border border-[#cbc4d2] p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#1d1b20] mb-4">Review Actions</h3>
                
                {!showReviewForm ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => { setAction('approve'); setShowReviewForm(true); }}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve Application
                    </button>

                    <button
                      onClick={() => { setAction('reject'); setShowReviewForm(true); }}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Application
                    </button>

                    <button
                      onClick={() => { setAction('query'); setShowReviewForm(true); }}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Raise Query
                    </button>

                    <button
                      onClick={() => { setAction('inspection'); setShowReviewForm(true); }}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      <Search className="w-5 h-5" />
                      Schedule Inspection
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#494551] mb-2">
                        Action: {action.charAt(0).toUpperCase() + action.slice(1)}
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-[#494551] mb-2">
                        Remarks {action === 'query' ? '(Required)' : '(Optional)'}
                      </label>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder={
                          action === 'query' 
                            ? 'Please specify what additional information is required...' 
                            : 'Enter your remarks...'
                        }
                        rows="4"
                        required={action === 'query'}
                        className="w-full px-3 py-2 border border-[#cbc4d2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f378a] focus:border-transparent"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={actionLoading || (action === 'query' && !remarks.trim())}
                        className="flex-1 px-4 py-2 bg-[#4f378a] hover:bg-[#6750a4] disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
                      >
                        {actionLoading ? 'Processing...' : 'Confirm'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => { setShowReviewForm(false); setAction(''); setRemarks(''); }}
                        className="px-4 py-2 border border-[#cbc4d2] hover:bg-[#fdf7ff] text-[#494551] rounded-lg font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Documents */}
            <div className="bg-white rounded-xl border border-[#cbc4d2] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-[#4f378a]" />
                <h3 className="text-lg font-bold text-[#1d1b20]">Documents ({documents.length})</h3>
              </div>

              {documents.length === 0 ? (
                <p className="text-[#7a7582] text-center py-4">No documents uploaded</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div key={doc._id || index} className="flex items-center justify-between p-3 bg-[#fdf7ff] rounded-lg border border-[#cbc4d2]">
                      <div>
                        <p className="font-semibold text-[#1d1b20]">{doc.documentType}</p>
                        {doc.companyName && (
                          <p className="text-xs text-[#7a7582]">{doc.companyName}</p>
                        )}
                        {doc.expiryDate && (
                          <p className="text-xs text-[#7a7582]">Expires: {formatDate(doc.expiryDate)}</p>
                        )}
                      </div>
                      
                      <a
                        href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${doc.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 text-[#4f378a] hover:bg-white rounded-lg text-sm font-semibold transition-colors"
                        title="View Document"
                      >
                        <Download className="w-4 h-4" />
                        View
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminApplicationReview;