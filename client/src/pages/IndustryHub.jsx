import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Factory,
  LayoutDashboard,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  CalendarClock,
  RefreshCw,
  ExternalLink,
  RotateCcw,
  ShieldAlert,
  Landmark,
  Search,
  Info,
  BadgeCheck,
  TrendingUp,
  Hourglass,
  AlertCircle,
  ChevronRight,
  Flame,
  ClipboardList,
  Star,
} from "lucide-react";
import api from "../api/api";

// ── Shared helpers ─────────────────────────────────────────────────────────────
function daysUntil(date) {
  return Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
}

function fmtDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ═══════════════════════════════════════════════════════════════
//  TAB 1 — RENEWALS
// ═══════════════════════════════════════════════════════════════

const RENEWAL_RECURRENCES = ["RENEWAL", "ANNUAL", "QUARTERLY", "MONTHLY"];

function renewalUrgency(dueDate) {
  const d = daysUntil(dueDate);
  if (d < 0)   return { label: "Overdue",      cls: "bg-red-100 text-red-700",      dot: "bg-red-500",    bar: "bg-red-500"    };
  if (d <= 14) return { label: "Due very soon", cls: "bg-orange-100 text-orange-700",dot: "bg-orange-500", bar: "bg-orange-500" };
  if (d <= 30) return { label: "Due soon",      cls: "bg-yellow-100 text-yellow-700",dot: "bg-yellow-500", bar: "bg-yellow-400" };
  if (d <= 90) return { label: "Upcoming",      cls: "bg-blue-100 text-blue-700",    dot: "bg-blue-400",   bar: "bg-blue-400"   };
  return        { label: "On track",            cls: "bg-green-100 text-green-700",  dot: "bg-green-500",  bar: "bg-green-500"  };
}

function RenewalCard({ item }) {
  const navigate = useNavigate();
  const days     = daysUntil(item.dueDate);
  const urg      = renewalUrgency(item.dueDate);
  const pct      = Math.max(0, Math.min(100, 100 - (days / 365) * 100));

  return (
    <div
      className="cursor-pointer rounded-xl border border-[#cbc4d2] bg-white shadow-sm hover:border-[#4f378a] hover:shadow-md transition-all"
      onClick={() => navigate(`/compliance/${item._id}`)}
    >
      {/* Urgency stripe */}
      <div className={`h-1 w-full rounded-t-xl ${urg.bar}`} />

      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0ebff]">
            <RotateCcw size={18} className="text-[#4f378a]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1d1b20] leading-tight">{item.requirementText}</p>
            <p className="mt-0.5 text-xs text-[#4f378a] font-medium">
              {item.approvalId?.approvalName || "—"}
            </p>
          </div>
          <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${urg.cls}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${urg.dot}`} />
            {urg.label}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-[#7a7582] mb-1">
            <span>Time elapsed</span>
            <span className={`font-bold ${days < 0 ? "text-red-600" : days <= 30 ? "text-orange-600" : "text-[#494551]"}`}>
              {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d remaining`}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#e6e0e9]">
            <div className={`h-full rounded-full transition-all ${urg.bar}`} style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#7a7582]">
          <span className="flex items-center gap-1">
            <CalendarClock size={11} /> Due: {fmtDate(item.dueDate)}
          </span>
          <span className="flex items-center gap-1">
            <RotateCcw size={11} /> {item.recurrence}
          </span>
          <ChevronRight size={14} className="text-[#4f378a]" />
        </div>
      </div>
    </div>
  );
}

