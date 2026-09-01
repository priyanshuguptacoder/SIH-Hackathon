import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../api/api";
import { ScrollText, RefreshCw, Search, ChevronDown, ChevronUp } from "lucide-react";

const ACTION_CFG = {
  APPLICATION_CREATED:  { cls: "bg-blue-100 text-blue-700"    },
  STATUS_CHANGED:       { cls: "bg-yellow-100 text-yellow-700" },
  ADMIN_APPROVE:        { cls: "bg-green-100 text-green-700"   },
  ADMIN_REJECT:         { cls: "bg-red-100 text-red-700"       },
  ADMIN_INSPECTION:     { cls: "bg-purple-100 text-purple-700" },
  ADMIN_QUERY:          { cls: "bg-orange-100 text-orange-700" },
  RULE_CREATED:         { cls: "bg-indigo-100 text-indigo-700" },
  RULE_UPDATED:         { cls: "bg-indigo-100 text-indigo-700" },
  APPROVAL_CREATED:     { cls: "bg-teal-100 text-teal-700"     },
  APPROVAL_UPDATED:     { cls: "bg-teal-100 text-teal-700"     },
  REGULATION_UPLOADED:  { cls: "bg-pink-100 text-pink-700"     },
};

function ActionBadge({ action }) {
  const cfg = ACTION_CFG[action] || { cls: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${cfg.cls}`}>
      {action?.replace(/_/g, " ")}
    </span>
  );
}

function LogRow({ log }) {
  const [open, setOpen] = useState(false);
  const hasDetail = log.previousValue || log.newValue;

  return (
    <tr className="border-b border-[#e6e0e9] last:border-0 hover:bg-[#fdf7ff] transition-colors">
      <td className="px-4 py-3 text-xs text-[#7a7582] whitespace-nowrap">
        {new Date(log.createdAt).toLocaleString("en-IN", {
          day: "2-digit", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })}
      </td>
      <td className="px-4 py-3">
        <p className="text-xs font-semibold text-[#1d1b20]">{log.userId?.name || "System"}</p>
        <p className="text-[10px] text-[#7a7582]">{log.userId?.email || "—"}</p>
      </td>
      <td className="px-4 py-3"><ActionBadge action={log.action} /></td>
      <td className="px-4 py-3 text-xs text-[#494551]">{log.targetModel || "—"}</td>
      <td className="px-4 py-3 font-mono text-[10px] text-[#7a7582]">
        {log.targetId?.toString().slice(-8).toUpperCase() || "—"}
      </td>
      <td className="px-4 py-3">
        {hasDetail && (
          <button type="button" onClick={() => setOpen(o => !o)}
            className="flex items-center gap-1 text-[10px] font-semibold text-[#4f378a] hover:underline">
            {open ? <><ChevronUp size={11} />Hide</> : <><ChevronDown size={11} />Detail</>}
          </button>
        )}
      </td>
      {open && (
        <tr className="bg-[#fdf7ff]">
          <td colSpan={6} className="px-4 pb-3">
            <div className="grid grid-cols-2 gap-3">
              {log.previousValue && (
                <div>
                  <p className="mb-1 text-[10px] font-bold text-[#7a7582]">Previous</p>
                  <pre className="rounded-lg bg-[#1e1a2e] text-red-300 px-3 py-2 text-[10px] overflow-x-auto">
                    {JSON.stringify(log.previousValue, null, 2)}
                  </pre>
                </div>
              )}
              {log.newValue && (
                <div>
                  <p className="mb-1 text-[10px] font-bold text-[#7a7582]">New</p>
                  <pre className="rounded-lg bg-[#1e1a2e] text-green-300 px-3 py-2 text-[10px] overflow-x-auto">
                    {JSON.stringify(log.newValue, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </tr>
  );
}

export default function AdminAuditLog() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/audit-logs?limit=200");
      if (res.data?.success) setLogs(res.data.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const visible = logs.filter(l =>
    !search ||
    (l.action || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.userId?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.targetModel || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Audit Log" subtitle="Complete history of admin and system actions">
      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7582]" />
          <input
            className="w-full rounded-xl border border-[#cbc4d2] bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#4f378a] focus:ring-2 focus:ring-[#cfbcff]"
            placeholder="Search by action, user, or model…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button type="button" onClick={load}
          className="flex items-center gap-1.5 rounded-xl border border-[#cbc4d2] px-4 py-2.5 text-sm font-semibold text-[#4f378a] hover:bg-[#f8f2fa]">
          <RefreshCw size={15} /> Refresh
        </button>
        <span className="flex items-center text-sm text-[#7a7582]">{logs.length} entries</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#4f378a] border-t-transparent" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-[#e6e0e9] bg-white py-20 text-center">
          <ScrollText className="h-12 w-12 text-[#cbc4d2]" />
          <p className="text-sm font-semibold text-[#494551]">No audit entries yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#e6e0e9] bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e6e0e9] bg-[#fdf7ff] text-left">
                  {["Timestamp","User","Action","Model","Target ID","Detail"].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#7a7582]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map(log => <LogRow key={log._id} log={log} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
