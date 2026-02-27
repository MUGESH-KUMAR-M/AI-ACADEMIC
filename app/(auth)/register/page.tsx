"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BrainCircuit,
  GraduationCap,
  Mail,
  KeyRound,
  User,
  Building2,
  BookMarked,
  UserCircle,
  Eye,
  EyeOff,
  Layers,
  Shield,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import * as api from "@/lib/api";
import toast from "react-hot-toast";

type Role = api.RegisterPayload["role"];

const ROLES: {
  value: Role;
  label: string;
  description: string;
  Icon: React.ElementType;
  gradient: string;
  border: string;
  active: string;
}[] = [
  {
    value: "faculty",
    label: "Faculty",
    description: "Create & manage courses",
    Icon: BookMarked,
    gradient: "from-violet-600/20 to-indigo-600/20",
    border: "border-violet-500/50",
    active: "text-violet-300",
  },
  {
    value: "student",
    label: "Student",
    description: "Browse course content",
    Icon: GraduationCap,
    gradient: "from-blue-600/20 to-cyan-600/20",
    border: "border-blue-500/50",
    active: "text-blue-300",
  },
  {
    value: "hod",
    label: "HoD",
    description: "Head of Department",
    Icon: Layers,
    gradient: "from-emerald-600/20 to-teal-600/20",
    border: "border-emerald-500/50",
    active: "text-emerald-300",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Platform administrator",
    Icon: Shield,
    gradient: "from-rose-600/20 to-pink-600/20",
    border: "border-rose-500/50",
    active: "text-rose-300",
  },
];

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Information Technology",
  "AI & Data Science",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Management Studies",
  "Other",
];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof api.RegisterPayload, string>>>({});
  const [form, setForm] = useState<api.RegisterPayload>({
    email: "",
    username: "",
    password: "",
    full_name: "",
    role: "faculty",
    institution_id: "",
    department: "",
  });

  function set<K extends keyof api.RegisterPayload>(k: K, v: api.RegisterPayload[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setFieldErrors((e) => ({ ...e, [k]: undefined }));
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof api.RegisterPayload, string>> = {};
    if (!form.full_name.trim()) errs.full_name = "Full name is required";
    if (!form.username.trim()) errs.username = "Username is required";
    else if (form.username.length < 3) errs.username = "At least 3 characters";
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) errs.username = "Letters, numbers or underscores only";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8) errs.password = "Minimum 8 characters";
    if (!form.institution_id.trim()) errs.institution_id = "Institution ID is required";
    if (!form.department) errs.department = "Please select a department";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.register(form);
      toast.success("Account created! Please sign in.");
      router.push("/login");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  // Password strength 0-4
  const pwStrength = !form.password ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 8 ? 2
    : form.password.length < 12 ? 3
    : 4;
  const pwColors = ["", "bg-red-500", "bg-orange-500", "bg-amber-400", "bg-emerald-500"];
  const pwLabels = ["", "Too short", "Weak", "Good", "Strong"];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-2xl shadow-violet-500/40 mb-3">
          <BrainCircuit className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
        <p className="text-slate-400 text-sm">Join the AI Academic platform</p>
      </div>

      {/* Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl shadow-black/30 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Role selector 2×2 ─────────────────────────── */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">I am a…</p>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(({ value, label, description, Icon, gradient, border, active }) => {
                const isActive = form.role === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set("role", value)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-br ${gradient} ${border}`
                        : "bg-white/4 border-white/8 hover:bg-white/8 hover:border-white/15"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? "bg-white/15" : "bg-white/5"}`}>
                      <Icon className={`w-4 h-4 ${isActive ? active : "text-slate-500"}`} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold leading-none ${isActive ? active : "text-slate-300"}`}>{label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Full Name + Username ──────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                icon={<UserCircle className="w-4 h-4" />}
              />
              {fieldErrors.full_name && <p className="text-[11px] text-red-400 mt-0.5">{fieldErrors.full_name}</p>}
            </div>
            <div>
              <Input
                label="Username"
                placeholder="johndoe"
                value={form.username}
                onChange={(e) => set("username", e.target.value.toLowerCase())}
                icon={<User className="w-4 h-4" />}
              />
              {fieldErrors.username && <p className="text-[11px] text-red-400 mt-0.5">{fieldErrors.username}</p>}
            </div>
          </div>

          {/* ── Email ───────────────────────────────────────── */}
          <div>
            <Input
              label="Email Address"
              type="email"
              placeholder="you@university.edu"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              icon={<Mail className="w-4 h-4" />}
            />
            {fieldErrors.email && <p className="text-[11px] text-red-400 mt-0.5">{fieldErrors.email}</p>}
          </div>

          {/* ── Password ──────────────────────────────────── */}
          <div>
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                icon={<KeyRound className="w-4 h-4" />}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-[30px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.password.length > 0 && (
              <div className="mt-1.5 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= pwStrength ? pwColors[pwStrength] : "bg-white/10"}`} />
                  ))}
                </div>
                <p className={`text-[10px] ${pwStrength >= 3 ? "text-emerald-400" : pwStrength === 2 ? "text-amber-400" : "text-red-400"}`}>
                  {pwLabels[pwStrength]}
                </p>
              </div>
            )}
            {fieldErrors.password && <p className="text-[11px] text-red-400 mt-0.5">{fieldErrors.password}</p>}
          </div>

          {/* ── Institution ID ────────────────────────────── */}
          <div>
            <Input
              label="Institution ID"
              placeholder="Provided by your administrator"
              value={form.institution_id}
              onChange={(e) => set("institution_id", e.target.value)}
              icon={<Building2 className="w-4 h-4" />}
            />
            {fieldErrors.institution_id
              ? <p className="text-[11px] text-red-400 mt-0.5">{fieldErrors.institution_id}</p>
              : <p className="text-[10px] text-slate-600 mt-0.5">Ask your admin for the correct institution code</p>
            }
          </div>

          {/* ── Department dropdown ──────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Department</label>
            <div className="relative">
              <BookMarked className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <select
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
                className="w-full appearance-none bg-slate-900/80 border border-white/12 rounded-xl pl-9 pr-8 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/60 transition-colors cursor-pointer"
              >
                <option value="" className="bg-slate-900">Select department…</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d} className="bg-slate-900">{d}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
            {fieldErrors.department && <p className="text-[11px] text-red-400 mt-0.5">{fieldErrors.department}</p>}
          </div>

          <Button type="submit" size="lg" loading={loading} className="w-full">
            Create Account
          </Button>
        </form>

        <div className="pt-4 border-t border-white/10 text-center">
          <p className="text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-slate-600 mt-5 flex items-center justify-center gap-1.5">
        <GraduationCap className="w-3.5 h-3.5" />
        AI Academic Operating System — Multi-Agent AI Platform
      </p>
    </div>
  );
}
