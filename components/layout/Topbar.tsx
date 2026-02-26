"use client";

import { Bell, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/Badge";

export default function Topbar({ title }: { title?: string }) {
  const { user } = useAuth();

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-20">
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-lg font-semibold text-white">{title}</h1>
        )}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search courses, modules…"
            className="w-64 pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500" />
        </button>

        {user && (
          <div className="flex items-center gap-2.5 pl-3 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-white leading-none">
                {user.full_name}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">{user.email}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:ring-2 hover:ring-violet-500/50 transition-all">
              {user.full_name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