function RenewalsTab({ compliance, loading }) {
  const [search, setSearch] = useState("");

  const renewals = compliance
    .filter((c) => {
      const isRenewal = RENEWAL_RECURRENCES.includes(c.recurrence) && c.status !== "COMPLETED";
      const matchSearch = !search ||
        c.requirementText.toLowerCase().includes(search.toLowerCase()) ||
        (c.approvalId?.approvalName || "").toLowerCase().includes(search.toLowerCase());
      return isRenewal && matchSearch;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const overdue  = renewals.filter((r) => daysUntil(r.dueDate) < 0).length;
  const dueSoon  = renewals.filter((r) => { const d = daysUntil(r.dueDate); return d >= 0 && d <= 30; }).length;

  if (loading) return <Spinner />;

  return (
    <div>
      {/* Alert */}
      {overdue > 0 && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-3">
          <Flame size={17} className="shrink-0 text-red-500" />
          <p className="text-sm font-semibold text-red-700">
            {overdue} renewal{overdue > 1 ? "s are" : " is"} overdue — immediate renewal required.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: "Total Renewals", value: renewals.length, cls: "border-[#cbc4d2] bg-white text-[#1d1b20]" },
          { label: "Overdue",        value: overdue,         cls: "border-red-200 bg-red-50 text-red-700"    },
          { label: "Due in 30 days", value: dueSoon,         cls: "border-orange-200 bg-orange-50 text-orange-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 text-center shadow-sm ${s.cls}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs mt-0.5 font-semibold opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7582]" />
        <input
          className="w-full rounded-lg border border-[#cbc4d2] bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#4f378a] focus:ring-2 focus:ring-[#cfbcff]"
          placeholder="Search renewals…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {renewals.length === 0 ? (
        <EmptyState
          icon={RotateCcw}
          title="No upcoming renewals"
          desc="All recurring obligations are either completed or not yet generated."
        />
      ) : (
        <div className="space-y-3">
          {renewals.map((r) => <RenewalCard key={r._id} item={r} />)}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB 2 — INSPECTION / SLA
// ═══════════════════════════════════════════════════════════════

const APP_STATUS_CFG = {
  NOT_STARTED:        { label: "Not Started",   dot: "bg-[#7a7582]",  cls: "bg-[#e6e0e9] text-[#494551]"    },
  DOCUMENTS_PREPARED: { label: "Docs Prepared",  dot: "bg-blue-400",   cls: "bg-blue-100 text-blue-700"      },
  SUBMITTED:          { label: "Submitted",      dot: "bg-purple-400", cls: "bg-purple-100 text-purple-700"  },
  UNDER_REVIEW:       { label: "Under Review",   dot: "bg-yellow-400", cls: "bg-yellow-100 text-yellow-700"  },
  INSPECTION:         { label: "Inspection",     dot: "bg-orange-400", cls: "bg-orange-100 text-orange-700"  },
  APPROVED:           { label: "Approved",       dot: "bg-green-500",  cls: "bg-green-100 text-green-700"    },
  REJECTED:           { label: "Rejected",       dot: "bg-red-500",    cls: "bg-red-100 text-red-700"        },
};

function SLABadge({ sla }) {
  if (!sla) return <span className="text-xs text-[#7a7582]">—</span>;
  const cfg = {
    NORMAL:      { cls: "bg-green-100 text-green-700",   icon: CheckCircle2, label: `${sla.daysLeft}d left`               },
    APPROACHING: { cls: "bg-orange-100 text-orange-700", icon: AlertCircle,  label: `${sla.daysLeft}d left — approaching` },
    BREACHED:    { cls: "bg-red-100 text-red-700",       icon: Flame,        label: `${Math.abs(sla.daysLeft)}d overdue`  },
  }[sla.status] || null;
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${cfg.cls}`}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
}

function SLATable({ applications, inspections, loading }) {
  const [search, setSearch] = useState("");

  if (loading) return <Spinner />;

  // Active applications (those with an SLA running = SUBMITTED/UNDER_REVIEW/INSPECTION)
  const active = applications.filter((a) =>
    ["SUBMITTED","UNDER_REVIEW","INSPECTION","DOCUMENTS_PREPARED"].includes(a.status)
  );

  const filtered = active.filter((a) =>
    !search || (a.approvalId?.approvalName || "").toLowerCase().includes(search.toLowerCase())
  );

  const breached   = active.filter((a) => a.sla?.status === "BREACHED").length;
  const approaching = active.filter((a) => a.sla?.status === "APPROACHING").length;
  const inspection  = active.filter((a) => a.status === "INSPECTION").length;

  return (
    <div>
      {/* Alert */}
      {breached > 0 && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-3">
          <Flame size={17} className="shrink-0 text-red-500" />
          <p className="text-sm font-semibold text-red-700">
            {breached} application SLA{breached > 1 ? "s have" : " has"} been breached — follow up with the authority.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Active",      value: active.length,  cls: "border-[#cbc4d2] bg-white text-[#1d1b20]"       },
          { label: "SLA Breached",value: breached,        cls: "border-red-200 bg-red-50 text-red-700"          },
          { label: "Approaching", value: approaching,     cls: "border-orange-200 bg-orange-50 text-orange-700" },
          { label: "Inspections", value: inspection,      cls: "border-purple-200 bg-purple-50 text-purple-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 text-center shadow-sm ${s.cls}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs mt-0.5 font-semibold opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7582]" />
        <input
          className="w-full rounded-lg border border-[#cbc4d2] bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#4f378a] focus:ring-2 focus:ring-[#cfbcff]"
          placeholder="Search by approval name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Applications SLA table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Hourglass}
          title="No active applications"
          desc="Applications under review or awaiting inspection will appear here."
        />
      ) : (
        <div className="rounded-xl border border-[#cbc4d2] bg-white shadow-sm overflow-hidden mb-8">
          <div className="border-b border-[#e6e0e9] bg-[#f8f2fa] px-5 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#7a7582]">Application SLA Tracker</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e6e0e9] text-left">
                  {["Approval","Authority","Status","Submitted","Expected By","SLA"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#7a7582]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((app, i) => {
                  const sc  = APP_STATUS_CFG[app.status] || APP_STATUS_CFG.NOT_STARTED;
                  const odd = i % 2 === 1;
                  return (
                    <tr key={app._id} className={`border-b border-[#e6e0e9] last:border-0 ${odd ? "bg-[#fdf7ff]" : ""}`}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#1d1b20]">{app.approvalId?.approvalName || "—"}</p>
                        {app.status === "INSPECTION" && (
                          <span className="inline-flex items-center gap-1 mt-1 rounded bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                            🔍 Inspection Scheduled
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#494551] max-w-[140px] truncate">
                        {app.approvalId?.authority || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${sc.cls}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#7a7582]">{fmtDate(app.submissionDate)}</td>
                      <td className="px-4 py-3 text-xs text-[#7a7582]">{fmtDate(app.expectedCompletionDate)}</td>
                      <td className="px-4 py-3"><SLABadge sla={app.sla} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspections table */}
      {inspections.length > 0 && (
        <div className="rounded-xl border border-[#cbc4d2] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#e6e0e9] bg-[#f8f2fa] px-5 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#7a7582]">Scheduled Inspections</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e6e0e9] text-left">
                  {["Application","Department","Scheduled Date","Status","Remarks"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#7a7582]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inspections.map((ins, i) => {
                  const d = daysUntil(ins.scheduledDate);
                  return (
                    <tr key={ins._id} className={`border-b border-[#e6e0e9] last:border-0 ${i % 2 === 1 ? "bg-[#fdf7ff]" : ""}`}>
                      <td className="px-4 py-3 font-semibold text-[#1d1b20]">
                        {ins.applicationId?.approvalId?.approvalName || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#494551]">{ins.department}</td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-[#1d1b20]">{fmtDate(ins.scheduledDate)}</p>
                        {ins.status === "SCHEDULED" && (
                          <p className={`text-[10px] font-bold mt-0.5 ${d < 0 ? "text-red-600" : d <= 7 ? "text-orange-600" : "text-[#7a7582]"}`}>
                            {d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? "Today" : `${d}d away`}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          ins.status === "COMPLETED" ? "bg-green-100 text-green-700"
                          : ins.status === "CANCELLED" ? "bg-red-100 text-red-700"
                          : "bg-orange-100 text-orange-700"
                        }`}>
                          {ins.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#7a7582]">{ins.remarks || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB 3 — GOVERNMENT SCHEMES
// ═══════════════════════════════════════════════════════════════

function SchemeCard({ scheme }) {
  return (
    <div className="rounded-xl border border-[#cbc4d2] bg-white shadow-sm hover:border-[#4f378a] hover:shadow-md transition-all flex flex-col">
      {/* Header */}
      <div className="border-b border-[#e6e0e9] bg-[#f8f2fa] p-5 rounded-t-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0ebff]">
            <Landmark size={18} className="text-[#4f378a]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-[#1d1b20] leading-tight">{scheme.schemeName}</h3>
            {/* Eligibility badge */}
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#f0ebff] px-2.5 py-1 text-[10px] font-bold text-[#4f378a]">
              <BadgeCheck size={10} /> Potentially Eligible
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-5 space-y-4">
        {/* Description */}
        <p className="text-sm text-[#494551] leading-relaxed">{scheme.description}</p>

        {/* Benefits */}
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7a7582]">
            <TrendingUp size={11} /> Benefits
          </p>
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {scheme.benefits}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 rounded-xl border border-[#e6e0e9] bg-[#fdf7ff] px-4 py-3">
          <Info size={14} className="shrink-0 mt-0.5 text-[#7a7582]" />
          <p className="text-xs text-[#7a7582] italic">{scheme.disclaimer}</p>
        </div>
      </div>

      {/* Footer */}
      {scheme.officialUrl && (
        <div className="border-t border-[#e6e0e9] p-4 rounded-b-xl">
          <a
            href={scheme.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#cbc4d2] px-4 py-2.5 text-sm font-semibold text-[#4f378a] hover:bg-[#f8f2fa] transition-colors"
          >
            <ExternalLink size={14} /> Apply / Learn More
          </a>
        </div>
      )}
    </div>
  );
}

function SchemesTab({ industryId, loading: parentLoading }) {
  const [schemes,  setSchemes]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    if (!industryId) { setLoading(false); return; }
    const load = async () => {
      try {
        const res = await api.get(`/schemes/matched/${industryId}`);
        if (res.data?.success) setSchemes(res.data.data || []);
      } catch {
        setError("Failed to load matched schemes.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [industryId]);

  const visible = schemes.filter((s) =>
    !search || s.schemeName.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase())
  );

  if (parentLoading || loading) return <Spinner />;

  if (!industryId) return (
    <EmptyState icon={Landmark} title="Complete your profile first"
      desc="Run the project analysis to see matched government schemes." />
  );

  return (
    <div>
      {/* Info banner */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#cfbcff] bg-[#f0ebff] px-5 py-4">
        <Star size={17} className="shrink-0 text-[#4f378a] mt-0.5" />
        <div>
          <p className="text-sm font-bold text-[#4f378a]">{schemes.length} scheme{schemes.length !== 1 ? "s" : ""} matched to your profile</p>
          <p className="mt-0.5 text-xs text-[#494551]">
            Eligibility is determined by your industry profile data. Confirm with the respective authority before applying.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7582]" />
        <input
          className="w-full rounded-lg border border-[#cbc4d2] bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#4f378a] focus:ring-2 focus:ring-[#cfbcff]"
          placeholder="Search schemes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}

      {visible.length === 0 ? (
        <EmptyState icon={Landmark} title="No schemes matched"
          desc="No government incentive schemes matched your current industry profile. Update your profile to see more results." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visible.map((s) => <SchemeCard key={s.id} scheme={s} />)}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════════════════

function Spinner() {
  return (
    <div className="flex flex-col items-center py-16 gap-4">
      <Loader2 className="h-9 w-9 animate-spin text-[#4f378a]" />
      <p className="text-sm text-[#494551]">Loading…</p>
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-xl border border-[#cbc4d2] bg-white p-12 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0ebff]">
        <Icon className="h-7 w-7 text-[#4f378a]" />
      </div>
      <h2 className="mb-2 text-base font-semibold text-[#1d1b20]">{title}</h2>
      <p className="text-sm text-[#494551] max-w-sm mx-auto">{desc}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════

const TABS = [
  { key: "renewals",    label: "Renewals",       icon: RotateCcw    },
  { key: "sla",         label: "Inspection / SLA",icon: Hourglass    },
  { key: "schemes",     label: "Gov. Schemes",    icon: Landmark     },
];

export default function IndustryHub() {
  const navigate          = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab         = searchParams.get("tab") || "renewals";

  const [compliance,   setCompliance]   = useState([]);
  const [applications, setApplications] = useState([]);
  const [inspections,  setInspections]  = useState([]);
  const [industryId,   setIndustryId]   = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true); else setRefreshing(true);
    try {
      const [indRes, compRes, appRes, insRes] = await Promise.allSettled([
        api.get("/industries/me"),
        api.get("/compliance"),
        api.get("/applications"),
        api.get("/inspections"),
      ]);

      if (indRes.status === "fulfilled" && indRes.value.data?.data?._id) {
        setIndustryId(indRes.value.data.data._id);
      }
      if (compRes.status === "fulfilled" && compRes.value.data?.success) {
        setCompliance(compRes.value.data.data || []);
      }
      if (appRes.status === "fulfilled" && appRes.value.data?.success) {
        setApplications(appRes.value.data.data || []);
      }
      if (insRes.status === "fulfilled" && insRes.value.data?.success) {
        setInspections(insRes.value.data.data || []);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setTab = (key) => setSearchParams({ tab: key });

  // Badge counts for tabs
  const renewalCount  = compliance.filter((c) => RENEWAL_RECURRENCES.includes(c.recurrence) && c.status !== "COMPLETED" && daysUntil(c.dueDate) <= 30).length;
  const slaBreached   = applications.filter((a) => a.sla?.status === "BREACHED").length;
  const schemesCount  = 0; // loaded lazily inside SchemesTab

  const tabBadge = { renewals: renewalCount, sla: slaBreached, schemes: 0 };

  return (
    <div className="min-h-screen bg-[#fdf7ff]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#cbc4d2] bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <img src="/udyog-sanchar-icon.png" alt="UdyogSanchar" className="h-10 w-auto" />
          <span className="text-lg font-bold text-[#1d1b20]">UdyogSanchar</span>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => load(true)} disabled={refreshing}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#cbc4d2] bg-white hover:bg-[#f8f2fa] disabled:opacity-50">
            <RefreshCw size={15} className={`text-[#4f378a] ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button type="button" onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 rounded-lg border border-[#cbc4d2] px-4 py-2 text-sm font-semibold text-[#4f378a] hover:bg-[#f8f2fa]">
            <LayoutDashboard size={15} /> Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* Page title */}
        <div className="mb-8">
          <button type="button" onClick={() => navigate(-1)}
            className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[#4f378a] hover:underline">
            <ArrowLeft size={15} /> Back
          </button>
          <h1 className="text-2xl font-bold text-[#1d1b20]">Industry Hub</h1>
          <p className="text-sm text-[#494551]">Renewals, SLA tracking, and government incentive schemes</p>
        </div>

        {/* Tab bar */}
        <div className="mb-8 flex gap-1 rounded-xl border border-[#cbc4d2] bg-white p-1 shadow-sm w-fit">
          {TABS.map(({ key, label, icon: Icon }) => {
            const badge = tabBadge[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                  activeTab === key
                    ? "bg-[#4f378a] text-white shadow-sm"
                    : "text-[#494551] hover:bg-[#f8f2fa]"
                }`}
              >
                <Icon size={15} />
                {label}
                {badge > 0 && (
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    activeTab === key ? "bg-white/20 text-white" : "bg-red-100 text-red-600"
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === "renewals" && (
          <RenewalsTab compliance={compliance} loading={loading} />
        )}
        {activeTab === "sla" && (
          <SLATable applications={applications} inspections={inspections} loading={loading} />
        )}
        {activeTab === "schemes" && (
          <SchemesTab industryId={industryId} loading={loading} />
        )}
      </main>
    </div>
  );
}
