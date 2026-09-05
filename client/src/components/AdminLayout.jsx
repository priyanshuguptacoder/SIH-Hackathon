import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Shield,
  LayoutDashboard,
  FileText,
  BookOpen,
  Landmark,
  Database,
  ClipboardList,
  LogOut,
  ChevronRight,
  ScrollText,
} from "lucide-react";

const NAV = [
  { label: "Dashboard",      path: "/admin/dashboard",     icon: LayoutDashboard },
  { label: "Applications",   path: "/admin/applications",  icon: ClipboardList   },
  { label: "Rules Engine",   path: "/admin/rules",         icon: BookOpen        },
  { label: "Schemes",        path: "/admin/schemes",       icon: Landmark        },
  { label: "Regulations",    path: "/admin/regulations",   icon: FileText        },
  { label: "Knowledge Base", path: "/admin/knowledge",     icon: Database        },
  { label: "Audit Log",      path: "/admin/audit",         icon: ScrollText      },
];

export default function AdminLayout({ children, title, subtitle }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#f5f3ff] flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-60 flex flex-col bg-[#1e1a2e] text-white z-40">
        {/* Brand */}
        <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5">
          <img src="/udyog-sanchar-icon.png" alt="UdyogSanchar" className="h-10 w-auto" />
          <div>
            <p className="text-sm font-bold leading-tight">UdyogSanchar</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wider">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV.map(({ label, path, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                type="button"
                onClick={() => navigate(path)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all text-left ${
                  active
                    ? "bg-[#4f378a] text-white shadow-sm"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={17} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-white/10 px-4 py-4">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4f378a] text-xs font-bold text-white">
              {(user?.name || "A")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">{user?.name || "Admin"}</p>
              <p className="truncate text-[10px] text-white/50">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { logout(); navigate("/login"); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-60 flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#e6e0e9] bg-white px-8 py-4">
          <div>
            <h1 className="text-lg font-bold text-[#1d1b20]">{title}</h1>
            {subtitle && <p className="text-xs text-[#7a7582]">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#f0ebff] px-3 py-1 text-xs font-bold text-[#4f378a]">
              Admin
            </span>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
