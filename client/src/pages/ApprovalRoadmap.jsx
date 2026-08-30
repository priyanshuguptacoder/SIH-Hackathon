import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Factory,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  FileText,
  ExternalLink,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  ClipboardList,
  LayoutDashboard,
  Leaf,
  HardHat,
  Flame,
  Building2,
  ChevronRight,
  Link2,
  Lock,
  X,
  CalendarClock,
  Scale,
  Info,
  CircleDot,
  ArrowRight,
} from "lucide-react";
import api from "../api/api";

// ── Category config ────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  "Environmental":   { icon: Leaf,      color: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-200", pill: "bg-emerald-100 text-emerald-700"  },
  "Labour & Safety": { icon: HardHat,   color: "text-blue-600",    bg: "bg-blue-50",     border: "border-blue-200",    pill: "bg-blue-100 text-blue-700"        },
  "Fire & Emergency":{ icon: Flame,     color: "text-orange-600",  bg: "bg-orange-50",   border: "border-orange-200",  pill: "bg-orange-100 text-orange-700"    },
  "Pre-establishment":{ icon: Building2, color: "text-purple-600",  bg: "bg-purple-50",   border: "border-purple-200",  pill: "bg-purple-100 text-purple-700"   },
  "General":         { icon: ShieldCheck,color: "text-[#4f378a]",  bg: "bg-[#f0ebff]",   border: "border-[#cfbcff]",   pill: "bg-[#f0ebff] text-[#4f378a]"     },
};

// ── Application status config ──────────────────────────────────────────────
const STATUS_CONFIG = {
  NOT_STARTED:        { label: "Not Started",       color: "bg-[#e6e0e9] text-[#494551]",  dot: "bg-[#7a7582]"  },
  DOCUMENTS_PREPARED: { label: "Docs Prepared",      color: "bg-blue-100 text-blue-700",    dot: "bg-blue-500"   },
  SUBMITTED:          { label: "Submitted",           color: "bg-purple-100 text-purple-700",dot: "bg-purple-500" },
  UNDER_REVIEW:       { label: "Under Review",        color: "bg-yellow-100 text-yellow-700",dot: "bg-yellow-500" },
  INSPECTION:         { label: "Inspection",          color: "bg-orange-100 text-orange-700",dot: "bg-orange-500" },
  APPROVED:           { label: "Approved",            color: "bg-green-100 text-green-700",  dot: "bg-green-500"  },
  REJECTED:           { label: "Rejected",            color: "bg-red-100 text-red-700",      dot: "bg-red-500"    },
};

