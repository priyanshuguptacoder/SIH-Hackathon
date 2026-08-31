import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Factory,
  LayoutDashboard,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock3,
  CalendarClock,
  ChevronRight,
  FileText,
  Search,
  RefreshCw,
  X,
  Kanban,
  List,
  AlertCircle,
  Leaf,
  HardHat,
  Flame,
  Building2,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import api from "../api/api";

// ── State machine — valid next steps from industry side ──────────────────────
// Admin handles: SUBMITTED→UNDER_REVIEW, UNDER_REVIEW→INSPECTION, *→APPROVED/REJECTED
// Industry can: NOT_STARTED→DOCUMENTS_PREPARED, DOCUMENTS_PREPARED→SUBMITTED, REJECTED→DOCUMENTS_PREPARED
const INDUSTRY_TRANSITIONS = {
  NOT_STARTED:        ["DOCUMENTS_PREPARED"],
  DOCUMENTS_PREPARED: ["SUBMITTED"],
  SUBMITTED:          [],
  UNDER_REVIEW:       [],
  INSPECTION:         [],
  APPROVED:           [],
  REJECTED:           ["DOCUMENTS_PREPARED"],
};

const TRANSITION_LABELS = {
  DOCUMENTS_PREPARED: "Mark Docs Prepared",
  SUBMITTED:          "Submit Application",
};

// ── Kanban columns ────────────────────────────────────────────────────────────
const COLUMNS = [
  { key: "NOT_STARTED",        label: "Not Started",    color: "border-t-[#7a7582]",   bg: "bg-[#f8f2fa]",    dot: "bg-[#7a7582]"    },
  { key: "DOCUMENTS_PREPARED", label: "Docs Prepared",  color: "border-t-blue-400",    bg: "bg-blue-50",      dot: "bg-blue-400"     },
  { key: "SUBMITTED",          label: "Submitted",      color: "border-t-purple-400",  bg: "bg-purple-50",    dot: "bg-purple-400"   },
  { key: "UNDER_REVIEW",       label: "Under Review",   color: "border-t-yellow-400",  bg: "bg-yellow-50",    dot: "bg-yellow-400"   },
  { key: "INSPECTION",         label: "Inspection",     color: "border-t-orange-400",  bg: "bg-orange-50",    dot: "bg-orange-400"   },
  { key: "APPROVED",           label: "Approved",       color: "border-t-green-400",   bg: "bg-green-50",     dot: "bg-green-500"    },
];

// REJECTED is rendered separately as a section below
const REJECTED_COL = { key: "REJECTED", label: "Rejected", dot: "bg-red-500" };

// ── Category icon map ─────────────────────────────────────────────────────────
const CAT_ICON = {
  "Environmental":    Leaf,
  "Labour & Safety":  HardHat,
  "Fire & Emergency": Flame,
  "Pre-establishment":Building2,
  "General":          ShieldCheck,
};

