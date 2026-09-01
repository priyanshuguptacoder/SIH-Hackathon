import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardCheck,
  BarChart3,
  FileText,
  Landmark,
  Settings,
  HelpCircle,
  Search,
  Bell,
  CircleUserRound,
  Plus,
  FileText as Description,
  Building2,
  ShieldCheck,
  Clock3,
  AlertTriangle,
  ArrowUp,
  Bot,
  IndianRupee,
  Handshake,
  LogOut,
  ExternalLink,
  X,
  MessageSquare,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../api/api";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ── panel / section state ──────────────────────────────────────────────────
  const [activeSection, setActiveSection]   = useState("Dashboard");
  const [showAllApps, setShowAllApps]       = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile]       = useState(false);
  const [showAIChat, setShowAIChat]         = useState(false);
  const [aiInput, setAiInput]               = useState("");
  const notifRef  = useRef(null);
  const profileRef = useRef(null);

  // ── state ──────────────────────────────────────────────────────────────────
  const [industry, setIndustry]           = useState(null);
  const [applications, setApplications]   = useState([]);
  const [compliance, setCompliance]       = useState([]);
  const [schemes, setSchemes]             = useState([]);
  const [loading, setLoading]             = useState(true);

  // ── close panels on outside click ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))   setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);



  // ── fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [indRes, appRes, compRes] = await Promise.allSettled([
          api.get("/industries/me"),
          api.get("/applications"),
          api.get("/compliance"),
        ]);

        if (indRes.status === "fulfilled") {
          const ind = indRes.value.data.data;
          setIndustry(ind);
          if (ind?._id) {
            try {
              const schRes = await api.get(`/schemes/matched/${ind._id}`);
              setSchemes(schRes.data.data || []);
            } catch {
              setSchemes([]);
            }
          } else {
            setSchemes([]);
          }
        } else {
          setIndustry(null);
          setSchemes([]);
        }

        if (appRes.status === "fulfilled") {
          setApplications(appRes.value.data.data || []);
        } else {
          setApplications([]);
        }

        if (compRes.status === "fulfilled") {
          setCompliance(compRes.value.data.data || []);
        } else {
          setCompliance([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ── derived metrics ────────────────────────────────────────────────────────
  const activeCount  = applications.filter(a =>
    !["APPROVED", "REJECTED"].includes(a.status)
  ).length;

  const pendingCount = applications.filter(a =>
    ["SUBMITTED", "UNDER_REVIEW", "INSPECTION"].includes(a.status)
  ).length;

  // Compliance score: completed / total * 100
  const totalCompliance     = compliance.length;
  const completedCompliance = compliance.filter(c => c.status === "COMPLETED").length;
  const complianceScore     = totalCompliance > 0
    ? Math.round((completedCompliance / totalCompliance) * 100)
    : 0;

  // Upcoming deadlines — UPCOMING status, sorted by dueDate, top 3
  const upcomingDeadlines = [...compliance]
    .filter(c => c.status === "UPCOMING")
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  // Recent applications — latest 4
  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 4);

  // ── helpers ────────────────────────────────────────────────────────────────
  const mapStatus = (status) => {
    const map = {
      APPROVED:           { label: "Approved",       type: "approved" },
      REJECTED:           { label: "Rejected",       type: "error"    },
      SUBMITTED:          { label: "Submitted",      type: "progress" },
      UNDER_REVIEW:       { label: "Under Review",   type: "progress" },
      INSPECTION:         { label: "Inspection",     type: "progress" },
      DOCUMENTS_PREPARED: { label: "Docs Prepared",  type: "progress" },
      NOT_STARTED:        { label: "Not Started",    type: "gray"     },
    };
    return map[status] || { label: status, type: "gray" };
  };

  const daysUntil = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const deadlineColor = (days) => {
    if (days <= 7)  return "red";
    if (days <= 21) return "orange";
    return "gray";
  };

  const formatDeadlineDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short"
    });
  };

  const formatAppDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  // ── nav ────────────────────────────────────────────────────────────────────
  const navItems = [
    { label: "Dashboard",          icon: LayoutDashboard, section: "Dashboard"  },
    { label: "My Approvals",       icon: ClipboardCheck,  section: "Approvals"  },
    { label: "Compliance Tracker", icon: BarChart3,       section: "Compliance" },
    { label: "Documents",          icon: FileText,        section: "Documents"  },
    { label: "Schemes",            icon: Landmark,        section: "Schemes"    },
    { label: "Industry Hub",       icon: Building2,       section: "Hub"        },
    { label: "Settings",           icon: Settings,        section: "Settings"   },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf7ff] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-[#4f378a] border-[#4f378a]/20 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf7ff] text-[#1d1b20] flex antialiased">

      {/* ================= SIDEBAR ================= */}
      <aside className="fixed left-0 top-0 h-full z-50 hidden md:flex w-64 flex-col pt-4 pb-8 px-4 bg-white border-r border-[#cbc4d2] text-[#4f378a]">

        <div className="mb-8 px-2 flex flex-col gap-2">
          <span className="text-[30px] leading-9 font-black text-[#4f378a]">
            Industrial Compliance
          </span>
          <span className="text-xs leading-4 tracking-[0.05em] font-semibold text-[#494551]">
            SIH-2026
          </span>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.section;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  // Documents and Applications have their own pages
                  if (item.section === "Documents") {
                    navigate("/documents");
                    return;
                  }
                  if (item.section === "Approvals") {
                    navigate("/applications");
                    return;
                  }
                  if (item.section === "Compliance") {
                    navigate("/compliance");
                    return;
                  }
                  if (item.section === "Schemes") {
                    navigate("/hub?tab=schemes");
                    return;
                  }
                  if (item.section === "Hub") {
                    navigate("/hub");
                    return;
                  }
                  setActiveSection(item.section);
                  // scroll to anchor if it exists on page
                  const el = document.getElementById(`section-${item.section}`);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
                  isActive
                    ? "bg-[#e1d4fd] text-[#4b4263] font-semibold scale-[0.98]"
                    : "text-[#494551] hover:bg-[#ece6ee]"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-[#cbc4d2]">
          <a
            href="mailto:support@bharatcompliance.gov.in"
            className="flex items-center gap-3 px-3 py-2 text-[#494551] hover:bg-[#ece6ee] rounded-lg transition-all text-left"
          >
            <HelpCircle size={20} />
            <span className="text-sm">Support</span>
          </a>

          <div className="flex items-center gap-3 px-3 mt-4">
            <div className="w-8 h-8 rounded-full bg-[#e6e0e9] flex items-center justify-center border border-[#cbc4d2]">
              <Building2 size={16} className="text-[#4f378a]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{user?.name || "Industry User"}</p>
              <p className="text-[10px] text-[#7a7582]">Industry User</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">

        {/* ================= TOP NAV ================= */}
        <header className="fixed top-0 left-0 md:left-64 right-0 z-40 h-16 bg-white border-b border-[#cbc4d2] shadow-sm flex items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="md:hidden text-lg font-bold text-[#1d1b20]">Industrial Compliance</h2>
            <div className="hidden md:flex flex-1 max-w-md relative">
              <Search size={19} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#494551]" />
              <input
                type="text"
                placeholder="Search approvals, documents..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#cbc4d2] rounded-full text-sm text-[#1d1b20] focus:outline-none focus:ring-2 focus:ring-[#4f378a] focus:border-[#4f378a]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Bell — notifications panel */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                aria-label="Toggle notifications"
                aria-expanded={showNotifications}
                onClick={() => { setShowNotifications(v => !v); setShowProfile(false); }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#494551] hover:bg-[#f2ecf4] transition-colors"
              >
                <Bell size={20} />
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-[#cbc4d2] rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#cbc4d2] flex items-center justify-between">
                    <span className="font-semibold text-[#1d1b20]">Notifications</span>
                    <button onClick={() => setShowNotifications(false)}><X size={16} className="text-[#7a7582]" /></button>
                  </div>
                  {compliance.filter(c => c.status === "UPCOMING").length === 0 ? (
                    <div className="px-4 py-6 text-sm text-[#7a7582] text-center">No new notifications</div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto divide-y divide-[#cbc4d2]">
                      {compliance.filter(c => c.status === "UPCOMING").slice(0, 5).map(item => (
                        <div key={item._id} className="px-4 py-3">
                          <p className="text-sm font-semibold text-[#1d1b20]">{item.requirementText}</p>
                          <p className="text-xs text-[#ba1a1a] mt-0.5">
                            Due {new Date(item.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile panel */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => { setShowProfile(v => !v); setShowNotifications(false); }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#494551] hover:bg-[#f2ecf4] transition-colors"
              >
                <CircleUserRound size={22} />
              </button>
              {showProfile && (
                <div className="absolute right-0 top-12 w-64 bg-white border border-[#cbc4d2] rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-4 border-b border-[#cbc4d2]">
                    <p className="font-semibold text-[#1d1b20]">{user?.name}</p>
                    <p className="text-xs text-[#7a7582]">{user?.email}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-[#e1d4fd] text-[#4b4263] text-xs font-semibold rounded-full">
                      {user?.role}
                    </span>
                  </div>
                  {industry && (
                    <div className="px-4 py-3 border-b border-[#cbc4d2] text-sm text-[#494551]">
                      <p className="font-semibold text-[#1d1b20]">{industry.companyName}</p>
                      <p>{industry.sector} • {industry.state}</p>
                    </div>
                  )}
                  <div className="px-4 py-3">
                    <button
                      onClick={() => { setShowProfile(false); logout(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[#ba1a1a] hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Add New Project → wizard */}
            <button
              type="button"
              onClick={() => navigate("/wizard")}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#4f378a] text-white rounded-full text-xs font-semibold tracking-wide hover:bg-[#6750a4] transition-colors"
            >
              <Plus size={18} />
              Add New Project
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={logout}
              className="hidden md:flex items-center gap-2 px-4 py-2 border border-[#cbc4d2] text-[#4f378a] bg-white rounded-full text-xs font-semibold tracking-wide hover:bg-[#f2ecf4] transition-colors"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </header>

        {/* ================= DASHBOARD CONTENT ================= */}
        <main className="flex-1 mt-16 p-4 md:p-6 max-w-[1440px] mx-auto w-full flex flex-col gap-6 pb-24">

          {/* ================= HEADER ================= */}
          <div id="section-Dashboard" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4">
            <div>
              <h1 className="text-[30px] md:text-[40px] leading-tight font-bold tracking-tight text-[#1d1b20] mb-1">
                Welcome back, {user?.name || "Industrialist"}
              </h1>
              <p className="text-lg text-[#494551]">
                {industry
                  ? `${industry.companyName} • ${industry.state}`
                  : "Complete your industry profile to get started"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/wizard")}
              className="flex items-center gap-2 px-6 py-3 bg-[#4f378a] text-white rounded-lg text-base font-semibold hover:bg-[#6750a4] transition-colors shadow-sm w-full md:w-auto justify-center"
            >
              <Description size={20} />
              Apply for New Approval
            </button>
          </div>

          {/* ================= METRICS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Active Projects */}
            <div className="bg-white border border-[#cbc4d2] rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <span className="text-xs tracking-[0.05em] font-semibold text-[#494551] uppercase">Active Projects</span>
                <div className="w-10 h-10 rounded-full bg-[#e1d4fd] text-[#4b4263] flex items-center justify-center">
                  <Building2 size={20} />
                </div>
              </div>
              <div>
                <span className="text-[40px] leading-12 font-bold block">
                  {String(activeCount).padStart(2, "0")}
                </span>
                <span className="text-sm text-[#494551] mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  {activeCount === 0 ? "No active applications" : "All progressing normally"}
                </span>
              </div>
            </div>

            {/* Compliance Score */}
            <div className="bg-white border border-[#cbc4d2] rounded-xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                <span className="text-xs tracking-[0.05em] font-semibold text-[#494551] uppercase">Overall Compliance Score</span>
                <div className="w-10 h-10 rounded-full bg-[#cfbcff] text-[#22005d] flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
              </div>
              <div className="relative z-10 flex items-baseline gap-2">
                <span className="text-[40px] leading-12 font-bold text-[#4f378a]">
                  {totalCompliance === 0 ? "—" : `${complianceScore}%`}
                </span>
                {totalCompliance > 0 && (
                  <span className="text-sm text-[#10b981] font-semibold flex items-center">
                    <ArrowUp size={16} />
                    {completedCompliance}/{totalCompliance} done
                  </span>
                )}
              </div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full border-4 border-[#e9ddff] opacity-40" />
            </div>

            {/* Pending Approvals */}
            <div className="bg-white border border-[#cbc4d2] rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <span className="text-xs tracking-[0.05em] font-semibold text-[#494551] uppercase">Approvals Pending</span>
                <div className="w-10 h-10 rounded-full bg-[#ffdad6] text-[#93000a] flex items-center justify-center">
                  <Clock3 size={20} />
                </div>
              </div>
              <div>
                <span className="text-[40px] leading-12 font-bold text-[#ba1a1a] block">
                  {String(pendingCount).padStart(2, "0")}
                </span>
                <span className="text-sm text-[#ba1a1a] mt-1 font-medium flex items-center gap-1">
                  <AlertTriangle size={16} />
                  {pendingCount === 0 ? "No pending approvals" : `${pendingCount} awaiting authority review`}
                </span>
              </div>
            </div>

          </div>

          {/* ================= MAIN GRID ================= */}
          <div id="section-Approvals" className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Approval Progress Circle */}
            <div className="bg-white border border-[#cbc4d2] rounded-xl shadow-sm lg:col-span-1 flex flex-col">
              <div className="p-6 border-b border-[#cbc4d2]">
                <h2 className="text-2xl font-semibold text-[#1d1b20]">Approval Progress</h2>
                <p className="text-sm text-[#494551]">Across all applications</p>
              </div>
              <div className="p-6 flex-1 flex flex-col items-center justify-center gap-6">

                {/* Progress Circle */}
                {(() => {
                  const total    = applications.length;
                  const approved = applications.filter(a => a.status === "APPROVED").length;
                  const pct      = total === 0 ? 0 : Math.round((approved / total) * 100);

                  // SVG circle math
                  const radius      = 54;
                  const stroke      = 14;
                  const cx          = 96;
                  const cy          = 96;
                  const circumference = 2 * Math.PI * radius;
                  const offset      = circumference - (pct / 100) * circumference;

                  return (
                    <div className="relative w-48 h-48 flex items-center justify-center">
                      <svg width="192" height="192" className="-rotate-90">
                        {/* Track */}
                        <circle
                          cx={cx} cy={cy} r={radius}
                          fill="none"
                          stroke="#ece6ee"
                          strokeWidth={stroke}
                        />
                        {/* Fill — green when high, purple when mid, red when low */}
                        <circle
                          cx={cx} cy={cy} r={radius}
                          fill="none"
                          stroke={pct >= 70 ? "#10b981" : pct >= 40 ? "#4f378a" : "#ba1a1a"}
                          strokeWidth={stroke}
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                          style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.4s ease" }}
                        />
                      </svg>
                      {/* Centre label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[30px] font-semibold leading-none">
                          {total === 0 ? "—" : `${pct}%`}
                        </span>
                        <span className="text-xs tracking-[0.05em] font-semibold text-[#494551] mt-1">
                          CLEARED
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Status breakdown */}
                <div className="w-full flex flex-col gap-3 mt-4">
                  <ProgressItem dot="green" label="Approved" value={applications.filter(a => a.status === "APPROVED").length} />
                  <ProgressItem dot="purple" label="In Progress" value={applications.filter(a => ["SUBMITTED","UNDER_REVIEW","INSPECTION","DOCUMENTS_PREPARED"].includes(a.status)).length} />
                  <ProgressItem dot="gray" label="Not Started" value={applications.filter(a => a.status === "NOT_STARTED").length} />
                </div>

              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white border border-[#cbc4d2] rounded-xl shadow-sm lg:col-span-2 flex flex-col overflow-hidden">
              <div className="p-6 border-b border-[#cbc4d2] flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-semibold text-[#1d1b20]">Recent Applications</h2>
                  <p className="text-sm text-[#494551]">Track your submitted requests</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAllApps(v => !v)}
                  className="text-[#4f378a] text-xs font-semibold tracking-wide hover:underline"
                >
                  {showAllApps ? "Show Less" : "View All"}
                </button>
              </div>

              <div className="overflow-x-auto">
                {recentApplications.length === 0 ? (
                  <div className="p-10 text-center text-[#7a7582] text-sm">
                    No applications yet. Apply for an approval to get started.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#4f378a] text-white text-xs tracking-wide uppercase">
                        <th className="py-3 px-6 whitespace-nowrap">App ID</th>
                        <th className="py-3 px-6 whitespace-nowrap">Authority</th>
                        <th className="py-3 px-6 whitespace-nowrap">Type</th>
                        <th className="py-3 px-6 whitespace-nowrap">Status</th>
                        <th className="py-3 px-6 whitespace-nowrap">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {(showAllApps ? [...applications].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)) : recentApplications).map((app) => {
                        const { label, type } = mapStatus(app.status);
                        return (
                          <ApplicationRow
                            key={app._id}
                            application={{
                              id: `#${app._id.slice(-8).toUpperCase()}`,
                              department: app.approvalId?.authority || "—",
                              type: app.approvalId?.approvalName || "—",
                              status: label,
                              statusType: type,
                              date: formatAppDate(app.updatedAt),
                            }}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </div>

          {/* ================= SECONDARY GRID ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Upcoming Deadlines */}
            <div id="section-Compliance" className="bg-white border border-[#cbc4d2] rounded-xl shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#cbc4d2] pb-4">
                <h2 className="text-2xl font-semibold text-[#1d1b20]">Upcoming Deadlines</h2>
                <button
                  type="button"
                  onClick={() => navigate("/compliance")}
                  className="text-xs font-semibold text-[#4f378a] hover:underline"
                >
                  View All →
                </button>
              </div>

              {upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-[#7a7582] py-4 text-center">No upcoming compliance deadlines.</p>
              ) : (
                <div className="relative pl-6 flex flex-col gap-6 mt-2">
                  <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-[#cbc4d2]" />
                  {upcomingDeadlines.map((item) => {
                    const days = daysUntil(item.dueDate);
                    const color = deadlineColor(days);
                    const absDays = Math.abs(days);
                    const dueText = days < 0
                       ? `Overdue by ${absDays} Day${absDays !== 1 ? "s" : ""} (${formatDeadlineDate(item.dueDate)})`
                       : `Due in ${days} Day${days !== 1 ? "s" : ""} (${formatDeadlineDate(item.dueDate)})`;
                    return (
                      <Deadline
                        key={item._id}
                        color={color}
                        title={item.requirementText}
                        due={dueText}
                        description={item.source || item.approvalId?.approvalName || ""}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Matched Schemes */}
            <div id="section-Schemes" className="bg-white border border-[#cbc4d2] rounded-xl shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#cbc4d2] pb-4">
                <h2 className="text-2xl font-semibold text-[#1d1b20]">Potential Schemes for You</h2>
                <button
                  type="button"
                  onClick={() => navigate("/hub?tab=schemes")}
                  className="text-xs font-semibold text-[#4f378a] hover:underline"
                >
                  View All →
                </button>
              </div>

              {schemes.length === 0 ? (
                <p className="text-sm text-[#7a7582] py-4 text-center">
                  {industry ? "No matching schemes found for your profile." : "Complete your industry profile to see matched schemes."}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  {schemes.slice(0, 4).map((scheme, i) => (
                    <SchemeCard
                      key={scheme.id}
                      icon={i % 2 === 0 ? <IndianRupee size={18} /> : <Handshake size={18} />}
                      title={scheme.schemeName}
                      description={scheme.description}
                      url={scheme.officialUrl}
                      secondary={i % 2 !== 0}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>

        </main>
      </div>

      {/* ================= AI ASSISTANT ================= */}
      <button
        type="button"
        onClick={() => setShowAIChat(v => !v)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#6750a4] text-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      >
        <Bot size={24} />
        <span className="text-xs tracking-wide font-bold hidden sm:inline">AI Assistant</span>
      </button>

      {/* AI Chat Panel */}
      {showAIChat && (
        <div className="fixed bottom-20 right-6 z-50 w-80 bg-white border border-[#cbc4d2] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-[#4f378a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-white" />
              <span className="text-white font-semibold text-sm">AI Assistant</span>
            </div>
            <button onClick={() => setShowAIChat(false)}><X size={16} className="text-white/70 hover:text-white" /></button>
          </div>
          <div className="px-4 py-6 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-[#e1d4fd] flex items-center justify-center">
              <Bot size={24} className="text-[#4f378a]" />
            </div>
            <p className="text-sm font-semibold text-[#1d1b20]">AI Assistant</p>
            <p className="text-xs text-[#7a7582]">Ask me about regulatory compliance, approvals, and required documents for your industry.</p>
          </div>
          <div className="px-4 pb-4 flex gap-2">
            <input
              type="text"
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && aiInput.trim()) { window.open(`mailto:support@bharatcompliance.gov.in?subject=AI Query&body=${encodeURIComponent(aiInput)}`); setAiInput(""); }}}
              placeholder="Ask a compliance question..."
              className="flex-1 text-sm px-3 py-2 border border-[#cbc4d2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f378a]"
            />
            <button
              onClick={() => { if (aiInput.trim()) { window.open(`mailto:support@bharatcompliance.gov.in?subject=AI Query&body=${encodeURIComponent(aiInput)}`); setAiInput(""); }}}
              className="px-3 py-2 bg-[#4f378a] text-white rounded-lg hover:bg-[#6750a4] transition-colors"
            >
              <MessageSquare size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};


/* ─── sub-components (unchanged visual style) ────────────────────────────── */

const ProgressItem = ({ dot, label, value }) => {
  const dotClasses = {
    green:  "bg-[#10b981]",
    purple: "bg-[#4f378a]",
    gray:   "bg-[#e6e0e9]",
  };
  return (
    <div className="flex justify-between items-center text-sm">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${dotClasses[dot]}`} />
        <span>{label}</span>
      </div>
      <span className="font-mono font-bold">{value}</span>
    </div>
  );
};

const ApplicationRow = ({ application }) => {
  const statusStyles = {
    approved: { bg: "bg-[#10b981]/10", text: "text-[#10b981]", dot: "bg-[#10b981]" },
    progress: { bg: "bg-[#f59e0b]/10", text: "text-[#f59e0b]", dot: "bg-[#f59e0b]" },
    error:    { bg: "bg-[#ba1a1a]/10", text: "text-[#ba1a1a]", dot: "bg-[#ba1a1a]" },
    gray:     { bg: "bg-[#7a7582]/10", text: "text-[#7a7582]", dot: "bg-[#7a7582]" },
  };
  const style = statusStyles[application.statusType] || statusStyles.gray;
  return (
    <tr className="border-b border-[#cbc4d2] hover:bg-[#f8fafc] transition-colors h-12">
      <td className="py-3 px-6 font-mono font-semibold">{application.id}</td>
      <td className="py-3 px-6 text-[#494551]">{application.department}</td>
      <td className="py-3 px-6">{application.type}</td>
      <td className="py-3 px-6">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          {application.status}
        </span>
      </td>
      <td className={`py-3 px-6 ${application.statusType === "error" ? "text-[#ba1a1a] font-medium" : "text-[#494551]"}`}>
        {application.date}
      </td>
    </tr>
  );
};

const Deadline = ({ color, title, due, description }) => {
  const colors = {
    red:    { dot: "bg-[#ba1a1a]", text: "text-[#ba1a1a]" },
    orange: { dot: "bg-[#f59e0b]", text: "text-[#f59e0b]" },
    gray:   { dot: "bg-[#7a7582]", text: "text-[#494551]"  },
  };
  const style = colors[color];
  return (
    <div className="relative">
      <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full ${style.dot} border-[3px] border-white`} />
      <div className="flex flex-col gap-1">
        <span className={`text-xs tracking-wide font-bold ${style.text}`}>{due}</span>
        <span className="text-base font-semibold">{title}</span>
        {description && <span className="text-sm text-[#494551]">{description}</span>}
      </div>
    </div>
  );
};

const SchemeCard = ({ icon, title, description, url, secondary = false }) => (
  <div className="border border-[#cbc4d2] rounded-lg p-4 bg-[#fdf7ff] flex flex-col h-full hover:shadow-md transition-shadow">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${secondary ? "bg-[#e1d4fd] text-[#4b4263]" : "bg-[#6750a4] text-white"}`}>
      {icon}
    </div>
    <h3 className="text-base font-semibold text-[#1d1b20] mb-2">{title}</h3>
    <p className="text-sm text-[#494551] mb-4 flex-1">{description}</p>
    <a
      href={url || undefined}
      target="_blank"
      rel="noopener noreferrer"
      aria-disabled={!url}
      onClick={(e) => { if (!url) e.preventDefault(); }}
      className={`w-full py-2 bg-transparent border border-[#4f378a] text-[#4f378a] rounded-md text-xs font-semibold tracking-wide hover:bg-[#f2ecf4] transition-colors flex items-center justify-center gap-1 ${url ? "" : "opacity-60 cursor-not-allowed"}`}
    >
      View Details
      {url && <ExternalLink size={12} />}
    </a>
  </div>
);

export default Dashboard;
