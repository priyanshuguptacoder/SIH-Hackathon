import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../api/api";
import {
  Plus, Pencil, Trash2, Save, X, Loader2,
  RefreshCw, Landmark, CheckCircle2, ChevronDown, ChevronUp,
} from "lucide-react";

const EMPTY = {
  schemeName: "", description: "", benefits: "", officialUrl: "",
  state: "", sector: "",
  eligibilityCriteria: JSON.stringify({ operator: "AND", rules: [] }, null, 2),
};

function SchemeRow({ scheme, onSaved, onDeleted }) {
  const [open,    setOpen]    = useState(false);
  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState({ ...scheme, eligibilityCriteria: JSON.stringify(scheme.eligibilityCriteria, null, 2) });
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");

  const save = async () => {
    setSaving(true); setErr("");
    try {
      let criteria;
      try { criteria = JSON.parse(form.eligibilityCriteria); } catch { setErr("Eligibility Criteria JSON is invalid."); setSaving(false); return; }
      await api.put(`/admin/schemes/${scheme._id}`, { ...form, eligibilityCriteria: criteria });
      setEditing(false);
      onSaved();
    } catch (e) { setErr(e.response?.data?.error?.message || "Save failed."); }
    finally { setSaving(false); }
  };

  const del = async () => {
    if (!window.confirm(`Delete "${scheme.schemeName}"?`)) return;
    try { await api.delete(`/admin/schemes/${scheme._id}`); onDeleted(); } catch { /* silent */ }
  };

  const F = ({ label, field, type = "text", placeholder = "" }) => (
    <div>
      <label className="label">{label}</label>
      {type === "textarea"
        ? <textarea className="input" rows={3} value={form[field]} placeholder={placeholder}
            onChange={e => setForm(p => ({...p, [field]: e.target.value}))} />
        : <input className="input" type={type} value={form[field]} placeholder={placeholder}
            onChange={e => setForm(p => ({...p, [field]: e.target.value}))} />}
    </div>
  );

  return (
    <div className="rounded-xl border border-[#e6e0e9] bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0ebff]">
          <Landmark size={16} className="text-[#4f378a]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#1d1b20] truncate">{scheme.schemeName}</p>
          <p className="text-xs text-[#7a7582]">{scheme.state} · {scheme.sector}</p>
        </div>
        <button type="button" onClick={() => { setEditing(true); setOpen(true); }}>
          <Pencil size={14} className="text-[#4f378a]" />
        </button>
        <button type="button" onClick={del}>
          <Trash2 size={14} className="text-red-400" />
        </button>
        <button type="button" onClick={() => setOpen(o => !o)}>
          {open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[#e6e0e9] bg-[#fdf7ff] px-5 py-4 space-y-4">
          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <F label="Scheme Name *" field="schemeName" />
                <F label="State"         field="state"       placeholder="e.g. Maharashtra" />
                <F label="Sector"        field="sector"      placeholder="e.g. textiles" />
                <F label="Official URL"  field="officialUrl" />
              </div>
              <F label="Description *"  field="description" type="textarea" />
              <F label="Benefits *"     field="benefits"    type="textarea" />
              <div>
                <label className="label">Eligibility Criteria (JSON)</label>
                <textarea className="input font-mono text-xs" rows={8} value={form.eligibilityCriteria}
                  onChange={e => setForm(p => ({...p, eligibilityCriteria: e.target.value}))} />
              </div>
              {err && <p className="text-sm text-red-600">{err}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={save} disabled={saving}
                  className="flex items-center gap-1.5 rounded-lg bg-[#4f378a] px-4 py-2 text-xs font-bold text-white hover:bg-[#6750a4] disabled:opacity-50">
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
                </button>
                <button type="button" onClick={() => setEditing(false)}
                  className="rounded-lg border border-[#cbc4d2] px-4 py-2 text-xs font-semibold text-[#494551]">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-xs text-[#494551]">
              <p><span className="font-bold">Description:</span> {scheme.description}</p>
              <p><span className="font-bold">Benefits:</span> {scheme.benefits}</p>
              {scheme.officialUrl && <p><span className="font-bold">URL:</span> <a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer" className="text-[#4f378a] underline">{scheme.officialUrl}</a></p>}
              <div>
                <p className="font-bold mb-1">Eligibility Criteria:</p>
                <pre className="rounded-lg bg-[#1e1a2e] text-green-300 px-4 py-3 text-[11px] overflow-x-auto">
                  {JSON.stringify(scheme.eligibilityCriteria, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminSchemes() {
  const [schemes,  setSchemes]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [creating, setCreating] = useState(false);
  const [newForm,  setNewForm]  = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState("");
  const [toast,    setToast]    = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/schemes");
      if (res.data?.success) setSchemes(res.data.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    setSaving(true); setErr("");
    try {
      let criteria;
      try { criteria = JSON.parse(newForm.eligibilityCriteria); } catch { setErr("Eligibility Criteria JSON is invalid."); setSaving(false); return; }
      await api.post("/admin/schemes", { ...newForm, eligibilityCriteria: criteria });
      setCreating(false); setNewForm(EMPTY);
      showToast("Scheme created.");
      load();
    } catch (e) { setErr(e.response?.data?.error?.message || "Create failed."); }
    finally { setSaving(false); }
  };

  const NF = ({ label, field, type = "text", placeholder = "" }) => (
    <div>
      <label className="label">{label}</label>
      {type === "textarea"
        ? <textarea className="input" rows={3} value={newForm[field]} placeholder={placeholder}
            onChange={e => setNewForm(p => ({...p, [field]: e.target.value}))} />
        : <input className="input" type={type} value={newForm[field]} placeholder={placeholder}
            onChange={e => setNewForm(p => ({...p, [field]: e.target.value}))} />}
    </div>
  );

  return (
    <AdminLayout title="Government Schemes" subtitle="Manage scheme eligibility criteria and benefits">
      <div className="mb-5 flex items-center gap-3">
        <button type="button" onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-xl bg-[#4f378a] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#6750a4]">
          <Plus size={16} /> New Scheme
        </button>
        <button type="button" onClick={load}
          className="flex items-center gap-1.5 rounded-xl border border-[#cbc4d2] px-4 py-2.5 text-sm font-semibold text-[#4f378a] hover:bg-[#f8f2fa]">
          <RefreshCw size={15} /> Refresh
        </button>
        <span className="ml-auto text-sm text-[#7a7582]">{schemes.length} schemes</span>
      </div>

      {creating && (
        <div className="mb-5 rounded-xl border-2 border-[#4f378a] bg-white p-5 shadow-sm space-y-3">
          <p className="font-bold text-[#1d1b20]">New Scheme</p>
          <div className="grid grid-cols-2 gap-3">
            <NF label="Scheme Name *" field="schemeName" />
            <NF label="State"         field="state"       placeholder="Maharashtra" />
            <NF label="Sector"        field="sector"      placeholder="textiles" />
            <NF label="Official URL"  field="officialUrl" />
          </div>
          <NF label="Description *" field="description" type="textarea" />
          <NF label="Benefits *"    field="benefits"    type="textarea" />
          <div>
            <label className="label">Eligibility Criteria (JSON)</label>
            <textarea className="input font-mono text-xs" rows={8} value={newForm.eligibilityCriteria}
              onChange={e => setNewForm(p => ({...p, eligibilityCriteria: e.target.value}))} />
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={create} disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-[#4f378a] px-4 py-2 text-xs font-bold text-white hover:bg-[#6750a4] disabled:opacity-50">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Create
            </button>
            <button type="button" onClick={() => { setCreating(false); setErr(""); }}
              className="rounded-lg border border-[#cbc4d2] px-4 py-2 text-xs font-semibold text-[#494551]">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="h-9 w-9 animate-spin rounded-full border-4 border-[#4f378a] border-t-transparent" /></div>
      ) : schemes.length === 0 ? (
        <div className="rounded-xl border border-[#e6e0e9] bg-white p-12 text-center">
          <Landmark className="mx-auto mb-3 h-10 w-10 text-[#cbc4d2]" />
          <p className="text-sm text-[#494551]">No schemes yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schemes.map(s => (
            <SchemeRow key={s._id} scheme={s}
              onSaved={() => { showToast("Scheme updated."); load(); }}
              onDeleted={() => { showToast("Scheme deleted."); load(); }} />
          ))}
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