function StatusBadge({ status, size = "sm" }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.NOT_STARTED;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-${size === "xs" ? "[10px]" : "xs"} font-semibold ${cfg.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── Detail Side Panel ──────────────────────────────────────────────────────
function DetailPanel({ item, onClose, onApply, applying }) {
  if (!item) return null;
  const { approval, rule, applicationStatus, applicationId, blockedBy } = item;
  const catCfg     = CATEGORY_CONFIG[approval.category] || CATEGORY_CONFIG["General"];
  const CatIcon    = catCfg.icon;
  const isApproved = applicationStatus === "APPROVED";
  const isApplied  = applicationStatus !== "NOT_STARTED";
  const isBlocked  = blockedBy?.length > 0 && !isApplied;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Panel header */}
        <div className={`flex items-start gap-4 border-b border-[#e6e0e9] p-6 ${catCfg.bg}`}>
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${catCfg.bg} border ${catCfg.border}`}>
            <CatIcon size={22} className={catCfg.color} />
          </div>
          <div className="flex-1 min-w-0">
            <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${catCfg.pill}`}>
              {approval.category}
            </span>
            <h2 className="text-lg font-bold text-[#1d1b20] leading-tight">{approval.name}</h2>
            <p className={`mt-0.5 text-xs font-medium ${catCfg.color}`}>{approval.authority}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-[#e6e0e9] transition-colors"
          >
            <X size={18} className="text-[#494551]" />
          </button>
        </div>

        {/* Panel body — scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status + SLA */}
          <div className="flex items-center justify-between rounded-xl border border-[#e6e0e9] bg-[#fdf7ff] px-4 py-3">
            <div>
              <p className="text-xs text-[#7a7582] font-semibold uppercase tracking-wider mb-1">Status</p>
              <StatusBadge status={applicationStatus} />
            </div>
            {approval.slaDays && (
              <div className="text-right">
                <p className="text-xs text-[#7a7582] font-semibold uppercase tracking-wider mb-1">SLA</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#1d1b20]">
                  <CalendarClock size={14} className="text-[#4f378a]" />
                  {approval.slaDays} days
                </span>
              </div>
            )}
          </div>

          {/* Why applicable */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7a7582]">
              <Info size={13} /> Why This Applies
            </p>
            <p className="rounded-lg border border-[#e6e0e9] bg-[#f8f2fa] px-4 py-3 text-sm text-[#1d1b20] leading-relaxed">
              {rule.reason}
            </p>
          </div>

          {/* Description */}
          {approval.description && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#7a7582]">Description</p>
              <p className="text-sm text-[#494551] leading-relaxed">{approval.description}</p>
            </div>
          )}

          {/* Dependencies */}
          {approval.dependencies?.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7a7582]">
                <Link2 size={13} /> Prerequisites
              </p>
              <ul className="space-y-2">
                {approval.dependencies.map((dep) => (
                  <li
                    key={dep.name}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm ${
                      dep.isObtained
                        ? "border-green-200 bg-green-50"
                        : dep.inRoadmap
                        ? "border-orange-200 bg-orange-50"
                        : "border-[#e6e0e9] bg-[#fdf7ff]"
                    }`}
                  >
                    {dep.isObtained ? (
                      <CheckCircle2 size={15} className="shrink-0 text-green-600" />
                    ) : (
                      <Lock size={15} className="shrink-0 text-orange-500" />
                    )}
                    <span className={`font-medium ${dep.isObtained ? "text-green-700" : "text-[#1d1b20]"}`}>
                      {dep.name}
                    </span>
                    <span className={`ml-auto text-[10px] font-semibold uppercase ${dep.isObtained ? "text-green-600" : "text-orange-600"}`}>
                      {dep.isObtained ? "Obtained" : "Required First"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Required Documents */}
          {approval.requiredDocuments?.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7a7582]">
                <FileText size={13} /> Required Documents
              </p>
              <ul className="space-y-2">
                {approval.requiredDocuments.map((doc, i) => (
                  <li key={i} className="flex items-center gap-2.5 rounded-lg border border-[#e6e0e9] bg-white px-3 py-2 text-sm text-[#1d1b20]">
                    <FileText size={14} className="shrink-0 text-[#4f378a]" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Legal Basis + Rule Source */}
          <div className="grid grid-cols-1 gap-4">
            {approval.legalBasis && (
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7a7582]">
                  <Scale size={13} /> Legal Basis
                </p>
                <p className="rounded-lg border border-[#e6e0e9] bg-[#fdf7ff] px-3 py-2 text-xs text-[#494551] leading-relaxed">
                  {approval.legalBasis}
                </p>
              </div>
            )}
            {rule.source && (
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-[#7a7582]">Rule Reference</p>
                <p className="rounded-lg border border-[#e6e0e9] bg-[#fdf7ff] px-3 py-2 text-xs text-[#494551]">
                  {rule.source}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Panel footer — actions */}
        <div className="border-t border-[#e6e0e9] p-5 space-y-3">
          {isBlocked && (
            <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5 text-xs text-orange-700">
              <Lock size={13} className="mt-0.5 shrink-0" />
              <span>Complete prerequisites first: <strong>{blockedBy.join(", ")}</strong></span>
            </div>
          )}

          {!isApplied && (
            <button
              type="button"
              onClick={() => onApply(approval.id, applicationId)}
              disabled={applying === approval.id || isBlocked}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4f378a] px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#6750a4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {applying === approval.id ? (
                <><Loader2 size={16} className="animate-spin" /> Starting…</>
              ) : (
                <><ClipboardList size={16} /> Start Application</>
              )}
            </button>
          )}

          {isApplied && !isApproved && (
            <div className="rounded-xl border border-[#e6e0e9] bg-[#f8f2fa] px-4 py-3 text-center text-xs text-[#494551]">
              Application in progress — track from your dashboard
            </div>
          )}

          {isApproved && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              <CheckCircle2 size={16} /> Approval Obtained
            </div>
          )}

          {approval.officialUrl && (
            <a
              href={approval.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#cbc4d2] px-4 py-2.5 text-sm font-semibold text-[#4f378a] hover:bg-[#f8f2fa] transition-colors"
            >
              <ExternalLink size={15} />
              Visit Official Portal
            </a>
          )}
        </div>
      </aside>
    </>
  );
}

// ── Category section header ────────────────────────────────────────────────
function CategoryHeader({ category, count }) {
  const cfg  = CATEGORY_CONFIG[category] || CATEGORY_CONFIG["General"];
  const Icon = cfg.icon;
  return (
    <div className={`flex items-center gap-3 rounded-xl border ${cfg.border} ${cfg.bg} px-4 py-3 mb-3`}>
      <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm`}>
        <Icon size={17} className={cfg.color} />
      </div>
      <span className="font-bold text-[#1d1b20]">{category}</span>
      <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${cfg.pill}`}>
        {count} approval{count !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

// ── Single approval row card ───────────────────────────────────────────────
function ApprovalCard({ item, index, onSelect, onApply, applying }) {
  const { approval, rule, applicationStatus, blockedBy } = item;
  const catCfg     = CATEGORY_CONFIG[approval.category] || CATEGORY_CONFIG["General"];
  const isApproved = applicationStatus === "APPROVED";
  const isApplied  = applicationStatus !== "NOT_STARTED";
  const isBlocked  = blockedBy?.length > 0 && !isApplied;

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-200 cursor-pointer
        ${isApproved
          ? "border-green-200 bg-green-50 hover:border-green-300"
          : isBlocked
          ? "border-orange-100 bg-orange-50/40 hover:border-orange-200"
          : "border-[#cbc4d2] bg-white hover:border-[#4f378a] hover:shadow-sm"
        }`}
      onClick={() => onSelect(item)}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Priority number */}
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold
          ${isApproved ? "bg-green-200 text-green-700" : `${catCfg.bg} ${catCfg.color}`}`}>
          {index + 1}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-[#1d1b20]">{approval.name}</h3>
            {isBlocked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-600 uppercase">
                <Lock size={10} /> Blocked
              </span>
            )}
          </div>
          <p className={`mt-0.5 text-xs font-medium ${catCfg.color}`}>{approval.authority}</p>

          {/* Dependencies indicator */}
          {approval.dependencies?.length > 0 && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Link2 size={10} className="text-[#7a7582] shrink-0" />
              {approval.dependencies.map((dep) => (
                <span
                  key={dep.name}
                  className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                    dep.isObtained
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {dep.isObtained ? <CheckCircle2 size={9} /> : <Lock size={9} />}
                  {dep.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusBadge status={applicationStatus} size="xs" />
          {approval.slaDays && (
            <span className="flex items-center gap-1 text-[10px] text-[#7a7582]">
              <CalendarClock size={10} />
              {approval.slaDays}d SLA
            </span>
          )}
        </div>

        <ChevronRight size={16} className="shrink-0 text-[#7a7582] group-hover:text-[#4f378a] transition-colors" />
      </div>

      {/* Quick-apply bar (shown when not applied + not blocked) */}
      {!isApplied && !isBlocked && (
        <div className="border-t border-[#e6e0e9] px-4 py-2.5">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onApply(approval.id, null); }}
            disabled={applying === approval.id}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#4f378a] hover:underline disabled:opacity-50"
          >
            {applying === approval.id ? (
              <><Loader2 size={12} className="animate-spin" /> Starting…</>
            ) : (
              <><ClipboardList size={12} /> Start Application</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Dependency flow diagram ────────────────────────────────────────────────
function DependencyFlow({ roadmap }) {
  // Find items that have dependencies within the roadmap
  const withDeps = roadmap.filter(
    (r) => r.approval.dependencies?.some((d) => d.inRoadmap)
  );
  if (withDeps.length === 0) return null;

  return (
    <div className="rounded-xl border border-[#cbc4d2] bg-white p-5 shadow-sm">
      <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7a7582]">
        <Link2 size={13} /> Approval Dependencies
      </p>
      <div className="space-y-3">
        {withDeps.map((item) => (
          <div key={item.approval.id} className="flex flex-wrap items-center gap-2 text-sm">
            {item.approval.dependencies
              .filter((d) => d.inRoadmap)
              .map((dep) => (
                <span key={dep.name} className="flex items-center gap-2 flex-wrap">
                  <span className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                    dep.isObtained ? "border-green-200 bg-green-50 text-green-700" : "border-[#cbc4d2] bg-[#fdf7ff] text-[#1d1b20]"
                  }`}>
                    {dep.isObtained ? <CheckCircle2 size={12} /> : <CircleDot size={12} className="text-[#4f378a]" />}
                    {dep.name}
                  </span>
                  <ArrowRight size={14} className="text-[#7a7582] shrink-0" />
                  <span className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                    item.applicationStatus === "APPROVED"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : dep.isObtained
                      ? "border-[#4f378a] bg-[#f0ebff] text-[#4f378a]"
                      : "border-orange-200 bg-orange-50 text-orange-700"
                  }`}>
                    {item.applicationStatus === "APPROVED"
                      ? <CheckCircle2 size={12} />
                      : dep.isObtained
                      ? <CircleDot size={12} />
                      : <Lock size={12} />}
                    {item.approval.name}
                  </span>
                </span>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ApprovalRoadmap() {
  const { industryId } = useParams();
  const navigate       = useNavigate();

  const [roadmap,  setRoadmap]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [selected, setSelected] = useState(null);   // item shown in detail panel
  const [applying, setApplying] = useState(null);   // approvalId being applied

  const loadRoadmap = async () => {
    try {
      const res = await api.get(`/approvals/roadmap/${industryId}`);
      if (res.data?.success) setRoadmap(res.data.data || []);
      else setError("Failed to load roadmap.");
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.error ||
        "Failed to load roadmap."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRoadmap(); }, [industryId]); // eslint-disable-line

  // ── Apply ────────────────────────────────────────────────────────────────
  const handleApply = async (approvalId, existingApplicationId) => {
    if (existingApplicationId) { navigate("/dashboard"); return; }

    setApplying(approvalId);
    try {
      await api.post("/applications", { industryId, approvalId });
      await loadRoadmap();
      // Refresh detail panel item
      setSelected((prev) =>
        prev?.approval.id === approvalId
          ? { ...prev, applicationStatus: "NOT_STARTED" } // will be refreshed from roadmap
          : prev
      );
    } catch (err) {
      alert(
        err.response?.data?.error?.message ||
        err.response?.data?.error ||
        "Failed to start application."
      );
    } finally {
      setApplying(null);
    }
  };

  // Keep selected panel in sync after roadmap reload
  useEffect(() => {
    if (!selected) return;
    const fresh = roadmap.find((r) => r.approval.id === selected.approval.id);
    if (fresh) setSelected(fresh);
  }, [roadmap]); // eslint-disable-line

  // ── Derived ──────────────────────────────────────────────────────────────
  const total      = roadmap.length;
  const approved   = roadmap.filter((r) => r.applicationStatus === "APPROVED").length;
  const inProg     = roadmap.filter((r) =>
    ["DOCUMENTS_PREPARED","SUBMITTED","UNDER_REVIEW","INSPECTION"].includes(r.applicationStatus)
  ).length;
  const notStarted = roadmap.filter((r) => r.applicationStatus === "NOT_STARTED").length;

  // Group by category, preserving priority order within each group
  const grouped = roadmap.reduce((acc, item) => {
    const cat = item.approval.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const categoryOrder = ["Pre-establishment", "Environmental", "Labour & Safety", "Fire & Emergency", "General"];
  const sortedCategories = Object.keys(grouped).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  return (
    <div className="min-h-screen bg-[#fdf7ff]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#cbc4d2] bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Factory className="h-7 w-7 text-[#4f378a]" />
          <span className="text-lg font-bold text-[#1d1b20]">Smart India Industrial Portal</span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 rounded-lg border border-[#cbc4d2] px-4 py-2 text-sm font-semibold text-[#4f378a] hover:bg-[#f8f2fa] transition-colors"
        >
          <LayoutDashboard size={15} />
          Dashboard
        </button>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        {/* Back + Title */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-[#4f378a] hover:underline"
          >
            <ArrowLeft size={15} /> Back
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f0ebff]">
              <ShieldCheck className="h-6 w-6 text-[#4f378a]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1d1b20]">Approval Roadmap</h1>
              <p className="text-sm text-[#494551]">
                Regulatory approvals applicable to your industrial profile — click any card for details
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#4f378a]" />
            <p className="text-sm text-[#494551]">Loading your roadmap…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-red-500" />
            <p className="text-sm font-semibold text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => navigate("/wizard")}
              className="mt-4 rounded-lg bg-[#4f378a] px-5 py-2 text-sm font-semibold text-white hover:bg-[#6750a4]"
            >
              Go to Profile Wizard
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && total === 0 && (
          <div className="rounded-xl border border-[#cbc4d2] bg-white p-10 text-center shadow-sm">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h2 className="mb-2 text-xl font-semibold text-[#1d1b20]">No Approvals Required</h2>
            <p className="text-sm text-[#494551] max-w-sm mx-auto">
              Based on your current profile, no mandatory regulatory approvals were identified.
              Update your profile if your business parameters change.
            </p>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#4f378a] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#6750a4]"
            >
              <LayoutDashboard size={15} /> Go to Dashboard
            </button>
          </div>
        )}

        {!loading && !error && total > 0 && (
          <>
            {/* Stats */}
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-[#cbc4d2] bg-white p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-[#1d1b20]">{total}</p>
                <p className="text-xs text-[#494551] mt-0.5">Total Required</p>
              </div>
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-green-700">{approved}</p>
                <p className="text-xs text-green-600 mt-0.5">Approved</p>
              </div>
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-orange-700">{notStarted}</p>
                <p className="text-xs text-orange-600 mt-0.5">Not Started</p>
              </div>
            </div>

            {/* Overall progress */}
            <div className="mb-6 rounded-xl border border-[#cbc4d2] bg-white p-4 shadow-sm">
              <div className="flex justify-between text-xs text-[#494551] mb-2">
                <span className="font-semibold">Overall Compliance Progress</span>
                <span className="font-bold text-[#4f378a]">{Math.round((approved / total) * 100)}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#e6e0e9]">
                <div
                  className="h-full rounded-full bg-[#4f378a] transition-all duration-700"
                  style={{ width: `${(approved / total) * 100}%` }}
                />
              </div>
              <div className="flex gap-4 mt-3 text-xs text-[#494551]">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#4f378a]" />{approved} approved</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-400" />{inProg} in progress</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#e6e0e9]" />{notStarted} not started</span>
              </div>
            </div>

            {/* Dependency flow */}
            <div className="mb-6">
              <DependencyFlow roadmap={roadmap} />
            </div>

            {/* Categorized lists */}
            <div className="space-y-8">
              {sortedCategories.map((cat) => (
                <div key={cat}>
                  <CategoryHeader category={cat} count={grouped[cat].length} />
                  <div className="space-y-3">
                    {grouped[cat].map((item, i) => (
                      <ApprovalCard
                        key={item.approval.id}
                        item={item}
                        index={roadmap.indexOf(item)}
                        onSelect={setSelected}
                        onApply={handleApply}
                        applying={applying}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom actions */}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 rounded-lg bg-[#4f378a] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#6750a4] transition-colors"
              >
                <LayoutDashboard size={15} /> Go to Dashboard
              </button>
              <button
                type="button"
                onClick={() => navigate("/wizard")}
                className="flex items-center gap-2 rounded-lg border border-[#4f378a] px-6 py-2.5 text-sm font-semibold text-[#4f378a] hover:bg-[#f8f2fa] transition-colors"
              >
                <Clock3 size={15} /> Update Profile
              </button>
            </div>
          </>
        )}
      </main>

      {/* Detail side panel */}
      {selected && (
        <DetailPanel
          item={selected}
          onClose={() => setSelected(null)}
          onApply={handleApply}
          applying={applying}
        />
      )}
    </div>
  );
}
