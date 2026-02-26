"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Building2,
  BookMarked,
  Shield,
  CheckCircle2,
  XCircle,
  KeyRound,
  Save,
  RefreshCw,
  Clock,
  Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import * as api from "@/lib/api";
import * as authLib from "@/lib/auth";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  // Change password form
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  // Refresh token
  const [refreshLoading, setRefreshLoading] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPwd || !newPwd || !confirmPwd) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPwd.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    const token = authLib.getAccessToken();
    if (!token) { toast.error("Not authenticated"); return; }
    setPwdLoading(true);
    try {
      const res = await api.changePassword(token, {
        current_password: currentPwd,
        new_password: newPwd,
      });
      toast.success(res.message);
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setPwdLoading(false);
    }
  }

  async function handleRefreshToken() {
    const rt = authLib.getRefreshToken();
    if (!rt) { toast.error("No refresh token found"); return; }
    setRefreshLoading(true);
    try {
      const res = await api.refreshTokens(rt);
      authLib.saveTokens(res.access_token, res.refresh_token);
      await refreshUser();
      toast.success("Session refreshed successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to refresh token");
    } finally {
      setRefreshLoading(false);
    }
  }

  if (!user) return null;

  const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account and security settings</p>
      </div>

      {/* Profile Card */}
      <Card glow>
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-violet-500/30 flex-shrink-0">
              {user.full_name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h2 className="text-xl font-bold text-white">{user.full_name}</h2>
                <Badge variant="purple" className="capitalize">{user.role}</Badge>
                {user.is_active ? (
                  <Badge variant="green">Active</Badge>
                ) : (
                  <Badge variant="red">Inactive</Badge>
                )}
                {user.is_verified ? (
                  <Badge variant="blue">Verified</Badge>
                ) : (
                  <Badge variant="yellow">Unverified</Badge>
                )}
              </div>
              <p className="text-slate-400 text-sm">{user.email}</p>
              <p className="text-slate-500 text-xs mt-1 flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Joined {joinDate}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
            {[
              { label: "User ID", value: user.id, icon: Shield },
              { label: "Username", value: user.username, icon: User },
              { label: "Institution", value: user.institution_id, icon: Building2 },
              { label: "Department", value: user.department, icon: BookMarked },
              { label: "Email", value: user.email, icon: Mail },
              { label: "Account Status", value: user.is_active ? "Active" : "Inactive", icon: CheckCircle2 },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">{item.label}</p>
                    <p className="text-sm font-medium text-white truncate mt-0.5">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 pb-4">
            <RefreshCw className="w-4 h-4 text-blue-400" />
            Session Management
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-slate-400 mb-4">
            Refresh your access token using your current refresh token. This extends your session
            without requiring you to log in again.
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={handleRefreshToken}
              loading={refreshLoading}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Session
            </Button>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Token active
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 pb-4">
            <Lock className="w-4 h-4 text-rose-400" />
            Change Password
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              icon={<KeyRound className="w-4 h-4" />}
            />
            <Input
              label="New Password"
              type="password"
              placeholder="Min. 8 characters"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              icon={<KeyRound className="w-4 h-4" />}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Repeat new password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              icon={<KeyRound className="w-4 h-4" />}
              error={
                confirmPwd && newPwd !== confirmPwd
                  ? "Passwords do not match"
                  : undefined
              }
            />

            {/* Password strength indicator */}
            {newPwd && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
                        newPwd.length >= i * 3
                          ? i === 1 ? "bg-red-500"
                            : i === 2 ? "bg-amber-500"
                            : i === 3 ? "bg-yellow-500"
                            : "bg-emerald-500"
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-slate-500">
                  {newPwd.length < 4 ? "Weak" : newPwd.length < 7 ? "Fair" : newPwd.length < 10 ? "Good" : "Strong"} password
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                loading={pwdLoading}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Update Password
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setCurrentPwd(""); setNewPwd(""); setConfirmPwd(""); }}
              >
                <XCircle className="w-4 h-4" />
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Verification Status */}
      {!user.is_verified && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <XCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-300">Email not verified</p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              Your account email is not verified. Some features may be restricted.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
