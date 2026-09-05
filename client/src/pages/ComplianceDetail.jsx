import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Factory,
  LayoutDashboard,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  CalendarClock,
  Repeat,
  ShieldCheck,
  Scale,
  ExternalLink,
  Upload,
  Eye,
  Flame,
  FileText,
  X,
  Info,
  RotateCcw,
} from "lucide-react";
import api from "../api/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Shared helpers ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  UPCOMING:  { label: "Upcoming",  icon: Clock3,        color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200"  },
  DUE:       { label: "Due",       icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  OVERDUE:   { label: "Overdue",   icon: Flame,         color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200"   },
  COMPLETED: { label: "Completed", icon: CheckCircle2,  color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200" },
};

const RECURRENCE_LABEL = {
  ONE_TIME:  "One-time",
  MONTHLY:   "Monthly",
  QUARTERLY: "Quarterly",
  ANNUAL:    "Annual",
  RENEWAL:   "Renewal",
};

// Valid transitions the industry user can trigger
const ALLOWED_TRANSITIONS = {
  UPCOMING:  ["COMPLETED"],
  DUE:       ["COMPLETED"],
  OVERDUE:   ["COMPLETED"],
  COMPLETED: [],
};

function StatusBadge({ status }) {
  const cfg  = STATUS_CFG[status] || STATUS_CFG.UPCOMING;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${cfg.bg} ${cfg.color}`}>
      <Icon size={14} /> {cfg.label}
    </span>
  );
}

function daysUntil(date) {
  return Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
}

function effectiveStatus(item) {
  if (item.status === "COMPLETED") return "COMPLETED";
  const d = daysUntil(item.dueDate);
  if (d < 0) return "OVERDUE";
  if (d <= 7) return "DUE";
  return "UPCOMING";
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ComplianceDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [item,      setItem]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [marking,   setMarking]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notes,     setNotes]     = useState("");
  const [actionErr, setActionErr] = useState("");
  const fileRef = useRef(null);

  const load = async () => {
    try {
      const res = await api.get(`/compliance/${id}`);
      if (res.data?.success) {
        setItem(res.data.data);
        setNotes(res.data.data.notes || "");
      } else {
        setError("Failed to load item.");
      }
    } catch (e) {
      setError(e.response?.data?.error?.message || "Failed to load compliance item.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  // ── Mark completed ────────────────────────────────────────────────────────
  const handleMarkCompleted = async () => {
    setMarking(true);
    setActionErr("");
    try {
      const res = await api.put(`/compliance/${id}`, {
        status: "COMPLETED",
        notes,
      });
      if (res.data?.success) {
        setItem(res.data.data);
        setNotes(res.data.data.notes || "");
      }
    } catch (e) {
      setActionErr(e.response?.data?.error?.message || e.response?.data?.error || "Failed to update.");
    } finally {
      setMarking(false);
    }
  };

  // ── Upload proof ──────────────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setActionErr("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await api.post(`/compliance/${id}/proof`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success) setItem(res.data.data);
    } catch (e) {
      setActionErr(e.response?.data?.error?.message || "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#fdf7ff] flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-[#4f378a]" />
    </div>
  );

  if (error || !item) return (
    <div className="min-h-screen bg-[#fdf7ff] flex items-center justify-center">
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center max-w-sm">
        <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-red-500" />
        <p className="text-sm font-semibold text-red-600">{error || "Item not found."}</p>
        <button type="button" onClick={() => navigate(-1)}
          className="mt-4 rounded-lg bg-[#4f378a] px-5 py-2 text-sm font-semibold text-white hover:bg-[#6750a4]">
          Go Back
        </button>
      </div>
    </div>
  );

  const eff     = effectiveStatus(item);
  const cfg     = STATUS_CFG[eff];
  const Icon    = cfg.icon;
  const days    = daysUntil(item.dueDate);
  const canDone = ALLOWED_TRANSITIONS[eff]?.includes("COMPLETED");

  return (
    <div className="min-h-screen bg-[#fdf7ff]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#cbc4d2] bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <img src="/udyog-sanchar-icon.png" alt="UdyogSanchar" className="h-10 w-auto" />
          <span className="text-lg font-bold text-[#1d1b20]">UdyogSanchar</span>
        </div>
        <button type="button" onClick={() => navigate("/compliance")}
          className="flex items-center gap-2 rounded-lg border border-[#cbc4d2] px-4 py-2 text-sm font-semibold text-[#4f378a] hover:bg-[#f8f2fa]">
          <LayoutDashboard size={15} /> Compliance Tracker
        </button>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 space-y-5">
        {/* Back */}
        <button type="button" onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#4f378a] hover:underline">
          <ArrowLeft size={15} /> Back
        </button>

        {/* ── Header card ──────────────────────────────────────────────── */}
        <div className={`rounded-xl border ${cfg.border} ${cfg.bg} p-6 shadow-sm`}>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
              <Icon size={24} className={cfg.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <StatusBadge status={eff} />
                {eff !== "COMPLETED" && (
                  <span className={`text-sm font-bold ${days < 0 ? "text-red-600" : days <= 7 ? "text-orange-600" : "text-[#494551]"}`}>
                    {days < 0 ? `${Math.abs(days)} days overdue` : days === 0 ? "Due today" : `${days} days remaining`}
                  </span>
                )}
              </div>
              <h1 className="text-lg font-bold text-[#1d1b20] leading-tight">{item.requirementText}</h1>
            </div>
          </div>
        </div>

        {/* ── Details card ─────────────────────────────────────────────── */}
        <div className="rounded-xl border border-[#cbc4d2] bg-white p-6 shadow-sm space-y-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#7a7582]">Requirement Details</p>

          <div className="grid grid-cols-2 gap-4">
            {/* Due date */}
            <div className="rounded-xl border border-[#e6e0e9] bg-[#fdf7ff] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7a7582] mb-1 flex items-center gap-1">
                <CalendarClock size={10} /> Due Date
              </p>
              <p className="text-sm font-bold text-[#1d1b20]">
                {new Date(item.dueDate).toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" })}
              </p>
            </div>

            {/* Recurrence */}
            <div className="rounded-xl border border-[#e6e0e9] bg-[#fdf7ff] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7a7582] mb-1 flex items-center gap-1">
                <Repeat size={10} /> Recurrence
              </p>
              <p className="text-sm font-bold text-[#1d1b20]">{RECURRENCE_LABEL[item.recurrence] || item.recurrence}</p>
            </div>

            {/* Completed at */}
            {item.completedAt && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-green-600 mb-1 flex items-center gap-1">
                  <CheckCircle2 size={10} /> Completed
                </p>
                <p className="text-sm font-bold text-green-700">
                  {new Date(item.completedAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
                </p>
              </div>
            )}
          </div>

          {/* Related Approval */}
          {item.approvalId && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7a7582]">
                <ShieldCheck size={12} /> Related Approval
              </p>
              <div className="flex items-start justify-between gap-3 rounded-xl border border-[#e6e0e9] bg-[#fdf7ff] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[#1d1b20]">{item.approvalId.approvalName}</p>
                  <p className="text-xs text-[#4f378a] font-medium mt-0.5">{item.approvalId.authority}</p>
                </div>
                {item.approvalId.officialUrl && (
                  <a href={item.approvalId.officialUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-[#4f378a] hover:underline shrink-0">
                    <ExternalLink size={12} /> Portal
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Source / Legal ref */}
          {item.source && (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7a7582]">
                <Scale size={12} /> Source / Legal Reference
              </p>
              <p className="rounded-xl border border-[#e6e0e9] bg-[#f8f2fa] px-4 py-3 text-sm text-[#494551]">{item.source}</p>
            </div>
          )}

          {/* Recurring note */}
          {item.recurrence !== "ONE_TIME" && eff === "COMPLETED" && (
            <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <RotateCcw size={15} className="shrink-0 mt-0.5" />
              <span>The next recurring obligation has been automatically created for {RECURRENCE_LABEL[item.recurrence].toLowerCase()} renewal.</span>
            </div>
          )}
        </div>

        {/* ── Proof Upload card ─────────────────────────────────────────── */}
        <div className="rounded-xl border border-[#cbc4d2] bg-white p-6 shadow-sm space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#7a7582]">Proof of Compliance</p>

          {item.proofUrl ? (
            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
              <CheckCircle2 size={18} className="shrink-0 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-700">Proof document uploaded</p>
                <p className="text-xs text-green-600">Click View to open the file</p>
              </div>
              <div className="flex gap-2">
                <a href={`${API_BASE}${item.proofUrl}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-white px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50">
                  <Eye size={13} /> View
                </a>
                <button type="button" disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg border border-[#cbc4d2] bg-white px-3 py-1.5 text-xs font-semibold text-[#494551] hover:bg-[#f8f2fa] disabled:opacity-50">
                  {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                  Replace
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-[#cbc4d2] px-6 py-8 text-center hover:border-[#4f378a] hover:bg-[#f8f2fa] transition-colors"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0ebff]">
                {uploading ? <Loader2 size={22} className="animate-spin text-[#4f378a]" /> : <Upload size={22} className="text-[#4f378a]" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1d1b20]">{uploading ? "Uploading…" : "Upload proof document"}</p>
                <p className="text-xs text-[#7a7582]">PDF, JPG, PNG · max 5 MB</p>
              </div>
            </div>
          )}

          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} />
        </div>

        {/* ── Notes + Complete card ─────────────────────────────────────── */}
        <div className="rounded-xl border border-[#cbc4d2] bg-white p-6 shadow-sm space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#7a7582]">Notes & Actions</p>

          {/* Notes textarea */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-[#494551]">
              Completion notes (optional)
            </label>
            <textarea
              className="w-full rounded-xl border border-[#cbc4d2] bg-[#fdf7ff] px-4 py-3 text-sm outline-none focus:border-[#4f378a] focus:ring-2 focus:ring-[#cfbcff] resize-none"
              rows={3}
              placeholder="Add any notes about how this obligation was fulfilled…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={eff === "COMPLETED"}
            />
          </div>

          {/* Error */}
          {actionErr && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{actionErr}</div>
          )}

          {/* Actions */}
          {canDone ? (
            <button type="button" onClick={handleMarkCompleted} disabled={marking}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4f378a] px-4 py-3 text-sm font-bold text-white hover:bg-[#6750a4] disabled:opacity-50 transition-colors">
              {marking
                ? <><Loader2 size={16} className="animate-spin" /> Marking…</>
                : <><CheckCircle2 size={16} /> Mark as Completed</>}
            </button>
          ) : eff === "COMPLETED" ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              <CheckCircle2 size={16} /> Obligation fulfilled
              {item.recurrence !== "ONE_TIME" && <span className="text-xs font-normal ml-1">— next cycle created automatically</span>}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