// ── SLA badge ─────────────────────────────────────────────────────────────────
function SLABadge({ sla }) {
  if (!sla) return null;
  const cfg = {
    NORMAL:     { color: "bg-green-100 text-green-700",   label: `${sla.daysLeft}d left` },
    APPROACHING:{ color: "bg-orange-100 text-orange-700", label: `${sla.daysLeft}d left` },
    BREACHED:   { color: "bg-red-100 text-red-700",       label: `${Math.abs(sla.daysLeft)}d overdue` },
  }[sla.status] || null;
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.color}`}>
      <CalendarClock size={9} /> {cfg.label}
    </span>
  );
}

// ── Status update modal ───────────────────────────────────────────────────────
function UpdateModal({ app, onClose, onUpdated }) {
  const transitions = INDUSTRY_TRANSITIONS[app.status] || [];
  const [target,   setTarget]   = useState(transitions[0] || "");
  const [remarks,  setRemarks]  = useState("");
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState("");

  const handleSave = async () => {
    if (!target) return;
    setSaving(true);
    setErr("");
    try {
      const res = await api.put(`/applications/${app._id}/status`, { status: target, remarks });
      onUpdated(res.data.data);
      onClose();
    } catch (e) {
      setErr(e.response?.data?.error?.message || e.response?.data?.error || "Failed to update status.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e6e0e9] px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-[#1d1b20]">Update Status</h2>
            <p className="text-xs text-[#494551] mt-0.5 truncate max-w-[280px]">{app.approvalId?.approvalName}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-[#e6e0e9]">
            <X size={17} className="text-[#494551]" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Current status */}
          <div className="flex items-center gap-3 rounded-xl border border-[#e6e0e9] bg-[#fdf7ff] px-4 py-3">
            <span className="text-xs font-semibold text-[#7a7582] uppercase tracking-wider">Current</span>
            <span className="ml-auto text-sm font-bold text-[#1d1b20]">{app.status.replace(/_/g, " ")}</span>
          </div>

          {transitions.length === 0 ? (
            <div className="rounded-xl border border-[#e6e0e9] bg-[#f8f2fa] px-4 py-4 text-center text-sm text-[#494551]">
              {app.status === "APPROVED"
                ? "This application has been approved — no further action needed."
                : "Waiting for authority action — no transitions available from your side."}
            </div>
          ) : (
            <>
              {/* Target status selector */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#7a7582]">Move to</p>
                <div className="space-y-2">
                  {transitions.map((t) => (
                    <label key={t} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                      target === t ? "border-[#4f378a] bg-[#f0ebff]" : "border-[#e6e0e9] hover:bg-[#f8f2fa]"
                    }`}>
                      <input type="radio" name="target" value={t} checked={target === t}
                        onChange={() => setTarget(t)} className="sr-only" />
                      <div className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                        target === t ? "border-[#4f378a] bg-[#4f378a]" : "border-[#cbc4d2]"
                      }`}>
                        {target === t && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-[#1d1b20]">{t.replace(/_/g, " ")}</span>
                        <p className="text-xs text-[#7a7582]">{TRANSITION_LABELS[t] || ""}</p>
                      </div>
                      <ArrowRight size={14} className="text-[#4f378a] shrink-0" />
                    </label>
                  ))}
                </div>
              </div>

              {/* Remarks */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#7a7582]">Remarks (optional)</p>
                <textarea
                  className="w-full rounded-xl border border-[#cbc4d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#4f378a] focus:ring-2 focus:ring-[#cfbcff] resize-none"
                  rows={3}
                  placeholder="Add a note about this status change…"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
            </>
          )}

          {err && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{err}</div>
          )}
        </div>

        {transitions.length > 0 && (
          <div className="flex gap-3 border-t border-[#e6e0e9] px-6 py-4">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-[#cbc4d2] px-4 py-2.5 text-sm font-semibold text-[#494551] hover:bg-[#f8f2fa]">
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={saving || !target}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#4f378a] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#6750a4] disabled:opacity-50">
              {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <>Confirm Update</>}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── Kanban card ───────────────────────────────────────────────────────────────
function KanbanCard({ app, onUpdate, onDetail }) {
  const approval   = app.approvalId || {};
  const CatIcon    = CAT_ICON[approval.category] || ShieldCheck;
  const canUpdate  = (INDUSTRY_TRANSITIONS[app.status] || []).length > 0;
  const lastEntry  = app.statusHistory?.at(-1);

  return (
    <div
      onClick={() => onDetail(app)}
      className="group cursor-pointer rounded-xl border border-[#cbc4d2] bg-white p-4 shadow-sm hover:border-[#4f378a] hover:shadow-md transition-all"
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f0ebff]">
          <CatIcon size={16} className="text-[#4f378a]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1d1b20] leading-tight line-clamp-2">
            {approval.approvalName || "—"}
          </p>
          <p className="mt-0.5 text-xs text-[#7a7582] truncate">{approval.authority || ""}</p>
        </div>
      </div>

      {/* Tags + SLA */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {approval.category && (
          <span className="rounded-full bg-[#f0ebff] px-2 py-0.5 text-[10px] font-semibold text-[#4f378a]">
            {approval.category}
          </span>
        )}
        {app.sla && <SLABadge sla={app.sla} />}
      </div>

      {/* Last update */}
      {lastEntry?.changedAt && (
        <p className="mb-3 text-xs text-[#7a7582]">
          Updated {new Date(lastEntry.changedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
          {lastEntry.remarks ? ` — ${lastEntry.remarks}` : ""}
        </p>
      )}

      {/* Dates */}
      {app.submissionDate && (
        <div className="mb-3 flex items-center gap-1 text-xs text-[#7a7582]">
          <CalendarClock size={11} />
          Submitted {new Date(app.submissionDate).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#e6e0e9]">
        {canUpdate && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onUpdate(app); }}
            className="flex items-center gap-1.5 rounded-lg bg-[#4f378a] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#6750a4] transition-colors"
          >
            Update Status
          </button>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDetail(app); }}
          className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-[#4f378a] hover:underline"
        >
          Details <ChevronRight size={11} />
        </button>
      </div>
    </div>
  );
}

// ── Timeline view ─────────────────────────────────────────────────────────────
function TimelineView({ apps, onUpdate, onDetail }) {
  const sorted = [...apps].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return (
    <div className="space-y-3">
      {sorted.map((app) => {
        const approval  = app.approvalId || {};
        const CatIcon   = CAT_ICON[approval.category] || ShieldCheck;
        const canUpdate = (INDUSTRY_TRANSITIONS[app.status] || []).length > 0;
        const col       = [...COLUMNS, REJECTED_COL].find((c) => c.key === app.status) || COLUMNS[0];

        return (
          <div
            key={app._id}
            onClick={() => onDetail(app)}
            className="group cursor-pointer rounded-xl border border-[#cbc4d2] bg-white shadow-sm hover:border-[#4f378a] hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4 p-4">
              {/* Category icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0ebff]">
                <CatIcon size={19} className="text-[#4f378a]" />
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-2 mb-1">
                  <p className="text-sm font-semibold text-[#1d1b20]">{approval.approvalName || "—"}</p>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${col.bg || "bg-[#e6e0e9]"} ${col.key === "REJECTED" ? "text-red-700" : "text-[#1d1b20]"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${col.dot}`} />
                    {col.label}
                  </span>
                  {app.sla && <SLABadge sla={app.sla} />}
                </div>
                <p className="text-xs text-[#7a7582]">{approval.authority || ""}</p>

                {/* Mini timeline */}
                <div className="mt-3 flex items-center gap-1 overflow-x-auto pb-1">
                  {COLUMNS.map((c, i) => {
                    const statusOrder = COLUMNS.map((c) => c.key);
                    const currentIdx  = statusOrder.indexOf(app.status);
                    const thisIdx     = i;
                    const done   = app.status !== "REJECTED" && thisIdx < currentIdx;
                    const active = app.status !== "REJECTED" && thisIdx === currentIdx;
                    const entry  = app.statusHistory?.find((h) => h.status === c.key);

                    return (
                      <div key={c.key} className="flex items-center gap-1 shrink-0">
                        <div className="flex flex-col items-center">
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center text-[9px] font-bold ${
                            done   ? "border-[#4f378a] bg-[#4f378a] text-white"
                            : active ? "border-[#4f378a] bg-white text-[#4f378a]"
                            : "border-[#cbc4d2] bg-white text-[#7a7582]"
                          }`}>
                            {done ? "✓" : i + 1}
                          </div>
                          <span className={`mt-0.5 text-[8px] font-semibold whitespace-nowrap ${active ? "text-[#4f378a]" : "text-[#7a7582]"}`}>
                            {c.label}
                          </span>
                          {entry?.changedAt && (
                            <span className="text-[7px] text-[#7a7582]">
                              {new Date(entry.changedAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short" })}
                            </span>
                          )}
                        </div>
                        {i < COLUMNS.length - 1 && (
                          <div className={`mb-4 h-0.5 w-4 ${done ? "bg-[#4f378a]" : "bg-[#e6e0e9]"}`} />
                        )}
                      </div>
                    );
                  })}
                  {app.status === "REJECTED" && (
                    <div className="ml-2 flex items-center gap-1.5 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                      <XCircle size={11} /> Rejected
                    </div>
                  )}
                </div>
              </div>

              {/* Right: actions */}
              <div className="flex shrink-0 flex-col items-end gap-2">
                {canUpdate && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onUpdate(app); }}
                    className="rounded-lg bg-[#4f378a] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#6750a4] whitespace-nowrap"
                  >
                    Update
                  </button>
                )}
                <span className="text-[10px] text-[#7a7582]">
                  {new Date(app.updatedAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Application Detail side panel ─────────────────────────────────────────────
function DetailPanel({ app, onClose, onUpdate, industryId }) {
  const navigate  = useNavigate();
  const approval  = app.approvalId || {};
  const CatIcon   = CAT_ICON[approval.category] || ShieldCheck;
  const canUpdate = (INDUSTRY_TRANSITIONS[app.status] || []).length > 0;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-[#e6e0e9] bg-[#f8f2fa] p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
            <CatIcon size={20} className="text-[#4f378a]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-[#1d1b20] leading-tight">{approval.approvalName || "—"}</h2>
            <p className="mt-0.5 text-xs text-[#4f378a] font-medium">{approval.authority || ""}</p>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-[#e6e0e9]">
            <X size={17} className="text-[#494551]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Current status + SLA */}
          <div className="flex items-center justify-between rounded-xl border border-[#e6e0e9] bg-[#fdf7ff] px-4 py-3">
            <div>
              <p className="text-xs text-[#7a7582] uppercase tracking-wider font-semibold mb-1">Status</p>
              <p className="text-sm font-bold text-[#1d1b20]">{app.status.replace(/_/g, " ")}</p>
            </div>
            {app.sla && (
              <div className="text-right">
                <p className="text-xs text-[#7a7582] uppercase tracking-wider font-semibold mb-1">SLA</p>
                <SLABadge sla={app.sla} />
              </div>
            )}
          </div>

          {/* Key dates */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Created",            date: app.createdAt      },
              { label: "Submitted",          date: app.submissionDate },
              { label: "Expected By",        date: app.expectedCompletionDate },
              { label: app.status === "APPROVED" ? "Approved" : app.status === "REJECTED" ? "Rejected" : null,
                date: app.approvalDate || app.rejectionDate },
            ].filter((d) => d.label && d.date).map(({ label, date }) => (
              <div key={label} className="rounded-lg border border-[#e6e0e9] bg-white px-3 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#7a7582] mb-0.5">{label}</p>
                <p className="text-xs font-semibold text-[#1d1b20]">
                  {new Date(date).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
                </p>
              </div>
            ))}
          </div>

          {/* Remarks */}
          {app.remarks && (
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-[#7a7582]">Remarks</p>
              <p className="rounded-xl border border-[#e6e0e9] bg-[#f8f2fa] px-4 py-3 text-sm text-[#494551]">{app.remarks}</p>
            </div>
          )}

          {/* Full status history */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#7a7582]">Status History</p>
            <ol className="relative space-y-1">
              <div className="absolute left-4 top-4 h-[calc(100%-32px)] w-0.5 bg-[#e6e0e9]" />
              {(app.statusHistory || []).map((entry, i) => (
                <li key={i} className="relative flex items-start gap-4 pb-4 last:pb-0">
                  <span className={`z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                    i === (app.statusHistory.length - 1)
                      ? "border-[#4f378a] bg-[#4f378a] text-white"
                      : "border-[#cbc4d2] bg-white text-[#7a7582]"
                  }`}>
                    {i === app.statusHistory.length - 1 ? <CheckCircle2 size={14} /> : i + 1}
                  </span>
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-semibold text-[#1d1b20]">{entry.status.replace(/_/g, " ")}</p>
                    <p className="text-xs text-[#7a7582]">
                      {new Date(entry.changedAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                      {entry.remarks ? ` — ${entry.remarks}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-[#e6e0e9] p-5 space-y-3">
          {canUpdate && (
            <button type="button" onClick={() => { onClose(); onUpdate(app); }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4f378a] px-4 py-3 text-sm font-bold text-white hover:bg-[#6750a4]">
              Update Status
            </button>
          )}
          {approval._id && industryId && (
            <button type="button"
              onClick={() => navigate(`/approval/${approval._id}/detail?industryId=${industryId}`)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#cbc4d2] px-4 py-2.5 text-sm font-semibold text-[#4f378a] hover:bg-[#f8f2fa]">
              <FileText size={15} /> View Full Approval Detail
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ApplicationTracking() {
  const navigate = useNavigate();

  const [apps,       setApps]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [industryId, setIndustryId] = useState(null);
  const [viewMode,   setViewMode]   = useState("kanban"); // kanban | timeline
  const [search,     setSearch]     = useState("");
  const [updating,   setUpdating]   = useState(null);  // app being updated
  const [detail,     setDetail]     = useState(null);  // app shown in panel

  const loadApps = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      // Get industry ID
      if (!industryId) {
        const indRes = await api.get("/industries/me");
        if (indRes.data?.data?._id) setIndustryId(indRes.data.data._id);
      }
      const res = await api.get("/applications");
      if (res.data?.success) setApps(res.data.data || []);
    } catch {
      if (!quiet) setError("Failed to load applications.");
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [industryId]);

  useEffect(() => { loadApps(); }, []); // eslint-disable-line

  const handleUpdated = (updated) => {
    setApps((prev) => prev.map((a) => a._id === updated._id ? { ...a, ...updated } : a));
    // Refresh detail panel
    setDetail((prev) => prev?._id === updated._id ? { ...prev, ...updated } : prev);
  };

  // Filter
  const visible = apps.filter((a) => {
    const name = a.approvalId?.approvalName || "";
    const auth = a.approvalId?.authority || "";
    return !search || name.toLowerCase().includes(search.toLowerCase()) || auth.toLowerCase().includes(search.toLowerCase());
  });

  // Kanban grouping
  const byStatus = (key) => visible.filter((a) => a.status === key);
  const rejected = visible.filter((a) => a.status === "REJECTED");

  // Stats
  const total    = apps.length;
  const approved = apps.filter((a) => a.status === "APPROVED").length;
  const inProg   = apps.filter((a) => ["SUBMITTED","UNDER_REVIEW","INSPECTION"].includes(a.status)).length;
  const pending  = apps.filter((a) => ["NOT_STARTED","DOCUMENTS_PREPARED"].includes(a.status)).length;

  return (
    <div className="min-h-screen bg-[#fdf7ff]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#cbc4d2] bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Factory className="h-7 w-7 text-[#4f378a]" />
          <span className="text-lg font-bold text-[#1d1b20]">Smart India Industrial Portal</span>
        </div>
        <button type="button" onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 rounded-lg border border-[#cbc4d2] px-4 py-2 text-sm font-semibold text-[#4f378a] hover:bg-[#f8f2fa]">
          <LayoutDashboard size={15} /> Dashboard
        </button>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Page title */}
        <div className="mb-6">
          <button type="button" onClick={() => navigate(-1)}
            className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[#4f378a] hover:underline">
            <ArrowLeft size={15} /> Back
          </button>
          <h1 className="text-2xl font-bold text-[#1d1b20]">Application Tracking</h1>
          <p className="text-sm text-[#494551]">Monitor and update the status of your regulatory applications</p>
        </div>

        {/* Stats */}
        {total > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "Total",       value: total,    cls: "border-[#cbc4d2] bg-white text-[#1d1b20]" },
              { label: "Approved",    value: approved, cls: "border-green-200 bg-green-50 text-green-700" },
              { label: "In Progress", value: inProg,   cls: "border-purple-200 bg-purple-50 text-purple-700" },
              { label: "Pending",     value: pending,  cls: "border-orange-200 bg-orange-50 text-orange-700" },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border p-4 text-center shadow-sm ${s.cls}`}>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs mt-0.5 font-semibold opacity-70">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7582]" />
            <input
              className="w-full rounded-lg border border-[#cbc4d2] bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#4f378a] focus:ring-2 focus:ring-[#cfbcff]"
              placeholder="Search applications…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex rounded-lg border border-[#cbc4d2] overflow-hidden bg-white">
            <button type="button" onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${
                viewMode === "kanban" ? "bg-[#4f378a] text-white" : "text-[#494551] hover:bg-[#f8f2fa]"}`}>
              <Kanban size={15} /> Kanban
            </button>
            <button type="button" onClick={() => setViewMode("timeline")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${
                viewMode === "timeline" ? "bg-[#4f378a] text-white" : "text-[#494551] hover:bg-[#f8f2fa]"}`}>
              <List size={15} /> Timeline
            </button>
          </div>

          <button type="button" onClick={() => loadApps()}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#cbc4d2] bg-white hover:bg-[#f8f2fa]">
            <RefreshCw size={15} className="text-[#4f378a]" />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-24 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#4f378a]" />
            <p className="text-sm text-[#494551]">Loading applications…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-red-500" />
            <p className="text-sm font-semibold text-red-600">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && total === 0 && (
          <div className="rounded-xl border border-[#cbc4d2] bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0ebff]">
              <Kanban className="h-7 w-7 text-[#4f378a]" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-[#1d1b20]">No Applications Yet</h2>
            <p className="text-sm text-[#494551] mb-6 max-w-sm mx-auto">
              Start by completing your industry profile and running the project analysis to get your approval roadmap.
            </p>
            <button type="button" onClick={() => navigate("/wizard")}
              className="rounded-xl bg-[#4f378a] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#6750a4]">
              Go to Profile Wizard
            </button>
          </div>
        )}

        {/* ── KANBAN VIEW ──────────────────────────────────────────────── */}
        {!loading && !error && total > 0 && viewMode === "kanban" && (
          <div>
            {/* Scrollable columns */}
            <div className="flex gap-4 overflow-x-auto pb-4">
              {COLUMNS.map((col) => {
                const colApps = byStatus(col.key);
                return (
                  <div key={col.key} className="flex w-64 shrink-0 flex-col">
                    {/* Column header */}
                    <div className={`mb-3 flex items-center justify-between rounded-xl border-t-4 ${col.color} ${col.bg} px-4 py-3 shadow-sm`}>
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#1d1b20]">{col.label}</span>
                      </div>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-[#1d1b20] shadow-sm">
                        {colApps.length}
                      </span>
                    </div>

                    {/* Cards */}
                    <div className="flex flex-col gap-3 min-h-[100px]">
                      {colApps.map((app) => (
                        <KanbanCard
                          key={app._id}
                          app={app}
                          onUpdate={setUpdating}
                          onDetail={setDetail}
                        />
                      ))}
                      {colApps.length === 0 && (
                        <div className="rounded-xl border-2 border-dashed border-[#e6e0e9] py-8 text-center text-xs text-[#7a7582]">
                          No applications
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rejected section */}
            {rejected.length > 0 && (
              <div className="mt-6">
                <div className="mb-3 flex items-center gap-2">
                  <XCircle size={16} className="text-red-500" />
                  <span className="text-sm font-bold text-red-600">Rejected ({rejected.length})</span>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {rejected.map((app) => (
                    <KanbanCard
                      key={app._id}
                      app={app}
                      onUpdate={setUpdating}
                      onDetail={setDetail}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TIMELINE VIEW ────────────────────────────────────────────── */}
        {!loading && !error && total > 0 && viewMode === "timeline" && (
          <TimelineView
            apps={visible}
            onUpdate={setUpdating}
            onDetail={setDetail}
          />
        )}
      </main>

      {/* Update modal */}
      {updating && (
        <UpdateModal
          app={updating}
          onClose={() => setUpdating(null)}
          onUpdated={handleUpdated}
        />
      )}

      {/* Detail panel */}
      {detail && (
        <DetailPanel
          app={detail}
          onClose={() => setDetail(null)}
          onUpdate={setUpdating}
          industryId={industryId}
        />
      )}
    </div>
  );
}
