import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Factory,
  LayoutDashboard,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  CalendarClock,
  Search,
  RefreshCw,
  ChevronRight,
  BarChart3,
  Repeat,
  ShieldCheck,
  Circle,
  XCircle,
  Flame,
  TrendingUp,
} from "lucide-react";
import api from "../api/api";

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CFG = {
  UPCOMING:  { label: "Upcoming",  icon: Clock3,        color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200",   dot: "bg-blue-500",   ring: "ring-blue-200"   },
  DUE:       { label: "Due",       icon: AlertTriangle, color: "text-orange-600",  bg: "bg-orange-50",  border: "border-orange-200", dot: "bg-orange-500", ring: "ring-orange-200" },
  OVERDUE:   { label: "Overdue",   icon: Flame,         color: "text-red-600",     bg: "bg-red-50",     border: "border-red-200",    dot: "bg-red-500",    ring: "ring-red-200"    },
  COMPLETED: { label: "Completed", icon: CheckCircle2,  color: "text-green-600",   bg: "bg-green-50",   border: "border-green-200",  dot: "bg-green-500",  ring: "ring-green-200"  },
};

const RECURRENCE_LABEL = {
  ONE_TIME:  "One-time",
  MONTHLY:   "Monthly",
  QUARTERLY: "Quarterly",
  ANNUAL:    "Annual",
  RENEWAL:   "Renewal",
};

function StatusBadge({ status }) {
  const cfg  = STATUS_CFG[status] || STATUS_CFG.UPCOMING;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function daysUntil(date) {
  const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

function dueDateLabel(date, status) {
  if (status === "COMPLETED") return null;
  const d = daysUntil(date);
  if (d < 0)  return { text: `${Math.abs(d)}d overdue`, cls: "text-red-600 font-bold" };
  if (d === 0) return { text: "Due today",               cls: "text-orange-600 font-bold" };
  if (d <= 7) return { text: `${d}d left`,               cls: "text-orange-500 font-semibold" };
  return { text: `${d}d left`,                           cls: "text-[#7a7582]" };
}

// ── Compliance Score Ring ─────────────────────────────────────────────────────
function ScoreRing({ score, total, completed }) {
  const pct    = score;
  const radius = 54;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;
  const color  = pct >= 80 ? "#22c55e" : pct >= 50 ? "#4f378a" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex h-36 w-36 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" width="144" height="144">
          <circle cx="72" cy="72" r={radius} strokeWidth="10" stroke="#e6e0e9" fill="none" />
          <circle
            cx="72" cy="72" r={radius}
            strokeWidth="10" stroke={color} fill="none"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="text-center z-10">
          <p className="text-3xl font-black" style={{ color }}>{pct}%</p>
          <p className="text-xs font-semibold text-[#7a7582]">Score</p>
        </div>
      </div>
      <div className="flex gap-4 text-xs text-[#494551]">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" />{completed} done</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#e6e0e9]" />{total - completed} pending</span>
      </div>
    </div>
  );
}

// ── Compliance item row card ───────────────────────────────────────────────────
function ComplianceCard({ item, onComplete, completing }) {
  const navigate  = useNavigate();
  const cfg       = STATUS_CFG[item.status] || STATUS_CFG.UPCOMING;
  const Icon      = cfg.icon;
  const due       = dueDateLabel(item.dueDate, item.status);
  const canDone   = ["UPCOMING","DUE","OVERDUE"].includes(item.status);

  return (
    <div
      className={`group cursor-pointer rounded-xl border bg-white shadow-sm transition-all hover:shadow-md hover:border-[#4f378a] ${cfg.border}`}
      onClick={() => navigate(`/compliance/${item._id}`)}
    >
      {/* Status stripe */}
      <div className={`h-1 w-full rounded-t-xl ${cfg.dot}`} />

      <div className="flex items-start gap-4 p-4">
        {/* Status icon */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
          <Icon size={19} className={cfg.color} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1d1b20] leading-tight">{item.requirementText}</p>
          <p className="mt-0.5 text-xs text-[#4f378a] font-medium">
            {item.approvalId?.approvalName || "—"}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#7a7582]">
            <span className="flex items-center gap-1">
              <CalendarClock size={11} />
              {new Date(item.dueDate).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
            </span>
            <span className="flex items-center gap-1">
              <Repeat size={11} />
              {RECURRENCE_LABEL[item.recurrence] || item.recurrence}
            </span>
            {due && <span className={due.cls}>{due.text}</span>}
          </div>
        </div>

        {/* Right */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusBadge status={item.status} />
          {canDone && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onComplete(item._id); }}
              disabled={completing === item._id}
              className="flex items-center gap-1.5 rounded-lg bg-[#4f378a] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#6750a4] disabled:opacity-50 transition-colors"
            >
              {completing === item._id
                ? <Loader2 size={11} className="animate-spin" />
                : <CheckCircle2 size={11} />}
              Done
            </button>
          )}
          <ChevronRight size={14} className="text-[#7a7582] group-hover:text-[#4f378a]" />
        </div>
      </div>

      {/* Proof indicator */}
      {item.proofUrl && (
        <div className="border-t border-[#e6e0e9] px-4 py-2 flex items-center gap-1.5 text-xs text-green-600 font-semibold">
          <CheckCircle2 size={11} /> Proof uploaded
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const FILTER_TABS = ["ALL","UPCOMING","DUE","OVERDUE","COMPLETED"];

export default function ComplianceDashboard() {
  const navigate = useNavigate();

  const [items,      setItems]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [filter,     setFilter]     = useState("ALL");
  const [search,     setSearch]     = useState("");
  const [completing, setCompleting] = useState(null);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const res = await api.get("/compliance");
      if (res.data?.success) setItems(res.data.data || []);
    } catch {
      if (!quiet) setError("Failed to load compliance items.");
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleComplete = async (id) => {
    setCompleting(id);
    try {
      const res = await api.put(`/compliance/${id}`, { status: "COMPLETED" });
      if (res.data?.success) {
        // Refresh the list (new recurring item may have been created)
        await load(true);
      }
    } catch (e) {
      alert(e.response?.data?.error?.message || "Failed to mark as completed.");
    } finally {
      setCompleting(null);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const total     = items.length;
  const completed = items.filter((i) => i.status === "COMPLETED").length;
  const overdue   = items.filter((i) => i.status === "OVERDUE").length;
  const due       = items.filter((i) => i.status === "DUE").length;
  const upcoming  = items.filter((i) => i.status === "UPCOMING").length;
  const score     = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Auto-compute DUE/OVERDUE from UPCOMING based on dueDate
  const effectiveStatus = (item) => {
    if (item.status === "COMPLETED") return "COMPLETED";
    const d = daysUntil(item.dueDate);
    if (d < 0)  return "OVERDUE";
    if (d <= 7) return "DUE";
    return "UPCOMING";
  };

  const visible = items
    .filter((i) => {
      const eff = effectiveStatus(i);
      const matchFilter = filter === "ALL" || eff === filter;
      const matchSearch = !search ||
        i.requirementText.toLowerCase().includes(search.toLowerCase()) ||
        (i.approvalId?.approvalName || "").toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    })
    .sort((a, b) => {
      if (a.status === "COMPLETED" && b.status !== "COMPLETED") return 1;
      if (b.status === "COMPLETED" && a.status !== "COMPLETED") return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

  const tabCount = (tab) => {
    if (tab === "ALL") return total;
    return items.filter((i) => effectiveStatus(i) === tab).length;
  };

  return (
    <div className="min-h-screen bg-[#fdf7ff]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#cbc4d2] bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <img src="/udyog-sanchar-icon.png" alt="UdyogSanchar" className="h-10 w-auto" />
          <span className="text-lg font-bold text-[#1d1b20]">UdyogSanchar</span>
        </div>
        <button type="button" onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 rounded-lg border border-[#cbc4d2] px-4 py-2 text-sm font-semibold text-[#4f378a] hover:bg-[#f8f2fa]">
          <LayoutDashboard size={15} /> Dashboard
        </button>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        {/* Back + Title */}
        <div className="mb-8">
          <button type="button" onClick={() => navigate(-1)}
            className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[#4f378a] hover:underline">
            <ArrowLeft size={15} /> Back
          </button>
          <h1 className="text-2xl font-bold text-[#1d1b20]">Compliance Tracker</h1>
          <p className="text-sm text-[#494551]">Post-approval obligations — track, upload proof, and mark complete</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-24 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#4f378a]" />
            <p className="text-sm text-[#494551]">Loading compliance items…</p>
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
              <ShieldCheck className="h-7 w-7 text-[#4f378a]" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-[#1d1b20]">No Compliance Items Yet</h2>
            <p className="text-sm text-[#494551] max-w-sm mx-auto">
              Compliance obligations are created automatically when an application is approved.
            </p>
            <button type="button" onClick={() => navigate("/applications")}
              className="mt-5 rounded-xl bg-[#4f378a] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#6750a4]">
              View Applications
            </button>
          </div>
        )}

        {!loading && !error && total > 0 && (
          <>
            {/* Score + stat cards */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr]">
              {/* Score ring */}
              <div className="flex items-center justify-center rounded-xl border border-[#cbc4d2] bg-white p-6 shadow-sm">
                <ScoreRing score={score} total={total} completed={completed} />
              </div>

              {/* Stat grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total",     value: total,    cfg: STATUS_CFG.UPCOMING  },
                  { label: "Overdue",   value: overdue,  cfg: STATUS_CFG.OVERDUE   },
                  { label: "Due Soon",  value: due,      cfg: STATUS_CFG.DUE       },
                  { label: "Completed", value: completed, cfg: STATUS_CFG.COMPLETED },
                ].map(({ label, value, cfg }) => {
                  const Icon = cfg.icon;
                  return (
                    <div key={label} className={`flex items-center gap-3 rounded-xl border ${cfg.border} ${cfg.bg} p-4 shadow-sm`}>
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm`}>
                        <Icon size={18} className={cfg.color} />
                      </div>
                      <div>
                        <p className={`text-2xl font-bold ${cfg.color}`}>{value}</p>
                        <p className="text-xs font-semibold text-[#7a7582]">{label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Alert bar for overdue */}
            {overdue > 0 && (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-3">
                <Flame size={18} className="shrink-0 text-red-500" />
                <p className="text-sm font-semibold text-red-700">
                  {overdue} obligation{overdue > 1 ? "s are" : " is"} overdue — immediate action required.
                </p>
              </div>
            )}

            {/* Toolbar */}
            <div className="mb-5 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[160px]">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7582]" />
                <input
                  className="w-full rounded-lg border border-[#cbc4d2] bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#4f378a] focus:ring-2 focus:ring-[#cfbcff]"
                  placeholder="Search requirements…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {FILTER_TABS.map((tab) => (
                  <button key={tab} type="button"
                    onClick={() => setFilter(tab)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                      filter === tab ? "bg-[#4f378a] text-white" : "border border-[#cbc4d2] bg-white text-[#494551] hover:bg-[#f8f2fa]"
                    }`}>
                    {tab === "ALL" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      filter === tab ? "bg-white/20 text-white" : "bg-[#e6e0e9] text-[#494551]"
                    }`}>
                      {tabCount(tab)}
                    </span>
                  </button>
                ))}
              </div>

              <button type="button" onClick={() => load()}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#cbc4d2] bg-white hover:bg-[#f8f2fa]">
                <RefreshCw size={15} className="text-[#4f378a]" />
              </button>
            </div>

            {/* No results for filter */}
            {visible.length === 0 && (
              <div className="rounded-xl border border-[#cbc4d2] bg-white p-10 text-center">
                <Circle className="mx-auto mb-3 h-8 w-8 text-[#7a7582]" />
                <p className="text-sm font-semibold text-[#1d1b20]">No items match your filter</p>
                <button type="button" onClick={() => { setSearch(""); setFilter("ALL"); }}
                  className="mt-3 text-sm font-semibold text-[#4f378a] hover:underline">Clear filters</button>
              </div>
            )}

            {/* Items list */}
            <div className="space-y-3">
              {visible.map((item) => (
                <ComplianceCard
                  key={item._id}
                  item={{ ...item, status: effectiveStatus(item) }}
                  onComplete={handleComplete}
                  completing={completing}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
