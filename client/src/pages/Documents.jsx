import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Factory,
  Upload,
  FileText,
  Image,
  Trash2,
  Eye,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock3,
  AlertTriangle,
  Search,
  LayoutDashboard,
  ArrowLeft,
  CloudUpload,
  Tag,
  CalendarClock,
  Building2,
  Hash,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import api from "../api/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Extraction status config ──────────────────────────────────────────────────
const EXTRACT_CFG = {
  PENDING:    { label: "Pending",    icon: Clock3,       color: "text-[#7a7582]",    bg: "bg-[#e6e0e9]"      },
  PROCESSING: { label: "Processing", icon: Loader2,      color: "text-blue-600",     bg: "bg-blue-100",      spin: true },
  DONE:       { label: "Extracted",  icon: CheckCircle2, color: "text-green-600",    bg: "bg-green-100"      },
  FAILED:     { label: "Failed",     icon: XCircle,      color: "text-red-600",      bg: "bg-red-100"        },
};

function ExtractionBadge({ status }) {
  const cfg  = EXTRACT_CFG[status] || EXTRACT_CFG.PENDING;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      <Icon size={12} className={cfg.spin ? "animate-spin" : ""} />
      {cfg.label}
    </span>
  );
}

function fileSizeLabel(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mimeType) {
  if (!mimeType) return FileText;
  if (mimeType === "application/pdf") return FileText;
  return Image;
}

