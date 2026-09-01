import { useState, useEffect, useRef } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../api/api";
import {
  Upload, CloudUpload, FileText, Trash2, Eye, Loader2,
  RefreshCw, CheckCircle2, Clock3, AlertTriangle, X,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const EXTRACT_CFG = {
  PENDING:    { label: "Pending",    cls: "bg-[#e6e0e9] text-[#494551]", icon: Clock3         },
  PROCESSING: { label: "Processing", cls: "bg-blue-100 text-blue-700",   icon: Loader2, spin: true },
  DONE:       { label: "Ingested",   cls: "bg-green-100 text-green-700", icon: CheckCircle2   },
  FAILED:     { label: "Failed",     cls: "bg-red-100 text-red-700",     icon: AlertTriangle  },
};

function StatusBadge({ status }) {
  const cfg  = EXTRACT_CFG[status] || EXTRACT_CFG.PENDING;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.cls}`}>
      <Icon size={11} className={cfg.spin ? "animate-spin" : ""} /> {cfg.label}
    </span>
  );
}

export default function AdminRegulations() {
  const [docs,      setDocs]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting,  setDeleting]  = useState(null);
  const [showForm,  setShowForm]  = useState(false);
  const [err,       setErr]       = useState("");
  const [toast,     setToast]     = useState("");
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    title: "", authority: "", effectiveDate: "",
    version: "1.0", state: "", sector: "", file: null,
  });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const res = await api.get("/admin/regulations");
      if (res.data?.success) setDocs(res.data.data || []);
    } finally { if (!quiet) setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Poll while any docs are PROCESSING
  useEffect(() => {
    const hasProcessing = docs.some(d => d.extractionStatus === "PROCESSING");
    if (!hasProcessing) return;
    const t = setInterval(() => load(true), 3000);
    return () => clearInterval(t);
  }, [docs]);

  const handleUpload = async () => {
    if (!form.file || !form.title || !form.authority) {
      setErr("File, title, and authority are required.");
      return;
    }
    setUploading(true); setErr("");
    try {
      const fd = new FormData();
      fd.append("file", form.file);
      fd.append("title",         form.title);
      fd.append("authority",     form.authority);
      fd.append("effectiveDate", form.effectiveDate);
      fd.append("version",       form.version);
      fd.append("state",         form.state);
      fd.append("sector",        form.sector);
      await api.post("/admin/regulations", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setShowForm(false);
      setForm({ title: "", authority: "", effectiveDate: "", version: "1.0", state: "", sector: "", file: null });
      showToast("Regulation uploaded. Ingestion started.");
      load();
    } catch (e) {
      setErr(e.response?.data?.error?.message || "Upload failed.");
    } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this regulation?")) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/regulations/${id}`);
      setDocs(p => p.filter(d => d._id !== id));
      showToast("Deleted.");
    } finally { setDeleting(null); }
  };

  const F = ({ label, field, type = "text", required = false, placeholder = "" }) => (
    <div>
      <label className="label">{label}{required && " *"}</label>
      <input className="input" type={type} value={form[field]} placeholder={placeholder}
        onChange={e => setForm(p => ({...p, [field]: e.target.value}))} />
    </div>
  );

  const fmtSize = (b) => b < 1024 * 1024 ? `${(b/1024).toFixed(1)} KB` : `${(b/1024/1024).toFixed(1)} MB`;

  return (
    <AdminLayout title="Regulations" subtitle="Upload official PDF documents for the RAG knowledge base">
      {/* Toolbar */}
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-[#4f378a] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#6750a4]">
          <Upload size={16} /> Upload Regulation
        </button>
        <button type="button" onClick={() => load()}
          className="flex items-center gap-1.5 rounded-xl border border-[#cbc4d2] px-4 py-2.5 text-sm font-semibold text-[#4f378a] hover:bg-[#f8f2fa]">
          <RefreshCw size={15} /> Refresh
        </button>
        <span className="ml-auto text-sm text-[#7a7582]">{docs.length} documents</span>
      </div>

      {/* Upload modal */}
      {showForm && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-xl -translate-y-1/2 rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e6e0e9] px-6 py-4">
              <h2 className="font-bold text-[#1d1b20]">Upload Regulation Document</h2>
              <button type="button" onClick={() => setShowForm(false)}><X size={18} className="text-[#494551]" /></button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-4">
              {/* Drop zone */}
              <div
                onClick={() => fileRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                  form.file ? "border-[#4f378a] bg-[#f0ebff]" : "border-[#cbc4d2] hover:border-[#4f378a] hover:bg-[#f8f2fa]"
                }`}
              >
                <CloudUpload size={28} className="text-[#4f378a]" />
                {form.file ? (
                  <div>
                    <p className="font-semibold text-[#1d1b20]">{form.file.name}</p>
                    <p className="text-xs text-[#7a7582]">{fmtSize(form.file.size)}</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-[#1d1b20]">Drop PDF here or click to browse</p>
                    <p className="text-xs text-[#7a7582]">PDF only · max 20 MB</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                onChange={e => setForm(p => ({...p, file: e.target.files[0] || null}))} />

              {/* Metadata fields */}
              <div className="grid grid-cols-2 gap-3">
                <F label="Document Title" field="title"         required placeholder="e.g. Water Act, 1974" />
                <F label="Authority"      field="authority"     required placeholder="e.g. MoEFCC" />
                <F label="Version"        field="version"       placeholder="1.0" />
                <F label="Effective Date" field="effectiveDate" type="date" />
                <F label="State (optional)"  field="state"   placeholder="Maharashtra" />
                <F label="Sector (optional)" field="sector"  placeholder="textiles" />
              </div>

              {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{err}</p>}
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e6e0e9] px-6 py-4">
              <button type="button" onClick={() => setShowForm(false)}
                className="rounded-xl border border-[#cbc4d2] px-5 py-2 text-sm font-semibold text-[#494551] hover:bg-[#f8f2fa]">
                Cancel
              </button>
              <button type="button" onClick={handleUpload} disabled={uploading}
                className="flex items-center gap-2 rounded-xl bg-[#4f378a] px-5 py-2 text-sm font-bold text-white hover:bg-[#6750a4] disabled:opacity-50">
                {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : <><Upload size={14} /> Upload & Ingest</>}
              </button>
            </div>
          </div>
        </>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="h-9 w-9 animate-spin rounded-full border-4 border-[#4f378a] border-t-transparent" /></div>
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-[#e6e0e9] bg-white py-20 text-center">
          <FileText className="h-12 w-12 text-[#cbc4d2]" />
          <p className="text-sm font-semibold text-[#494551]">No regulations uploaded yet.</p>
          <p className="text-xs text-[#7a7582]">Upload official PDFs to populate the RAG knowledge base.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#e6e0e9] bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e6e0e9] bg-[#fdf7ff] text-left">
                {["Document","Type","Size","Uploaded","Ingestion","Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#7a7582]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docs.map((doc, i) => (
                <tr key={doc._id} className={`border-b border-[#e6e0e9] last:border-0 ${i%2 ? "bg-[#fdf7ff]" : ""}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="shrink-0 text-red-500" />
                      <div>
                        <p className="font-semibold text-[#1d1b20] truncate max-w-[200px]">{doc.originalName || doc.documentType}</p>
                        {doc.tags?.filter(t => !["Regulation","PDF"].includes(t)).map(t => (
                          <span key={t} className="mr-1 inline-block rounded bg-[#f0ebff] px-1.5 py-0.5 text-[9px] font-bold text-[#4f378a]">{t}</span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-[#7a7582]">PDF</td>
                  <td className="px-5 py-3 text-xs text-[#7a7582]">{doc.fileSize ? fmtSize(doc.fileSize) : "—"}</td>
                  <td className="px-5 py-3 text-xs text-[#7a7582]">
                    {new Date(doc.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={doc.extractionStatus} /></td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <a href={`${API_BASE}${doc.fileUrl}`} target="_blank" rel="noopener noreferrer"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e6e0e9] hover:bg-[#f8f2fa]">
                        <Eye size={13} className="text-[#4f378a]" />
                      </a>
                      <button type="button" onClick={() => handleDelete(doc._id)} disabled={deleting === doc._id}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e6e0e9] hover:bg-red-50 disabled:opacity-40">
                        {deleting === doc._id ? <Loader2 size={13} className="animate-spin text-red-400" /> : <Trash2 size={13} className="text-red-400" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-xl bg-[#4f378a] px-5 py-3 text-sm font-semibold text-white shadow-lg">
          <CheckCircle2 size={15} /> {toast}
        </div>
      )}

      <style>{`.label{display:block;margin-bottom:4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#7a7582}.input{width:100%;border:1px solid #cbc4d2;border-radius:8px;padding:8px 12px;font-size:13px;outline:none;background:#fff}.input:focus{border-color:#4f378a;box-shadow:0 0 0 2px #cfbcff}`}</style>
    </AdminLayout>
  );
}
