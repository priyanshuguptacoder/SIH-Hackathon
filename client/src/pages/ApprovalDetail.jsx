import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Factory,
  ShieldCheck,
  CheckCircle2,
  Circle,
  AlertTriangle,
  FileText,
  ExternalLink,
  Loader2,
  ArrowLeft,
  Upload,
  ClipboardList,
  Scale,
  Link2,
  Lock,
  CalendarClock,
  Info,
  Leaf,
  HardHat,
  Flame,
  Building2,
  CheckSquare,
  Square,
  Trash2,
  Eye,
} from "lucide-react";
import api from "../api/api";

// ── Category icon map ─────────────────────────────────────────────────────────
const CAT_ICON = {
  "Environmental":    Leaf,
  "Labour & Safety":  HardHat,
  "Fire & Emergency": Flame,
  "Pre-establishment":Building2,
  "General":          ShieldCheck,
};
const CAT_COLOR = {
  "Environmental":    "text-emerald-600 bg-emerald-50 border-emerald-200",
  "Labour & Safety":  "text-blue-600 bg-blue-50 border-blue-200",
  "Fire & Emergency": "text-orange-600 bg-orange-50 border-orange-200",
  "Pre-establishment":"text-purple-600 bg-purple-50 border-purple-200",
  "General":          "text-[#4f378a] bg-[#f0ebff] border-[#cfbcff]",
};

// ── Timeline steps ────────────────────────────────────────────────────────────
const TIMELINE = [
  { key: "NOT_STARTED",        label: "Not Started"    },
  { key: "DOCUMENTS_PREPARED", label: "Docs Prepared"  },
  { key: "SUBMITTED",          label: "Submitted"       },
  { key: "UNDER_REVIEW",       label: "Under Review"    },
  { key: "INSPECTION",         label: "Inspection"      },
  { key: "APPROVED",           label: "Approved"        },
];

const STATUS_ORDER = [
  "NOT_STARTED","DOCUMENTS_PREPARED","SUBMITTED",
  "UNDER_REVIEW","INSPECTION","APPROVED","REJECTED"
];

function timelineIndex(status) {
  if (status === "REJECTED") return -1;
  return TIMELINE.findIndex((t) => t.key === status);
}

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_CFG = {
  NOT_STARTED:        { color: "bg-[#e6e0e9] text-[#494551]",  dot: "bg-[#7a7582]"  },
  DOCUMENTS_PREPARED: { color: "bg-blue-100 text-blue-700",    dot: "bg-blue-500"   },
  SUBMITTED:          { color: "bg-purple-100 text-purple-700",dot: "bg-purple-500" },
  UNDER_REVIEW:       { color: "bg-yellow-100 text-yellow-700",dot: "bg-yellow-500" },
  INSPECTION:         { color: "bg-orange-100 text-orange-700",dot: "bg-orange-500" },
  APPROVED:           { color: "bg-green-100 text-green-700",  dot: "bg-green-500"  },
  REJECTED:           { color: "bg-red-100 text-red-700",      dot: "bg-red-500"    },
};
function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.NOT_STARTED;
  const label = status?.replace(/_/g, " ");
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cfg.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {label}
    </span>
  );
}

