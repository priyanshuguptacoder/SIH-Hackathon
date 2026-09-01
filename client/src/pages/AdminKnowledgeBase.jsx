import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../api/api";
import { Database, Search, RefreshCw, FileText, Hash, ChevronDown, ChevronUp } from "lucide-react";

function ChunkRow({ chunk }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-[#e6e0e9] bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-[#fdf7ff]" onClick={() => setOpen(o => !o)}>
        <FileText size={15} className="shrink-0 text-[#4f378a]" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1d1b20] truncate">{chunk.documentTitle || "—"}</p>
          <div className="flex gap-3 mt-0.5 text-xs text-[#7a7582]">
            {chunk.section && <span>§ {chunk.section}</span>}
            {chunk.page    && <span>p.{chunk.page}</span>}
            {chunk.state   && <span>{chunk.state}</span>}
            {chunk.sector  && <span>{chunk.sector}</span>}
          </div>
        </div>
        <span className="shrink-0 text-xs text-[#7a7582]">{chunk.text?.length || 0} chars</span>
        {open ? <ChevronUp size={15} className="shrink-0 text-[#7a7582]" /> : <ChevronDown size={15} className="shrink-0 text-[#7a7582]" />}
      </div>
      {open && (
        <div className="border-t border-[#e6e0e9] bg-[#fdf7ff] px-5 py-4">
          <p className="text-xs text-[#494551] leading-relaxed whitespace-pre-wrap">{chunk.text}</p>
        </div>
      )}
    </div>
  );
}

export default function AdminKnowledgeBase() {
  const [chunks,  setChunks]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [empty,   setEmpty]   = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/knowledge-base");
      const data = res.data?.data || [];
      setChunks(data);
      setEmpty(data.length === 0);
    } catch { setEmpty(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const visible = chunks.filter(c =>
    !search ||
    (c.documentTitle || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.section || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.text || "").toLowerCase().includes(search.toLowerCase())
  );

  // Group by document title
  const grouped = visible.reduce((acc, c) => {
    const key = c.documentTitle || "Unknown Document";
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  return (
    <AdminLayout title="Knowledge Base" subtitle="Regulatory document chunks indexed for RAG">
      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7582]" />
          <input
            className="w-full rounded-xl border border-[#cbc4d2] bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#4f378a] focus:ring-2 focus:ring-[#cfbcff]"
            placeholder="Search chunks by title, section, or text…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button type="button" onClick={load}
          className="flex items-center gap-1.5 rounded-xl border border-[#cbc4d2] px-4 py-2.5 text-sm font-semibold text-[#4f378a] hover:bg-[#f8f2fa]">
          <RefreshCw size={15} /> Refresh
        </button>
        <span className="flex items-center text-sm text-[#7a7582]">{chunks.length} chunks indexed</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#4f378a] border-t-transparent" />
        </div>
      ) : empty || chunks.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-[#e6e0e9] bg-white py-24 text-center">
          <Database className="h-14 w-14 text-[#cbc4d2]" />
          <div>
            <p className="text-base font-bold text-[#1d1b20]">Knowledge base is empty</p>
            <p className="mt-1 text-sm text-[#7a7582] max-w-sm mx-auto">
              Upload regulation PDFs on the Regulations page and trigger ingestion to populate the RAG knowledge base.
            </p>
          </div>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-[#e6e0e9] bg-white p-10 text-center">
          <p className="text-sm font-semibold text-[#494551]">No chunks match your search.</p>
          <button type="button" onClick={() => setSearch("")} className="mt-2 text-sm font-semibold text-[#4f378a] hover:underline">Clear</button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([title, items]) => (
            <div key={title}>
              <div className="mb-2 flex items-center gap-2">
                <FileText size={15} className="text-[#4f378a]" />
                <p className="text-sm font-bold text-[#1d1b20]">{title}</p>
                <span className="ml-auto rounded-full bg-[#f0ebff] px-2 py-0.5 text-[10px] font-bold text-[#4f378a]">
                  {items.length} chunk{items.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-2">
                {items.map((c, i) => <ChunkRow key={c._id || i} chunk={c} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
