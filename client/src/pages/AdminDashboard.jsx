import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../api/api";
import {
  Users, FileText, BookOpen, Landmark, Clock,
  CheckCircle, XCircle, AlertTriangle, Eye, RefreshCw,
  TrendingUp, Activity, ShieldCheck,
} from "lucide-react";

const STATUS_CFG = {
  SUBMITTED:          { label: "Submitted",    cls: "bg-blue-100 text-blue-700"    },
  UNDER_REVIEW:       { label: "Under Review", cls: "bg-yellow-100 text-yellow-700"},
  INSPECTION:         { label: "Inspection",   cls: "bg-purple-100 text-purple-700"},
  APPROVED:           { label: "Approved",     cls: "bg-green-100 text-green-700"  },
  REJECTED:           { label: "Rejected",     cls: "bg-red-100 text-red-700"      },
  DOCUMENTS_PREPARED: { label: "Docs Ready",   cls: "bg-indigo-100 text-indigo-700"},
  NOT_STARTED:        { label: "Not Started",  cls: "bg-gray-100 text-gray-600"    },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.NOT_STARTED;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = "bg-[#f0ebff]", iconColor = "text-[#4f378a]" }) {
  return (
    <div className="rounded-xl border border-[#e6e0e9] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
          <Icon size={20} className={iconColor} />
        </div>
        <span className="text-3xl font-black text-[#1d1b20]">{value ?? "—"}</span>
      </div>
      <p className="mt-3 text-sm font-semibold text-[#494551]">{label}</p>
      {sub && <p className="text-xs text-[#7a7582]">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats,    setStats]    = useState(null);
  const [apps,     setApps]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, aRes] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/applications"),
      ]);
      if (sRes.data?.success) setStats(sRes.data.data);
      if (aRes.data?.success) setApps(aRes.data.data || []);
      setError("");
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <AdminLayout title="Admin Dashboard" subtitle="System overview and application review queue">
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#4f378a] border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-600">{error}</div>
      )}

      {!loading && stats && (
        <>
          {/* System stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard icon={Users}       label="Total Users"       value={stats.totalUsers}       color="bg-blue-50"   iconColor="text-blue-600"   />
            <StatCard icon={FileText}    label="Total Applications" value={stats.totalApplications} color="bg-green-50"  iconColor="text-green-600"  />
            <StatCard icon={BookOpen}    label="Active Rules"       value={stats.activeRules}       color="bg-[#f0ebff]" iconColor="text-[#4f378a]"  />
            <StatCard icon={Landmark}    label="Schemes"            value={stats.totalSchemes}      color="bg-orange-50" iconColor="text-orange-600" />
          </div>

          {/* Review stats */}
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard icon={Clock}         label="Pending Review"  value={stats.reviewStats?.pendingApproval} color="bg-blue-50"   iconColor="text-blue-600"   sub="Awaiting first review" />
            <StatCard icon={Activity}      label="Under Review"    value={stats.reviewStats?.underReview}     color="bg-yellow-50" iconColor="text-yellow-600" sub="Being processed"       />
            <StatCard icon={CheckCircle}   label="Approved"        value={stats.reviewStats?.approved}        color="bg-green-50"  iconColor="text-green-600"  sub="All time"              />
            <StatCard icon={XCircle}       label="Rejected"        value={stats.reviewStats?.rejected}        color="bg-red-50"    iconColor="text-red-600"    sub="All time"              />
          </div>

          {/* Applications review table */}
          <div className="rounded-xl border border-[#e6e0e9] bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#e6e0e9] bg-[#fdf7ff] px-6 py-4">
              <div>
                <h2 className="font-bold text-[#1d1b20]">Applications for Review</h2>
                <p className="text-xs text-[#7a7582]">Submitted, under review, and inspection-pending applications</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={load}
                  className="flex items-center gap-1.5 rounded-lg border border-[#cbc4d2] px-3 py-1.5 text-xs font-semibold text-[#4f378a] hover:bg-[#f8f2fa]">
                  <RefreshCw size={13} /> Refresh
                </button>
                <button type="button" onClick={() => navigate("/admin/applications")}
                  className="flex items-center gap-1.5 rounded-lg bg-[#4f378a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#6750a4]">
                  View All
                </button>
              </div>
            </div>

            {apps.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3 text-center">
                <ShieldCheck className="h-12 w-12 text-[#cbc4d2]" />
                <p className="text-sm font-semibold text-[#494551]">No applications pending review</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#e6e0e9] text-left">
                      {["ID","Industry","Approval","Submitted","Status","Action"].map(h => (
                        <th key={h} className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#7a7582]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {apps.slice(0, 10).map((app, i) => (
                      <tr key={app._id} className={`border-b border-[#e6e0e9] last:border-0 ${i % 2 ? "bg-[#fdf7ff]" : ""}`}>
                        <td className="px-5 py-3 font-mono text-xs text-[#7a7582]">{app._id.slice(-8).toUpperCase()}</td>
                        <td className="px-5 py-3 font-semibold text-[#1d1b20]">{app.industryId?.companyName || "—"}</td>
                        <td className="px-5 py-3 text-[#494551]">{app.approvalId?.approvalName || "—"}</td>
                        <td className="px-5 py-3 text-[#7a7582]">{fmt(app.submissionDate)}</td>
                        <td className="px-5 py-3"><StatusBadge status={app.status} /></td>
                        <td className="px-5 py-3">
                          <button type="button"
                            onClick={() => navigate(`/admin/applications/${app._id}`)}
                            className="flex items-center gap-1.5 rounded-lg bg-[#4f378a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#6750a4]">
                            <Eye size={12} /> Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