// ── Upload modal ──────────────────────────────────────────────────────────────
function UploadModal({ industryId, onClose, onUploaded }) {
  const [dragOver,      setDragOver]      = useState(false);
  const [files,         setFiles]         = useState([]);   // [{file, documentType, approvalId}]
  const [uploading,     setUploading]     = useState(false);
  const [errors,        setErrors]        = useState({});
  const fileInputRef = useRef(null);

  const DOC_TYPES = [
    "Project Report", "Site Plan", "Water Balance Diagram", "ETP Layout",
    "NOC from Local Authority", "CTE Certificate", "Completion Certificate",
    "ETP Commissioning Report", "Stack Monitoring Report",
    "Plan of Premises", "Stability Certificate", "NOC from Fire Department",
    "MSEB Connection Proof", "Building Plan", "Fire Safety Audit Report",
    "Occupancy Certificate", "Form XII Application", "List of Contractors",
    "Principal Employer Registration Certificate", "Other",
  ];

  const addFiles = (newFiles) => {
    const valid = Array.from(newFiles).filter((f) =>
      ["application/pdf","image/jpeg","image/jpg","image/png"].includes(f.type)
    );
    setFiles((prev) => [
      ...prev,
      ...valid.map((f) => ({ file: f, documentType: "", approvalId: "" })),
    ]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const updateRow = (i, field, val) =>
    setFiles((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));

  const removeRow = (i) =>
    setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    // Validate
    const errs = {};
    files.forEach((r, i) => {
      if (!r.documentType) errs[i] = "Select document type";
    });
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setUploading(true);
    let uploaded = 0;
    for (const row of files) {
      const fd = new FormData();
      fd.append("file", row.file);
      fd.append("industryId", industryId);
      fd.append("documentType", row.documentType);
      if (row.approvalId) fd.append("approvalId", row.approvalId);
      try {
        await api.post("/documents/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploaded++;
      } catch {/* continue with others */}
    }
    setUploading(false);
    onUploaded(uploaded);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-xl -translate-y-1/2 rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e6e0e9] px-6 py-4">
          <h2 className="text-lg font-bold text-[#1d1b20]">Upload Documents</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-[#e6e0e9]">
            <X size={18} className="text-[#494551]" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${
              dragOver ? "border-[#4f378a] bg-[#f0ebff]" : "border-[#cbc4d2] bg-[#fdf7ff] hover:border-[#4f378a] hover:bg-[#f8f2fa]"
            }`}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0ebff]">
              <CloudUpload size={28} className="text-[#4f378a]" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-[#1d1b20]">Drag & drop files here</p>
              <p className="text-sm text-[#494551]">or click to browse — PDF, JPG, PNG · max 5 MB each</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>

          {/* File rows */}
          {files.length > 0 && (
            <div className="space-y-3">
              {files.map((row, i) => {
                const FIcon = fileIcon(row.file.type);
                return (
                  <div key={i} className="rounded-xl border border-[#e6e0e9] bg-[#fdf7ff] p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f0ebff]">
                        <FIcon size={18} className="text-[#4f378a]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-[#1d1b20]">{row.file.name}</p>
                        <p className="text-xs text-[#7a7582]">{fileSizeLabel(row.file.size)}</p>
                      </div>
                      <button type="button" onClick={() => removeRow(i)} className="shrink-0 rounded-full p-1 hover:bg-red-50">
                        <X size={15} className="text-red-500" />
                      </button>
                    </div>

                    <div className="mt-3">
                      <select
                        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-[#4f378a] focus:ring-2 focus:ring-[#cfbcff] ${
                          errors[i] ? "border-red-400 bg-red-50" : "border-[#cbc4d2] bg-white"
                        }`}
                        value={row.documentType}
                        onChange={(e) => { updateRow(i, "documentType", e.target.value); setErrors((prev) => { const n={...prev}; delete n[i]; return n; }); }}
                      >
                        <option value="">Select document type…</option>
                        {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {errors[i] && <p className="mt-1 text-xs text-red-500">{errors[i]}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#e6e0e9] px-6 py-4">
          <span className="text-sm text-[#494551]">{files.length} file{files.length !== 1 ? "s" : ""} selected</span>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-[#cbc4d2] px-4 py-2 text-sm font-semibold text-[#494551] hover:bg-[#f8f2fa]">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={files.length === 0 || uploading}
              className="flex items-center gap-2 rounded-lg bg-[#4f378a] px-5 py-2 text-sm font-semibold text-white hover:bg-[#6750a4] disabled:opacity-50"
            >
              {uploading ? <><Loader2 size={15} className="animate-spin" /> Uploading…</> : <><Upload size={15} /> Upload All</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Document row card ─────────────────────────────────────────────────────────
function DocumentCard({ doc, onDelete, onExtract, deleting, extracting }) {
  const [expanded, setExpanded] = useState(false);
  const FIcon = fileIcon(doc.mimeType);
  const hasDone = doc.extractionStatus === "DONE" && doc.extractedData;

  return (
    <div className="rounded-xl border border-[#cbc4d2] bg-white shadow-sm transition-all">
      {/* Main row */}
      <div className="flex items-start gap-4 p-4">
        {/* Icon */}
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          doc.mimeType === "application/pdf" ? "bg-red-50" : "bg-blue-50"
        }`}>
          <FIcon size={22} className={doc.mimeType === "application/pdf" ? "text-red-500" : "text-blue-500"} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-2">
            <p className="truncate text-sm font-semibold text-[#1d1b20]">
              {doc.originalName || doc.documentType}
            </p>
            <ExtractionBadge status={doc.extractionStatus} />
          </div>

          <p className="mt-0.5 text-xs text-[#4f378a] font-medium">{doc.documentType}</p>

          {/* Meta row */}
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[#7a7582]">
            <span>{fileSizeLabel(doc.fileSize)}</span>
            <span>·</span>
            <span>{new Date(doc.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}</span>
            {doc.approvalId?.approvalName && (
              <>
                <span>·</span>
                <span className="truncate max-w-[160px]">{doc.approvalId.approvalName}</span>
              </>
            )}
          </div>

          {/* Tags */}
          {doc.tags?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {doc.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-[#f0ebff] px-2 py-0.5 text-[10px] font-semibold text-[#4f378a]">
                  <Tag size={9} /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex items-center gap-1">
            {/* View */}
            <a
              href={`${API_BASE}${doc.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              title="View file"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e6e0e9] hover:bg-[#f8f2fa] transition-colors"
            >
              <Eye size={15} className="text-[#4f378a]" />
            </a>

            {/* Extract */}
            <button
              type="button"
              title="Trigger extraction"
              onClick={() => onExtract(doc._id)}
              disabled={extracting === doc._id || doc.extractionStatus === "PROCESSING"}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e6e0e9] hover:bg-[#f0ebff] transition-colors disabled:opacity-40"
            >
              {extracting === doc._id ? (
                <Loader2 size={15} className="animate-spin text-[#4f378a]" />
              ) : (
                <Sparkles size={15} className="text-[#4f378a]" />
              )}
            </button>

            {/* Delete */}
            <button
              type="button"
              title="Delete document"
              onClick={() => onDelete(doc._id)}
              disabled={deleting === doc._id}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e6e0e9] hover:bg-red-50 transition-colors disabled:opacity-40"
            >
              {deleting === doc._id ? (
                <Loader2 size={15} className="animate-spin text-red-400" />
              ) : (
                <Trash2 size={15} className="text-red-400" />
              )}
            </button>
          </div>

          {/* Expand extracted data toggle */}
          {hasDone && (
            <button
              type="button"
              onClick={() => setExpanded((o) => !o)}
              className="flex items-center gap-1 text-[10px] font-semibold text-[#4f378a] hover:underline"
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? "Hide" : "View"} Extracted
            </button>
          )}
        </div>
      </div>

      {/* Extracted data panel */}
      {expanded && hasDone && (
        <div className="border-t border-[#e6e0e9] bg-[#fdf7ff] px-5 py-4 rounded-b-xl">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7a7582]">
            <Sparkles size={12} /> Extracted Data
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {doc.extractedData.companyName && (
              <div>
                <p className="flex items-center gap-1 font-semibold text-[#7a7582] mb-0.5"><Building2 size={11} /> Company</p>
                <p className="text-[#1d1b20]">{doc.extractedData.companyName}</p>
              </div>
            )}
            {doc.extractedData.licenseNumber && (
              <div>
                <p className="flex items-center gap-1 font-semibold text-[#7a7582] mb-0.5"><Hash size={11} /> License No.</p>
                <p className="text-[#1d1b20]">{doc.extractedData.licenseNumber}</p>
              </div>
            )}
            {doc.extractedData.issuedBy && (
              <div>
                <p className="flex items-center gap-1 font-semibold text-[#7a7582] mb-0.5"><Building2 size={11} /> Issued By</p>
                <p className="text-[#1d1b20]">{doc.extractedData.issuedBy}</p>
              </div>
            )}
            {doc.extractedData.expiryDate && (
              <div>
                <p className="flex items-center gap-1 font-semibold text-[#7a7582] mb-0.5"><CalendarClock size={11} /> Expiry</p>
                <p className="text-[#1d1b20]">{new Date(doc.extractedData.expiryDate).toLocaleDateString("en-IN")}</p>
              </div>
            )}
            {doc.extractedData.raw && (
              <div className="col-span-2">
                <p className="font-semibold text-[#7a7582] mb-0.5">Raw Notes</p>
                <p className="text-[#494551] italic">{doc.extractedData.raw}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Documents() {
  const navigate = useNavigate();

  const [docs,       setDocs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [industryId, setIndustryId] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("ALL");  // ALL | PENDING | PROCESSING | DONE | FAILED
  const [deleting,   setDeleting]   = useState(null);
  const [extracting, setExtracting] = useState(null);
  const [toast,      setToast]      = useState(null);   // { msg, type }

  // Poll for PROCESSING docs
  const pollRef = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadDocs = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const res = await api.get("/documents");
      if (res.data?.success) setDocs(res.data.data || []);
    } catch {
      if (!quiet) setError("Failed to load documents.");
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  // Load industry ID
  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get("/industries/me");
        if (res.data?.data?._id) setIndustryId(res.data.data._id);
      } catch { /* no profile yet */ }
      loadDocs();
    };
    init();
  }, [loadDocs]);

  // Poll every 3s while any doc is PROCESSING
  useEffect(() => {
    const hasProcessing = docs.some((d) => d.extractionStatus === "PROCESSING");
    if (hasProcessing && !pollRef.current) {
      pollRef.current = setInterval(() => loadDocs(true), 3000);
    } else if (!hasProcessing && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };
  }, [docs, loadDocs]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await api.delete(`/documents/${id}`);
      setDocs((prev) => prev.filter((d) => d._id !== id));
      showToast("Document deleted.");
    } catch {
      showToast("Failed to delete document.", "error");
    } finally {
      setDeleting(null);
    }
  };

  const handleExtract = async (id) => {
    setExtracting(id);
    try {
      await api.post(`/documents/${id}/extract`);
      setDocs((prev) => prev.map((d) => d._id === id ? { ...d, extractionStatus: "PROCESSING" } : d));
      showToast("Extraction started.");
    } catch {
      showToast("Failed to trigger extraction.", "error");
    } finally {
      setExtracting(null);
    }
  };

  // Filtered + searched docs
  const visible = docs.filter((d) => {
    const matchSearch = !search ||
      d.documentType.toLowerCase().includes(search.toLowerCase()) ||
      (d.originalName || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === "ALL" || d.extractionStatus === filter;
    return matchSearch && matchFilter;
  });

  // Stats
  const total      = docs.length;
  const done       = docs.filter((d) => d.extractionStatus === "DONE").length;
  const processing = docs.filter((d) => d.extractionStatus === "PROCESSING").length;
  const pending    = docs.filter((d) => d.extractionStatus === "PENDING").length;
  const failed     = docs.filter((d) => d.extractionStatus === "FAILED").length;

  const FILTERS = ["ALL", "PENDING", "PROCESSING", "DONE", "FAILED"];

  return (
    <div className="min-h-screen bg-[#fdf7ff]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#cbc4d2] bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <img src="/udyog-sanchar-icon.png" alt="UdyogSanchar" className="h-10 w-auto" />
          <span className="text-lg font-bold text-[#1d1b20]">UdyogSanchar</span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 rounded-lg border border-[#cbc4d2] px-4 py-2 text-sm font-semibold text-[#4f378a] hover:bg-[#f8f2fa]"
        >
          <LayoutDashboard size={15} /> Dashboard
        </button>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        {/* Page title */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[#4f378a] hover:underline"
            >
              <ArrowLeft size={15} /> Back
            </button>
            <h1 className="text-2xl font-bold text-[#1d1b20]">Document Repository</h1>
            <p className="text-sm text-[#494551]">Upload, organise, and extract data from your compliance documents</p>
          </div>

          <button
            type="button"
            onClick={() => { if (!industryId) { showToast("Complete your industry profile first.", "error"); return; } setShowUpload(true); }}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-[#4f378a] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#6750a4] transition-colors"
          >
            <Upload size={15} /> Upload Documents
          </button>
        </div>

        {/* Stats row */}
        {total > 0 && (
          <div className="mb-6 grid grid-cols-4 gap-3">
            {[
              { label: "Total",      value: total,      cls: "border-[#cbc4d2] bg-white text-[#1d1b20]" },
              { label: "Extracted",  value: done,       cls: "border-green-200 bg-green-50 text-green-700" },
              { label: "Processing", value: processing, cls: "border-blue-200 bg-blue-50 text-blue-700" },
              { label: "Pending",    value: pending + failed, cls: "border-orange-200 bg-orange-50 text-orange-700" },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border p-3 text-center shadow-sm ${s.cls}`}>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs mt-0.5 font-semibold opacity-70">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search + filter bar */}
        <div className="mb-5 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7582]" />
            <input
              className="w-full rounded-lg border border-[#cbc4d2] bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#4f378a] focus:ring-2 focus:ring-[#cfbcff]"
              placeholder="Search by name, type, or tag…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  filter === f
                    ? "bg-[#4f378a] text-white"
                    : "border border-[#cbc4d2] bg-white text-[#494551] hover:bg-[#f8f2fa]"
                }`}
              >
                {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => loadDocs()}
            title="Refresh"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#cbc4d2] bg-white hover:bg-[#f8f2fa]"
          >
            <RefreshCw size={15} className="text-[#4f378a]" />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-24 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#4f378a]" />
            <p className="text-sm text-[#494551]">Loading documents…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-red-500" />
            <p className="text-sm font-semibold text-red-600">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && total === 0 && (
          <div
            className="flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-[#cbc4d2] bg-white px-6 py-20 text-center hover:border-[#4f378a] hover:bg-[#f8f2fa] transition-colors"
            onClick={() => { if (industryId) setShowUpload(true); }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0ebff]">
              <CloudUpload size={32} className="text-[#4f378a]" />
            </div>
            <div>
              <p className="text-lg font-semibold text-[#1d1b20]">No documents yet</p>
              <p className="text-sm text-[#494551]">Click or drag files here to upload your first document</p>
            </div>
            <span className="rounded-xl bg-[#4f378a] px-6 py-2.5 text-sm font-bold text-white">
              Upload Documents
            </span>
          </div>
        )}

        {/* No results for filter */}
        {!loading && !error && total > 0 && visible.length === 0 && (
          <div className="rounded-xl border border-[#cbc4d2] bg-white p-10 text-center">
            <Search className="mx-auto mb-3 h-8 w-8 text-[#7a7582]" />
            <p className="text-sm font-semibold text-[#1d1b20]">No documents match your filter</p>
            <button type="button" onClick={() => { setSearch(""); setFilter("ALL"); }} className="mt-3 text-sm font-semibold text-[#4f378a] hover:underline">
              Clear filters
            </button>
          </div>
        )}

        {/* Document list */}
        {!loading && !error && visible.length > 0 && (
          <div className="space-y-3">
            {visible.map((doc) => (
              <DocumentCard
                key={doc._id}
                doc={doc}
                onDelete={handleDelete}
                onExtract={handleExtract}
                deleting={deleting}
                extracting={extracting}
              />
            ))}
          </div>
        )}
      </main>

      {/* Upload modal */}
      {showUpload && industryId && (
        <UploadModal
          industryId={industryId}
          onClose={() => setShowUpload(false)}
          onUploaded={(count) => {
            showToast(`${count} document${count !== 1 ? "s" : ""} uploaded. Extraction started.`);
            loadDocs();
          }}
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
