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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import * as api from "@/lib/api";
import toast from "react-hot-toast";

const ROLES = ["faculty", "student", "admin"] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    full_name: "",
    role: "faculty" as api.RegisterPayload["role"],
    institution_id: "",
    department: "",
  });

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    for (const [k, v] of Object.entries(form)) {
      if (!v) {
        toast.error(`Please fill in: ${k.replace("_", " ")}`);
        return;
      }
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
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

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-2xl shadow-violet-500/40 mb-4">
          <BrainCircuit className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
        <p className="text-slate-400 text-sm">
          Join the AI Academic platform
        </p>
      </div>

      {/* Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-black/30">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              icon={<UserCircle className="w-4 h-4" />}
            />
            <Input
              label="Username"
              placeholder="johndoe"
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              icon={<User className="w-4 h-4" />}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            icon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            icon={<KeyRound className="w-4 h-4" />}
          />

          {/* Role select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Role</label>
            <div className="flex gap-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => set("role", r)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all duration-200 capitalize ${
                    form.role === r
                      ? "bg-gradient-to-r from-violet-600/30 to-indigo-600/30 border-violet-500/50 text-violet-300"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Institution ID"
            placeholder="e.g. MIT-SKI"
            value={form.institution_id}
            onChange={(e) => set("institution_id", e.target.value)}
            icon={<Building2 className="w-4 h-4" />}
          />

          <Input
            label="Department"
            placeholder="e.g. Computer Science"
            value={form.department}
            onChange={(e) => set("department", e.target.value)}
            icon={<BookMarked className="w-4 h-4" />}
          />

          <Button
            type="submit"
            size="lg"
            loading={loading}
            className="w-full mt-2"
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-slate-600 mt-6 flex items-center justify-center gap-1.5">
        <GraduationCap className="w-3.5 h-3.5" />
        AI Academic Operating System — Multi-Agent AI Platform
      </p>
    </div>
  );
}