// ── Status Timeline ───────────────────────────────────────────────────────────
function StatusTimeline({ status, history }) {
  const isRejected = status === "REJECTED";
  const current    = timelineIndex(status);

  return (
    <div>
      <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[#7a7582]">Status Timeline</p>

      {isRejected && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          <AlertTriangle size={15} />
          Application Rejected — you may re-submit after preparing updated documents
        </div>
      )}

      <div className="relative">
        {/* Connector line */}
        <div className="absolute left-4 top-4 h-[calc(100%-32px)] w-0.5 bg-[#e6e0e9]" />

        <ol className="space-y-1">
          {TIMELINE.map((step, i) => {
            const done    = !isRejected && i < current;
            const active  = !isRejected && i === current;
            const pending = isRejected || i > current;

            // Find matching history entry
            const entry = [...(history || [])].reverse().find((h) => h.status === step.key);

            return (
              <li key={step.key} className="relative flex items-start gap-4 pb-5 last:pb-0">
                {/* Dot */}
                <span className={`z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  done   ? "border-[#4f378a] bg-[#4f378a] text-white"
                  : active ? "border-[#4f378a] bg-white text-[#4f378a]"
                  : "border-[#cbc4d2] bg-white text-[#7a7582]"
                }`}>
                  {done ? <CheckCircle2 size={16} /> : <Circle size={14} />}
                </span>

                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${active ? "text-[#4f378a]" : done ? "text-[#1d1b20]" : "text-[#7a7582]"}`}>
                      {step.label}
                    </span>
                    {active && <span className="rounded-full bg-[#f0ebff] px-2 py-0.5 text-[10px] font-bold text-[#4f378a] uppercase">Current</span>}
                  </div>
                  {entry?.changedAt && (
                    <p className="mt-0.5 text-xs text-[#7a7582]">
                      {new Date(entry.changedAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
                      {entry.remarks ? ` — ${entry.remarks}` : ""}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

// ── Documents Checklist ───────────────────────────────────────────────────────
function DocumentsChecklist({ required, uploaded, onUpload, uploading, approvalId, industryId }) {
  const fileRef = useRef(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const uploadedTypes = new Set(uploaded.map((d) => d.documentType.toLowerCase()));

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedDoc) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("industryId", industryId);
    formData.append("approvalId", approvalId);
    formData.append("documentType", selectedDoc);

    await onUpload(formData, selectedDoc);
    setSelectedDoc(null);
    e.target.value = "";
  };

  return (
    <div>
      <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7a7582]">
        <FileText size={13} /> Required Documents
        <span className="ml-auto normal-case font-semibold">
          {uploadedTypes.size}/{required.length} uploaded
        </span>
      </p>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.jpg,.jpeg"
        className="hidden"
        onChange={handleFileChange}
      />

      <ul className="space-y-2">
        {required.map((doc) => {
          const isUploaded = uploadedTypes.has(doc.toLowerCase());
          const isUploading = uploading === doc;
          const uploadedDoc = uploaded.find((d) => d.documentType.toLowerCase() === doc.toLowerCase());

          return (
            <li
              key={doc}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                isUploaded
                  ? "border-green-200 bg-green-50"
                  : "border-[#e6e0e9] bg-white"
              }`}
            >
              {/* Checkbox icon */}
              <span className="shrink-0">
                {isUploaded ? (
                  <CheckSquare size={18} className="text-green-600" />
                ) : (
                  <Square size={18} className="text-[#7a7582]" />
                )}
              </span>

              {/* Doc name */}
              <span className={`flex-1 text-sm ${isUploaded ? "text-green-800 font-medium" : "text-[#1d1b20]"}`}>
                {doc}
              </span>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-2">
                {isUploaded && uploadedDoc?.fileUrl && (
                  <a
                    href={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${uploadedDoc.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-[#4f378a] hover:underline"
                  >
                    <Eye size={13} /> View
                  </a>
                )}

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => {
                    setSelectedDoc(doc);
                    fileRef.current?.click();
                  }}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isUploaded
                      ? "border border-green-200 bg-white text-green-700 hover:bg-green-50"
                      : "bg-[#4f378a] text-white hover:bg-[#6750a4]"
                  }`}
                >
                  {isUploading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Upload size={12} />
                  )}
                  {isUploaded ? "Replace" : "Upload"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-2 text-xs text-[#7a7582]">Accepted formats: PDF, JPG — max 5 MB per file</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ApprovalDetail() {
  const { approvalId }      = useParams();
  const [searchParams]      = useSearchParams();
  const industryId          = searchParams.get("industryId");
  const navigate            = useNavigate();

  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [uploading, setUploading] = useState(null);  // documentType being uploaded
  const [marking,   setMarking]   = useState(false); // marking as docs prepared
  const [actionErr, setActionErr] = useState("");

  const load = async () => {
    try {
      const res = await api.get(`/approvals/${approvalId}/detail?industryId=${industryId}`);
      if (res.data?.success) setData(res.data.data);
      else setError("Failed to load approval details.");
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.error ||
        "Failed to load approval details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!approvalId || !industryId) {
      setError("Missing approval or industry ID.");
      setLoading(false);
      return;
    }
    load();
  }, [approvalId, industryId]); // eslint-disable-line

  // ── Upload document ────────────────────────────────────────────────────────
  const handleUpload = async (formData, docType) => {
    setUploading(docType);
    setActionErr("");
    try {
      await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await load(); // refresh
    } catch (err) {
      setActionErr(
        err.response?.data?.error?.message ||
        err.response?.data?.error ||
        "Upload failed. Please try again."
      );
    } finally {
      setUploading(null);
    }
  };

  // ── Mark documents prepared ────────────────────────────────────────────────
  const handleMarkPrepared = async () => {
    if (!data?.application?.id) return;
    setMarking(true);
    setActionErr("");
    try {
      await api.put(`/applications/${data.application.id}/status`, {
        status: "DOCUMENTS_PREPARED",
        remarks: "Documents prepared and ready for submission.",
      });
      await load();
    } catch (err) {
      setActionErr(
        err.response?.data?.error?.message ||
        err.response?.data?.error ||
        "Failed to update status."
      );
    } finally {
      setMarking(false);
    }
  };

  // ── Mark as submitted ──────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!data?.application?.id) return;
    setMarking(true);
    setActionErr("");
    try {
      await api.put(`/applications/${data.application.id}/status`, {
        status: "SUBMITTED",
        remarks: "Application submitted to authority.",
      });
      await load();
    } catch (err) {
      setActionErr(
        err.response?.data?.error?.message ||
        err.response?.data?.error ||
        "Failed to update status."
      );
    } finally {
      setMarking(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const appStatus  = data?.application?.status || "NOT_STARTED";
  const isApproved = appStatus === "APPROVED";
  const catClass   = CAT_COLOR[data?.approval?.category] || CAT_COLOR["General"];
  const CatIcon    = CAT_ICON[data?.approval?.category]  || ShieldCheck;

  const uploadedDocs   = data?.documents  || [];
  const requiredDocs   = data?.approval?.requiredDocuments || [];
  const allDocsUploaded = requiredDocs.length > 0 &&
    requiredDocs.every((d) =>
      uploadedDocs.some((u) => u.documentType.toLowerCase() === d.toLowerCase())
    );

  const blockedDeps = (data?.approval?.dependencies || []).filter((d) => !d.isObtained);
  const isBlocked   = blockedDeps.length > 0;

  return (
    <div className="min-h-screen bg-[#fdf7ff]">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between border-b border-[#cbc4d2] bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Factory className="h-7 w-7 text-[#4f378a]" />
          <span className="text-lg font-bold text-[#1d1b20]">Smart India Industrial Portal</span>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-lg border border-[#cbc4d2] px-4 py-2 text-sm font-semibold text-[#4f378a] hover:bg-[#f8f2fa]"
        >
          <ArrowLeft size={15} /> Back
        </button>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#4f378a]" />
            <p className="text-sm text-[#494551]">Loading approval details…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-red-500" />
            <p className="text-sm font-semibold text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-4 rounded-lg bg-[#4f378a] px-5 py-2 text-sm font-semibold text-white hover:bg-[#6750a4]"
            >
              Go Back
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <div className="space-y-6">
            {/* ── Approval Header card ─────────────────────────────────── */}
            <div className={`rounded-xl border p-6 shadow-sm ${catClass}`}>
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm`}>
                  <CatIcon size={24} className={catClass.split(" ")[0]} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${catClass}`}>
                      {data.approval.category}
                    </span>
                    <StatusBadge status={appStatus} />
                  </div>
                  <h1 className="text-xl font-bold text-[#1d1b20] leading-tight">{data.approval.name}</h1>
                  <p className={`mt-1 text-sm font-medium ${catClass.split(" ")[0]}`}>{data.approval.authority}</p>
                </div>
                {data.approval.slaDays && (
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#7a7582]">SLA</p>
                    <span className="flex items-center gap-1 text-sm font-bold text-[#1d1b20]">
                      <CalendarClock size={14} className="text-[#4f378a]" />
                      {data.approval.slaDays} days
                    </span>
                  </div>
                )}
              </div>

              {/* SLA progress if submitted */}
              {data.application?.submissionDate && data.application?.expectedCompletionDate && !isApproved && (
                <div className="mt-4 rounded-lg bg-white/60 px-4 py-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#494551]">SLA Progress</span>
                    <span className="font-semibold text-[#4f378a]">
                      {Math.max(0, Math.ceil(
                        (new Date(data.application.expectedCompletionDate) - new Date()) / (1000 * 60 * 60 * 24)
                      ))} days remaining
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#e6e0e9]">
                    <div
                      className="h-full rounded-full bg-[#4f378a] transition-all"
                      style={{
                        width: `${Math.min(100, Math.max(0, 100 - (
                          (new Date(data.application.expectedCompletionDate) - new Date()) /
                          (new Date(data.application.expectedCompletionDate) - new Date(data.application.submissionDate))
                        ) * 100))}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── Blocked by deps warning ──────────────────────────────── */}
            {isBlocked && (
              <div className="rounded-xl border border-orange-200 bg-orange-50 px-5 py-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-orange-700 mb-2">
                  <Lock size={15} /> Prerequisites Required
                </p>
                <ul className="space-y-1">
                  {blockedDeps.map((d) => (
                    <li key={d.name} className="flex items-center gap-2 text-sm text-orange-600">
                      <Lock size={12} className="shrink-0" /> {d.name} — not yet obtained
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Why this applies ────────────────────────────────────── */}
            <div className="rounded-xl border border-[#cbc4d2] bg-white p-6 shadow-sm space-y-4">
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7a7582]">
                  <Info size={13} /> Why This Applies To You
                </p>
                <div className="rounded-lg border border-[#e6e0e9] bg-[#f8f2fa] px-5 py-4 text-sm text-[#1d1b20] leading-relaxed">
                  {data.rule?.reason || data.approval.description}
                </div>
              </div>

              {data.approval.description && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#7a7582]">Description</p>
                  <p className="text-sm text-[#494551] leading-relaxed">{data.approval.description}</p>
                </div>
              )}

              {data.approval.legalBasis && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7a7582]">
                    <Scale size={13} /> Legal Basis
                  </p>
                  <p className="rounded-lg border border-[#e6e0e9] bg-[#fdf7ff] px-4 py-3 text-xs text-[#494551] leading-relaxed">
                    {data.approval.legalBasis}
                  </p>
                </div>
              )}

              {data.rule?.source && (
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#7a7582]">Rule Reference</p>
                  <p className="text-xs text-[#494551]">{data.rule.source}</p>
                </div>
              )}
            </div>

            {/* ── Status Timeline ──────────────────────────────────────── */}
            <div className="rounded-xl border border-[#cbc4d2] bg-white p-6 shadow-sm">
              <StatusTimeline
                status={appStatus}
                history={data.application?.statusHistory || []}
              />
            </div>

            {/* ── Documents Checklist ──────────────────────────────────── */}
            {requiredDocs.length > 0 && (
              <div className="rounded-xl border border-[#cbc4d2] bg-white p-6 shadow-sm">
                <DocumentsChecklist
                  required={requiredDocs}
                  uploaded={uploadedDocs}
                  onUpload={handleUpload}
                  uploading={uploading}
                  approvalId={approvalId}
                  industryId={industryId}
                />
              </div>
            )}

            {/* ── Dependencies ─────────────────────────────────────────── */}
            {data.approval.dependencies?.length > 0 && (
              <div className="rounded-xl border border-[#cbc4d2] bg-white p-6 shadow-sm">
                <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7a7582]">
                  <Link2 size={13} /> Prerequisites
                </p>
                <ul className="space-y-2">
                  {data.approval.dependencies.map((dep) => (
                    <li
                      key={dep.name}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                        dep.isObtained
                          ? "border-green-200 bg-green-50"
                          : "border-orange-200 bg-orange-50"
                      }`}
                    >
                      {dep.isObtained
                        ? <CheckCircle2 size={16} className="shrink-0 text-green-600" />
                        : <Lock size={16} className="shrink-0 text-orange-500" />
                      }
                      <span className={`font-medium ${dep.isObtained ? "text-green-700" : "text-[#1d1b20]"}`}>
                        {dep.name}
                      </span>
                      <span className={`ml-auto text-xs font-semibold ${dep.isObtained ? "text-green-600" : "text-orange-600"}`}>
                        {dep.isObtained ? "Obtained ✓" : "Required First"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Action error ─────────────────────────────────────────── */}
            {actionErr && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {actionErr}
              </div>
            )}

            {/* ── Actions ─────────────────────────────────────────────── */}
            <div className="rounded-xl border border-[#cbc4d2] bg-white p-6 shadow-sm space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#7a7582] mb-3">Actions</p>

              {/* Mark docs prepared */}
              {appStatus === "NOT_STARTED" && !isBlocked && data.application?.id && (
                <button
                  type="button"
                  onClick={handleMarkPrepared}
                  disabled={marking}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4f378a] px-4 py-3 text-sm font-bold text-white hover:bg-[#6750a4] disabled:opacity-50 transition-colors"
                >
                  {marking ? <Loader2 size={16} className="animate-spin" /> : <ClipboardList size={16} />}
                  Mark Documents as Prepared
                </button>
              )}

              {/* Submit application */}
              {appStatus === "DOCUMENTS_PREPARED" && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={marking}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4f378a] px-4 py-3 text-sm font-bold text-white hover:bg-[#6750a4] disabled:opacity-50 transition-colors"
                >
                  {marking ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  Submit Application
                </button>
              )}

              {/* In progress note */}
              {["SUBMITTED","UNDER_REVIEW","INSPECTION"].includes(appStatus) && (
                <div className="flex items-center gap-2 rounded-xl border border-[#e6e0e9] bg-[#f8f2fa] px-4 py-3 text-sm text-[#494551]">
                  <Loader2 size={15} className="animate-spin text-[#4f378a]" />
                  Your application is with the authority — no action required now.
                </div>
              )}

              {/* Approved */}
              {isApproved && (
                <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                  <CheckCircle2 size={16} /> Approval Obtained — no further action needed.
                </div>
              )}

              {/* No application yet — start one */}
              {!data.application && !isBlocked && (
                <button
                  type="button"
                  onClick={async () => {
                    setMarking(true);
                    setActionErr("");
                    try {
                      await api.post("/applications", { industryId, approvalId });
                      await load();
                    } catch (err) {
                      setActionErr(err.response?.data?.error?.message || "Failed to start application.");
                    } finally {
                      setMarking(false);
                    }
                  }}
                  disabled={marking}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4f378a] px-4 py-3 text-sm font-bold text-white hover:bg-[#6750a4] disabled:opacity-50 transition-colors"
                >
                  {marking ? <Loader2 size={16} className="animate-spin" /> : <ClipboardList size={16} />}
                  Start Application
                </button>
              )}

              {/* Official portal link */}
              {data.approval.officialUrl && (
                <a
                  href={data.approval.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#cbc4d2] px-4 py-2.5 text-sm font-semibold text-[#4f378a] hover:bg-[#f8f2fa] transition-colors"
                >
                  <ExternalLink size={15} /> Visit Official Portal
                </a>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
