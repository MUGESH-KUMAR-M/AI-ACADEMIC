"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Layers,
  Calendar,
  FileText,
  ClipboardList,
  BarChart3,
  Award,
  User,
  LogOut,
  BrainCircuit,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/Badge";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Courses",
    href: "/dashboard/courses",
    icon: Layers,
  },
  {
    label: "Curriculum",
    href: "/dashboard/curriculum",
    icon: BookOpen,
  },
  {
    label: "Semester Plan",
    href: "/dashboard/semester",
    icon: Calendar,
  },
  {
    label: "Content Gen",
    href: "/dashboard/content",
    icon: FileText,
  },
  {
    label: "Assessment",
    href: "/dashboard/assessment",
    icon: ClipboardList,
  },
  {
    label: "OBE / CO-PO",
    href: "/dashboard/obe",
    icon: Award,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
];

const bottomItems = [
  { label: "Profile", href: "/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 flex flex-col bg-slate-950/95 border-r border-white/5 backdrop-blur-xl z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <BrainCircuit className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none">AI Academic</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Operating System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
          Main Menu
        </p>
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/20 text-violet-300 border border-violet-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  active ? "text-violet-400" : "group-hover:text-white"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/5 space-y-0.5">
        {/* User info */}
        {user && (
          <div className="flex items-center gap-3 px-3 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user.full_name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user.full_name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="purple" className="text-[9px] py-0">
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {bottomItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/20 text-violet-300"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}

        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
