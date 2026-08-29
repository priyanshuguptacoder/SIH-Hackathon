import React from 'react';
import { LogOut, LayoutDashboard, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />

      <header className="border-b border-white/5 bg-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-lg text-white">Industrial Portal</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-zinc-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>{user?.name || 'User'}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-1.5 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full z-10 flex flex-col items-center justify-center">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-xl text-center space-y-4 backdrop-blur-xl">
          <h2 className="text-3xl font-extrabold text-white">Dashboard</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Welcome, <strong className="text-white">{user?.name}</strong> ({user?.email}). You are
            logged in as <strong className="text-white">{user?.role}</strong>.
          </p>
          <div className="pt-4 border-t border-white/5 text-xs text-zinc-500 flex flex-col items-center gap-1">
            <span>Authentication Type: Bearer JWT</span>
            <span>Password Status: Securely Hashed (bcrypt)</span>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-zinc-600 bg-black/40">
        &copy; 2026 Industrial Approval &amp; Compliance Management Platform
      </footer>
    </div>
  );
};

export default Dashboard;
