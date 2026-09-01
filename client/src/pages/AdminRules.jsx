import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../api/api";
import {
  Plus, Pencil, Save, X, Loader2, RefreshCw,
  BookOpen, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, ToggleLeft, ToggleRight,
} from "lucide-react";

const EMPTY_RULE = {
  ruleId: "",
  approvalId: "",
  priority: 1,
  effectiveDate: "",
  version: "1.0",
  isActive: true,
  source: "",
  explanationTemplate: "",
  condition: JSON.stringify({ operator: "AND", rules: [] }, null, 2),
};

function RuleRow({ rule, approvals, onSaved }) {
  const [open,    setOpen]    = useState(false);
  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState({ ...rule, condition: JSON.stringify(rule.condition, null, 2) });
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");

  const save = async () => {
    setSaving(true); setErr("");
    try {
      let condition;
      try { condition = JSON.parse(form.condition); } catch { setErr("Condition JSON is invalid."); setSaving(false); return; }
      await api.put(`/admin/rules/${rule._id}`, { ...form, condition });
      setEditing(false);
      onSaved();
    } catch (e) {
      setErr(e.response?.data?.error?.message || "Save failed.");
    } finally { setSaving(false); }
  };

  const toggle = async () => {
    try {
      await api.put(`/admin/rules/${rule._id}`, { isActive: !rule.isActive });
      onSaved();
    } catch { /* silent */ }
  };

  const approvalName = approvals.find(a => a._id === (rule.approvalId?._id || rule.approvalId))?.approvalName || "—";

  return (
    <div className="rounded-xl border border-[#e6e0e9] bg-white shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 px-5 py-4">
        <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${rule.isActive ? "bg-green-500" : "bg-[#7a7582]"}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#1d1b20]">{rule.ruleId}</p>
          <p className="text-xs text-[#4f378a]">{approvalName} · Priority {rule.priority}</p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${rule.isActive ? "bg-green-100 text-green-700" : "bg-[#e6e0e9] text-[#7a7582]"}`}>
          {rule.isActive ? "Active" : "Inactive"}
        </span>
        <button type="button" onClick={toggle} title="Toggle active">
          {rule.isActive
            ? <ToggleRight size={22} className="text-[#4f378a]" />
            : <ToggleLeft  size={22} className="text-[#7a7582]" />}
        </button>
        <button type="button" onClick={() => { setEditing(true); setOpen(true); }}>
          <Pencil size={15} className="text-[#4f378a]" />
        </button>
        <button type="button" onClick={() => setOpen(o => !o)}>
          {open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
        </button>
      </div>

      {/* Expanded */}
      {open && (
        <div className="border-t border-[#e6e0e9] px-5 py-4 space-y-4 bg-[#fdf7ff]">
          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Rule ID</label>
                  <input className="input" value={form.ruleId} onChange={e => setForm(p => ({...p, ruleId: e.target.value}))} />
                </div>
                <div>
                  <label className="label">Approval</label>
                  <select className="input" value={form.approvalId?._id || form.approvalId}
                    onChange={e => setForm(p => ({...p, approvalId: e.target.value}))}>
                    {approvals.map(a => <option key={a._id} value={a._id}>{a.approvalName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Priority</label>
                  <input className="input" type="number" value={form.priority} onChange={e => setForm(p => ({...p, priority: +e.target.value}))} />
                </div>
                <div>
                  <label className="label">Version</label>
                  <input className="input" value={form.version} onChange={e => setForm(p => ({...p, version: e.target.value}))} />
                </div>
                <div>
                  <label className="label">Effective Date</label>
                  <input className="input" type="date" value={form.effectiveDate?.slice(0,10)}
                    onChange={e => setForm(p => ({...p, effectiveDate: e.target.value}))} />
                </div>
                <div>
                  <label className="label">Source</label>
                  <input className="input" value={form.source} onChange={e => setForm(p => ({...p, source: e.target.value}))} />
                </div>
              </div>
              <div>
                <label className="label">Explanation Template</label>
                <input className="input" value={form.explanationTemplate}
                  onChange={e => setForm(p => ({...p, explanationTemplate: e.target.value}))}
                  placeholder="e.g. Required because your {sector} project in {state}…" />
              </div>
              <div>
                <label className="label">Condition (JSON)</label>
                <textarea className="input font-mono text-xs" rows={8} value={form.condition}
                  onChange={e => setForm(p => ({...p, condition: e.target.value}))} />
              </div>
              {err && <p className="text-sm text-red-600">{err}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={save} disabled={saving}
                  className="flex items-center gap-1.5 rounded-lg bg-[#4f378a] px-4 py-2 text-xs font-bold text-white hover:bg-[#6750a4] disabled:opacity-50">
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
                </button>
                <button type="button" onClick={() => setEditing(false)}
                  className="rounded-lg border border-[#cbc4d2] px-4 py-2 text-xs font-semibold text-[#494551] hover:bg-[#f8f2fa]">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-xs text-[#494551]">
              <p><span className="font-bold">Template:</span> {rule.explanationTemplate}</p>
              <p><span className="font-bold">Source:</span>   {rule.source || "—"}</p>
              <div>
                <p className="font-bold mb-1">Condition:</p>
                <pre className="rounded-lg bg-[#1e1a2e] text-green-300 px-4 py-3 text-[11px] overflow-x-auto">
                  {JSON.stringify(rule.condition, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminRules() {
  const [rules,     setRules]     = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [creating,  setCreating]  = useState(false);
  const [newForm,   setNewForm]   = useState(EMPTY_RULE);
  const [saving,    setSaving]    = useState(false);
  const [err,       setErr]       = useState("");
  const [toast,     setToast]     = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = async () => {
    setLoading(true);
    try {
      const [rRes, aRes] = await Promise.all([api.get("/admin/rules"), api.get("/admin/approvals")]);
      if (rRes.data?.success) setRules(rRes.data.data || []);
      if (aRes.data?.success) setApprovals(aRes.data.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const createRule = async () => {
    setSaving(true); setErr("");
    try {
      let condition;
      try { condition = JSON.parse(newForm.condition); } catch { setErr("Condition JSON is invalid."); setSaving(false); return; }
      await api.post("/admin/rules", { ...newForm, condition });
      setCreating(false);
      setNewForm(EMPTY_RULE);
      showToast("Rule created.");
      load();
    } catch (e) {
      setErr(e.response?.data?.error?.message || "Create failed.");
    } finally { setSaving(false); }
  };

  return (
    <AdminLayout title="Rules Engine" subtitle="Manage deterministic regulatory rules">
      {/* Toolbar */}
      <div className="mb-5 flex items-center gap-3">
        <button type="button" onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-xl bg-[#4f378a] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#6750a4]">
          <Plus size={16} /> New Rule
        </button>
        <button type="button" onClick={load}
          className="flex items-center gap-1.5 rounded-xl border border-[#cbc4d2] px-4 py-2.5 text-sm font-semibold text-[#4f378a] hover:bg-[#f8f2fa]">
          <RefreshCw size={15} /> Refresh
        </button>
        <span className="ml-auto text-sm text-[#7a7582]">{rules.length} rules total</span>
      </div>

      {/* New rule form */}
      {creating && (
        <div className="mb-5 rounded-xl border-2 border-[#4f378a] bg-white p-5 shadow-sm space-y-3">
          <p className="font-bold text-[#1d1b20]">New Regulatory Rule</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Rule ID *</label>
              <input className="input" placeholder="RULE-CTE-MH-01" value={newForm.ruleId}
                onChange={e => setNewForm(p => ({...p, ruleId: e.target.value}))} /></div>
            <div><label className="label">Approval *</label>
              <select className="input" value={newForm.approvalId}
                onChange={e => setNewForm(p => ({...p, approvalId: e.target.value}))}>
                <option value="">Select approval…</option>
                {approvals.map(a => <option key={a._id} value={a._id}>{a.approvalName}</option>)}
              </select></div>
            <div><label className="label">Priority</label>
              <input className="input" type="number" value={newForm.priority}
                onChange={e => setNewForm(p => ({...p, priority: +e.target.value}))} /></div>
            <div><label className="label">Version</label>
              <input className="input" value={newForm.version}
                onChange={e => setNewForm(p => ({...p, version: e.target.value}))} /></div>
            <div><label className="label">Effective Date</label>
              <input className="input" type="date" value={newForm.effectiveDate}
                onChange={e => setNewForm(p => ({...p, effectiveDate: e.target.value}))} /></div>
            <div><label className="label">Source</label>
              <input className="input" value={newForm.source}
                onChange={e => setNewForm(p => ({...p, source: e.target.value}))} /></div>
          </div>
          <div><label className="label">Explanation Template</label>
            <input className="input" placeholder="Required because your {sector} project in {state}…" value={newForm.explanationTemplate}
              onChange={e => setNewForm(p => ({...p, explanationTemplate: e.target.value}))} /></div>
          <div><label className="label">Condition (JSON)</label>
            <textarea className="input font-mono text-xs" rows={8} value={newForm.condition}
              onChange={e => setNewForm(p => ({...p, condition: e.target.value}))} /></div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={createRule} disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-[#4f378a] px-4 py-2 text-xs font-bold text-white hover:bg-[#6750a4] disabled:opacity-50">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Create Rule
            </button>
            <button type="button" onClick={() => { setCreating(false); setErr(""); }}
              className="rounded-lg border border-[#cbc4d2] px-4 py-2 text-xs font-semibold text-[#494551]">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="h-9 w-9 animate-spin rounded-full border-4 border-[#4f378a] border-t-transparent" /></div>
      ) : rules.length === 0 ? (
        <div className="rounded-xl border border-[#e6e0e9] bg-white p-12 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-[#cbc4d2]" />
          <p className="text-sm font-semibold text-[#494551]">No rules yet. Create the first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map(r => <RuleRow key={r._id} rule={r} approvals={approvals} onSaved={() => { showToast("Rule updated."); load(); }} />)}
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
