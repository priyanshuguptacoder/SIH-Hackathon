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
  CalendarClock,
  ClipboardList,
  Plus,
  Search,
  RefreshCw,
  X,
  Building2,
  FileText,
  ScanSearch,
  ChevronRight,
} from "lucide-react";
import api from "../api/api";

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  SCHEDULED:  { label: "Scheduled",  icon: CalendarClock,  color: "text-orange-600",  bg: "bg-orange-50",  border: "border-orange-200", dot: "bg-orange-500"  },
  COMPLETED:  { label: "Completed",  icon: CheckCircle2,   color: "text-green-600",   bg: "bg-green-50",   border: "border-green-200",  dot: "bg-green-500"   },
  CANCELLED:  { label: "Cancelled",  icon: XCircle,        color: "text-[#7a7582]",   bg: "bg-[#f2f2f2]",  border: "border-[#cbc4d2]",  dot: "bg-[#7a7582]"   },
};

function StatusBadge({ status }) {
  const cfg  = STATUS_CFG[status] || STATUS_CFG.SCHEDULED;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function daysFromNow(date) {
  return Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
}

function dateLabel(date) {
  const d = daysFromNow(date);
  if (d < 0)  return { text: `${Math.abs(d)}d ago`,    cls: "text-[#7a7582]" };
  if (d === 0) return { text: "Today",                  cls: "text-orange-600 font-bold" };
  if (d <= 3) return { text: `In ${d} day${d > 1 ? "s" : ""}`, cls: "text-orange-500 font-semibold" };
  return       { text: `In ${d} days`,                  cls: "text-[#494551]" };
}

// ── Schedule Inspection Modal ─────────────────────────────────────────────────
function ScheduleModal({ onClose, onScheduled }) {
  const [apps,        setApps]        = useState([]);   // INSPECTION-status apps
  const [loadingApps, setLoadingApps] = useState(true);
  const [appId,       setAppId]       = useState("");
  const [department,  setDepartment]  = useState("");
  const [date,        setDate]        = useState("");
  const [saving,      setSaving]      = useState(false);
  const [err,         setErr]         = useState("");

  // Load apps that are in INSPECTION state
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/applications");
        const inspection = (res.data?.data || []).filter((a) => a.status === "INSPECTION");
        setApps(inspection);
        if (inspection.length > 0) setAppId(inspection[0]._id);
      } catch {
        setErr("Failed to load applications.");
      } finally {
        setLoadingApps(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async () => {
    if (!appId || !department.trim() || !date) {
      setErr("All fields are required.");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      const res = await api.post("/inspections", {
        applicationId: appId,
        department: department.trim(),
        scheduledDate: date,
      });
      onScheduled(res.data.data);
      onClose();
    } catch (e) {
      setErr(
        e.response?.data?.error?.message ||
        e.response?.data?.error ||
        "Failed to schedule inspection."
      );
    } finally {
      setSaving(false);
    }
  };

  // Minimum date = today
  const today = new Date().toISOString().split("T")[0];

  const inputCls = "w-full rounded-lg border border-[#cbc4d2] bg-white px-4 py-2.5 text-sm text-[#1d1b20] outline-none focus:border-[#4f378a] focus:ring-2 focus:ring-[#cfbcff]";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e6e0e9] px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-[#1d1b20]">Schedule Inspection</h2>
            <p className="text-xs text-[#494551] mt-0.5">Record an upcoming inspection from the authority</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-[#e6e0e9]">
            <X size={17} className="text-[#494551]" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {loadingApps ? (
            <div className="flex items-center justify-center py-6 gap-2 text-sm text-[#7a7582]">
              <Loader2 size={16} className="animate-spin" /> Loading applications…
            </div>
          ) : apps.length === 0 ? (
            <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-4 text-sm text-orange-700">
              <p className="font-semibold mb-1">No applications pending inspection</p>
              <p className="text-xs">Only applications in <strong>Inspection</strong> status can have an inspection scheduled. An admin needs to move the application to that state first.</p>
            </div>
          ) : (
            <>
              {/* Application selector */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#7a7582]">
                  Application <span className="text-red-500">*</span>
                </label>
                <select
                  className={inputCls}
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                >
                  {apps.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.approvalId?.approvalName || a._id} — {a.approvalId?.authority || ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#7a7582]">
                  Inspecting Department / Authority <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputCls}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Maharashtra Pollution Control Board"
                />
              </div>

              {/* Date */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#7a7582]">
                  Scheduled Date <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputCls}
                  type="date"
                  min={today}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </>
          )}

          {err && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{err}</div>
          )}
        </div>

        <div className="flex gap-3 border-t border-[#e6e0e9] px-6 py-4">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-xl border border-[#cbc4d2] px-4 py-2.5 text-sm font-semibold text-[#494551] hover:bg-[#f8f2fa]">
            Cancel
          </button>
          {apps.length > 0 && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || !appId || !department.trim() || !date}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#4f378a] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#6750a4] disabled:opacity-50"
            >
              {saving ? <><Loader2 size={15} className="animate-spin" /> Scheduling…</> : <><CalendarClock size={15} /> Schedule</>}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ── Update Status Modal ───────────────────────────────────────────────────────
function UpdateModal({ inspection, onClose, onUpdated }) {
  const NEXT = { SCHEDULED: ["COMPLETED", "CANCELLED"] };
  const transitions = NEXT[inspection.status] || [];

  const [target,  setTarget]  = useState(transitions[0] || "");
  const [remarks, setRemarks] = useState(inspection.remarks || "");
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");

  const handleSave = async () => {
    if (!target) return;
    setSaving(true);
    setErr("");
    try {
      const res = await api.put(`/inspections/${inspection._id}`, { status: target, remarks });
      onUpdated(res.data.data);
      onClose();
    } catch (e) {
      setErr(e.response?.data?.error?.message || e.response?.data?.error || "Failed to update inspection.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full rounded-xl border border-[#cbc4d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#4f378a] focus:ring-2 focus:ring-[#cfbcff] resize-none";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e6e0e9] px-6 py-4">
          <h2 className="text-base font-bold text-[#1d1b20]">Update Inspection</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-[#e6e0e9]">
            <X size={17} className="text-[#494551]" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Current status */}
          <div className="flex items-center justify-between rounded-xl border border-[#e6e0e9] bg-[#fdf7ff] px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7a7582]">Current</span>
            <StatusBadge status={inspection.status} />
          </div>

          {transitions.length === 0 ? (
            <div className="rounded-xl border border-[#e6e0e9] bg-[#f8f2fa] px-4 py-4 text-center text-sm text-[#494551]">
              This inspection is already {inspection.status.toLowerCase()} — no further updates possible.
            </div>
          ) : (
            <>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#7a7582]">Mark as</p>
                <div className="space-y-2">
                  {transitions.map((t) => {
                    const cfg = STATUS_CFG[t];
                    const Icon = cfg.icon;
                    return (
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
                        <Icon size={15} className={cfg.color} />
                        <span className="text-sm font-semibold text-[#1d1b20]">{cfg.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#7a7582]">Remarks (optional)</p>
                <textarea
                  className={inputCls}
                  rows={3}
                  placeholder="Inspector notes, outcome, reason for cancellation…"
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

// ── Inspection Card ───────────────────────────────────────────────────────────
function InspectionCard({ inspection, onUpdate }) {
  const navigate  = useNavigate();
  const app       = inspection.applicationId || {};
  const approval  = app.approvalId || {};
  const cfg       = STATUS_CFG[inspection.status] || STATUS_CFG.SCHEDULED;
  const dl        = dateLabel(inspection.scheduledDate);
  const canUpdate = inspection.status === "SCHEDULED";

  return (
    <div className={`rounded-xl border bg-white shadow-sm transition-all hover:shadow-md ${cfg.border}`}>
      {/* Top colour stripe */}
      <div className={`h-1 w-full rounded-t-xl ${cfg.dot}`} />

      <div className="flex items-start gap-4 p-4">
        {/* Icon */}
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
          <ScanSearch size={20} className={cfg.color} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-[#1d1b20] leading-tight">
              {approval.approvalName || "—"}
            </p>
            <StatusBadge status={inspection.status} />
          </div>

          <p className="text-xs font-medium text-[#4f378a] mb-2">{inspection.department}</p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[#7a7582]">
            <span className="flex items-center gap-1">
              <CalendarClock size={11} />
              {new Date(inspection.scheduledDate).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
              })}
            </span>
            <span className={`font-semibold ${dl.cls}`}>{dl.text}</span>
          </div>

          {inspection.remarks && (
            <p className="mt-2 rounded-lg border border-[#e6e0e9] bg-[#fdf7ff] px-3 py-2 text-xs text-[#494551] italic">
              {inspection.remarks}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          {canUpdate && (
            <button
              type="button"
              onClick={() => onUpdate(inspection)}
              className="flex items-center gap-1.5 rounded-lg bg-[#4f378a] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#6750a4] transition-colors"
            >
              Update
            </button>
          )}
          {approval._id && app.industryId && (
            <button
              type="button"
              onClick={() => navigate(`/approval/${approval._id}/detail?industryId=${app.industryId}`)}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#4f378a] hover:underline"
            >
              View Approval <ChevronRight size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Inspections() {
  const navigate = useNavigate();

  const [inspections,   setInspections]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [search,        setSearch]        = useState("");
  const [filter,        setFilter]        = useState("ALL"); // ALL | SCHEDULED | COMPLETED | CANCELLED
  const [showSchedule,  setShowSchedule]  = useState(false);
  const [updating,      setUpdating]      = useState(null);  // inspection being updated
  const [toast,         setToast]         = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const res = await api.get("/inspections");
      if (res.data?.success) setInspections(res.data.data || []);
    } catch {
      if (!quiet) setError("Failed to load inspections.");
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleScheduled = (newInspection) => {
    setInspections((prev) => [newInspection, ...prev]);
    showToast("Inspection scheduled successfully.");
  };

  const handleUpdated = (updated) => {
    setInspections((prev) =>
      prev.map((i) => i._id === updated._id ? { ...i, ...updated } : i)
    );
    showToast("Inspection updated.");
  };

  // Filter + search
  const visible = inspections.filter((i) => {
    const approval = i.applicationId?.approvalId?.approvalName || "";
    const dept     = i.department || "";
    const matchSearch = !search ||
      approval.toLowerCase().includes(search.toLowerCase()) ||
      dept.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || i.status === filter;
    return matchSearch && matchFilter;
  });

  // Stats
  const total     = inspections.length;
  const scheduled = inspections.filter((i) => i.status === "SCHEDULED").length;
  const completed = inspections.filter((i) => i.status === "COMPLETED").length;
  const cancelled = inspections.filter((i) => i.status === "CANCELLED").length;

  // Upcoming — sorted by date asc, then completed/cancelled
  const sorted = [...visible].sort((a, b) => {
    if (a.status === "SCHEDULED" && b.status !== "SCHEDULED") return -1;
    if (b.status === "SCHEDULED" && a.status !== "SCHEDULED") return 1;
    return new Date(a.scheduledDate) - new Date(b.scheduledDate);
  });

  const FILTER_TABS = [
    { key: "ALL",       label: "All",       count: total     },
    { key: "SCHEDULED", label: "Scheduled", count: scheduled },
    { key: "COMPLETED", label: "Completed", count: completed },
    { key: "CANCELLED", label: "Cancelled", count: cancelled },
  ];

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

      <main className="mx-auto max-w-3xl px-4 py-10">
        {/* Back + Title */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <button type="button" onClick={() => navigate(-1)}
              className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[#4f378a] hover:underline">
              <ArrowLeft size={15} /> Back
            </button>
            <h1 className="text-2xl font-bold text-[#1d1b20]">Inspections</h1>
            <p className="text-sm text-[#494551]">Track government inspection visits across all your applications</p>
          </div>

          <button
            type="button"
            onClick={() => setShowSchedule(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-[#4f378a] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#6750a4] transition-colors"
          >
            <Plus size={15} /> Schedule Inspection
          </button>
        </div>

        {/* Stats */}
        {total > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-3">
            {[
              { label: "Scheduled", value: scheduled, cls: "border-orange-200 bg-orange-50 text-orange-700" },
              { label: "Completed", value: completed, cls: "border-green-200 bg-green-50 text-green-700"    },
              { label: "Cancelled", value: cancelled, cls: "border-[#cbc4d2] bg-white text-[#7a7582]"       },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border p-4 text-center shadow-sm ${s.cls}`}>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs mt-0.5 font-semibold opacity-70">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="mb-5 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7582]" />
            <input
              className="w-full rounded-lg border border-[#cbc4d2] bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#4f378a] focus:ring-2 focus:ring-[#cfbcff]"
              placeholder="Search by approval or department…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {FILTER_TABS.map((tab) => (
              <button key={tab.key} type="button"
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  filter === tab.key ? "bg-[#4f378a] text-white" : "border border-[#cbc4d2] bg-white text-[#494551] hover:bg-[#f8f2fa]"
                }`}>
                {tab.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  filter === tab.key ? "bg-white/20 text-white" : "bg-[#e6e0e9] text-[#494551]"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <button type="button" onClick={() => load()}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#cbc4d2] bg-white hover:bg-[#f8f2fa]">
            <RefreshCw size={15} className="text-[#4f378a]" />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-24 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#4f378a]" />
            <p className="text-sm text-[#494551]">Loading inspections…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-red-500" />
            <p className="text-sm font-semibold text-red-600">{error}</p>
            <button type="button" onClick={() => load()}
              className="mt-4 rounded-lg bg-[#4f378a] px-5 py-2 text-sm font-semibold text-white hover:bg-[#6750a4]">
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && total === 0 && (
          <div
            className="flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-[#cbc4d2] bg-white px-6 py-20 text-center hover:border-[#4f378a] hover:bg-[#f8f2fa] transition-colors"
            onClick={() => setShowSchedule(true)}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0ebff]">
              <ScanSearch size={30} className="text-[#4f378a]" />
            </div>
            <div>
              <p className="text-lg font-semibold text-[#1d1b20]">No inspections yet</p>
              <p className="text-sm text-[#494551]">
                When an application moves to Inspection status, schedule the visit here.
              </p>
            </div>
            <span className="rounded-xl bg-[#4f378a] px-6 py-2.5 text-sm font-bold text-white">
              Schedule First Inspection
            </span>
          </div>
        )}

        {/* No results */}
        {!loading && !error && total > 0 && sorted.length === 0 && (
          <div className="rounded-xl border border-[#cbc4d2] bg-white p-10 text-center">
            <Search className="mx-auto mb-3 h-8 w-8 text-[#7a7582]" />
            <p className="text-sm font-semibold text-[#1d1b20]">No inspections match your filter</p>
            <button type="button" onClick={() => { setSearch(""); setFilter("ALL"); }}
              className="mt-3 text-sm font-semibold text-[#4f378a] hover:underline">
              Clear filters
            </button>
          </div>
        )}

        {/* List */}
        {!loading && !error && sorted.length > 0 && (
          <div className="space-y-3">
            {sorted.map((inspection) => (
              <InspectionCard
                key={inspection._id}
                inspection={inspection}
                onUpdate={setUpdating}
              />
            ))}
          </div>
        )}
      </main>

      {/* Schedule modal */}
      {showSchedule && (
        <ScheduleModal
          onClose={() => setShowSchedule(false)}
          onScheduled={handleScheduled}
        />
      )}

      {/* Update modal */}
      {updating && (
        <UpdateModal
          inspection={updating}
          onClose={() => setUpdating(null)}
          onUpdated={handleUpdated}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg transition-all ${
          toast.type === "error" ? "bg-red-600 text-white" : "bg-[#4f378a] text-white"
        }`}>
          {toast.type === "error" ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
