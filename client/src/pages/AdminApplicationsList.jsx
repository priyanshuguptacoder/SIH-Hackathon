import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../api/api";
import { Eye, RefreshCw, Search, Filter } from "lucide-react";

const STATUS_CFG = {
  SUBMITTED:          { label: "Submitted",    cls: "bg-blue-100 text-blue-700"    },
  UNDER_REVIEW:       { label: "Under Review", cls: "bg-yellow-100 text-yellow-700"},
  INSPECTION:         { label: "Inspection",   cls: "bg-purple-100 text-purple-700"},
  APPROVED:           { label: "Approved",     cls: "bg-green-100 text-green-700"  },
  REJECTED:           { label: "Rejected",     cls: "bg-red-100 text-red-700"      },
  DOCUMENTS_PREPARED: { label: "Docs Ready",   cls: "bg-indigo-100 text-indigo-700"},
  NOT_STARTED:        { label: "Not Started",  cls: "bg-gray-100 text-gray-600"    },
};

const FILTERS = ["ALL", "SUBMITTED", "UNDER_REVIEW", "INSPECTION", "APPROVED", "REJECTED"];

export default function AdminApplicationsList() {
  const navigate = useNavigate();
  const [apps,    setApps]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("ALL");
  const [search,  setSearch]  = useState("");

  const load = async (status) => {
    setLoading(true);
    try {
      const url = status && status !== "ALL"
        ? `/admin/applications?status=${status}`
        : "/admin/applications?status=ALL";
      const res = await api.get(url);
      if (res.data?.success) setApps(res.data.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(filter); }, [filter]);

  const fmt = (d) => d
    ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })
    : "—";

  const visible = apps.filter(a =>
    !search ||
    (a.industryId?.companyName || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.approvalId?.approvalName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Applications" subtitle="All applications — review, approve, or reject">
      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7582]" />
          <input
            className="w-full rounded-xl border border-[#cbc4d2] bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#4f378a] focus:ring-2 focus:ring-[#cfbcff]"
            placeholder="Search by industry or approval…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map(f => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                filter === f ? "bg-[#4f378a] text-white" : "border border-[#cbc4d2] bg-white text-[#494551] hover:bg-[#f8f2fa]"
              }`}>
              {f === "ALL" ? "All" : f.replace(/_/g, " ")}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => load(filter)}
          className="flex items-center gap-1.5 rounded-xl border border-[#cbc4d2] px-4 py-2.5 text-sm font-semibold text-[#4f378a] hover:bg-[#f8f2fa]">
          <RefreshCw size={15} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#4f378a] border-t-transparent" />
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-[#e6e0e9] bg-white p-12 text-center">
          <p className="text-sm text-[#494551]">No applications found.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#e6e0e9] bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e6e0e9] bg-[#fdf7ff] text-left">
                  {["ID","Industry","Approval","Submitted","Expected By","Status","Action"].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#7a7582]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((app, i) => {
                  const cfg = STATUS_CFG[app.status] || STATUS_CFG.NOT_STARTED;
                  return (
                    <tr key={app._id} className={`border-b border-[#e6e0e9] last:border-0 ${i%2 ? "bg-[#fdf7ff]" : ""}`}>
                      <td className="px-5 py-3 font-mono text-xs text-[#7a7582]">{app._id.slice(-8).toUpperCase()}</td>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-[#1d1b20]">{app.industryId?.companyName || "—"}</p>
                        <p className="text-xs text-[#7a7582]">{app.industryId?.sector} · {app.industryId?.state}</p>
                      </td>
                      <td className="px-5 py-3 text-[#494551]">{app.approvalId?.approvalName || "—"}</td>
                      <td className="px-5 py-3 text-xs text-[#7a7582]">{fmt(app.submissionDate)}</td>
                      <td className="px-5 py-3 text-xs text-[#7a7582]">{fmt(app.expectedCompletionDate)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.cls}`}>{cfg.label}</span>
                      </td>
                      <td className="px-5 py-3">
                        <button type="button" onClick={() => navigate(`/admin/applications/${app._id}`)}
                          className="flex items-center gap-1.5 rounded-lg bg-[#4f378a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#6750a4]">
                          <Eye size={12} /> Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-[#e6e0e9] bg-[#fdf7ff] px-5 py-3 text-xs text-[#7a7582]">
            Showing {visible.length} of {apps.length} applications
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
