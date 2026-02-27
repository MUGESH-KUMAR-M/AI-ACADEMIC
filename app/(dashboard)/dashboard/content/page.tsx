"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Loader2,
  ArrowRight,
  GraduationCap,
  RefreshCw,
  Plus,
  Layers,
  CheckCircle2,
  XCircle,
  CircleDot,
  Sparkles,
  Zap,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import * as api from "@/lib/api";
import * as authLib from "@/lib/auth";
import toast from "react-hot-toast";

const statusMeta: Record<api.CourseStatus, {
  label: string;
  variant: "green" | "blue" | "yellow" | "red" | "purple";
  Icon: React.ElementType;
  barColor: string;
  tab: "generate" | "results";
}> = {
  completed: { label: "Completed", variant: "green", Icon: CheckCircle2, barColor: "from-emerald-500 to-teal-500", tab: "results" },
  generating: { label: "Generating", variant: "blue", Icon: RefreshCw, barColor: "from-blue-500 to-cyan-500", tab: "generate" },
  draft: { label: "Draft", variant: "yellow", Icon: CircleDot, barColor: "from-yellow-500 to-amber-500", tab: "generate" },
  failed: { label: "Failed", variant: "red", Icon: XCircle, barColor: "from-red-500 to-rose-500", tab: "generate" },
  published: { label: "Published", variant: "purple", Icon: Sparkles, barColor: "from-violet-500 to-indigo-500", tab: "results" },
};

export default function ContentGenPage() {
  const [courses, setCourses] = useState<api.Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<api.CourseStatus | "all">("all");

  const load = useCallback(async () => {
    const token = authLib.getAccessToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.listCourses(token, { page: 1, page_size: 200 });
      setCourses(res.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const counts: Record<api.CourseStatus, number> = {
    completed: 0, generating: 0, draft: 0, failed: 0, published: 0,
  };
  courses.forEach((c) => { counts[c.status]++; });

  const filtered = filter === "all" ? courses : courses.filter((c) => c.status === filter);

  const avgProgress = courses.filter(c => c.status === "generating").reduce((s, c) => s + c.generation_progress, 0);
  const generatingCount = counts.generating;
  const generatedCount = counts.completed + counts.published;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <FileText className="w-5 h-5 text-white" />
            </div>
            Content Generation
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            AI generation status across all courses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={load} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Link href="/dashboard/courses">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Course
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Courses", val: courses.length, Icon: Layers, color: "from-violet-600 to-indigo-600", shadow: "shadow-violet-500/20" },
          { label: "Generated", val: generatedCount, Icon: CheckCircle2, color: "from-emerald-600 to-teal-600", shadow: "shadow-emerald-500/20" },
          { label: "Currently Generating", val: generatingCount, Icon: Zap, color: "from-blue-600 to-cyan-600", shadow: "shadow-blue-500/20" },
          { label: "Avg Progress", val: generatingCount > 0 ? `${Math.round(avgProgress / generatingCount)}%` : "—", Icon: TrendingUp, color: "from-orange-600 to-amber-600", shadow: "shadow-orange-500/20" },
        ].map(({ label, val, Icon, color, shadow }) => (
          <Card key={label} glow>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-lg ${shadow}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-white leading-tight">{val}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filter === "all" ? "bg-white/15 border-white/30 text-white" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}
        >
          All ({courses.length})
        </button>
        {(Object.keys(statusMeta) as api.CourseStatus[]).map((s) => {
          const meta = statusMeta[s];
          const Icon = meta.Icon;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filter === s ? "bg-white/15 border-white/30 text-white" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}
            >
              <Icon className={`w-3 h-3 ${s === "generating" ? "animate-spin" : ""}`} />
              {meta.label} ({counts[s]})
            </button>
          );
        })}
      </div>

      {/* Courses */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <FileText className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-400 text-sm">No courses in this status</p>
          <Link href="/dashboard/courses">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create a Course
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((course) => {
            const meta = statusMeta[course.status];
            const Icon = meta.Icon;
            const isGenerating = course.status === "generating";

            return (
              <Card key={course.id} className="group hover:border-orange-500/20 transition-all duration-200">
                <CardContent className="p-5 space-y-4">
                  {/* Title + status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-white text-sm leading-snug truncate group-hover:text-orange-300 transition-colors">
                        {course.title}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{course.code}</p>
                    </div>
                    <Badge variant={meta.variant} className="flex-shrink-0 gap-1 text-[10px]">
                      <Icon className={`w-2.5 h-2.5 ${isGenerating ? "animate-spin" : ""}`} />
                      {meta.label}
                    </Badge>
                  </div>

                  {/* Program */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <GraduationCap className="w-3 h-3 flex-shrink-0" />
                    {course.program} · Sem {course.semester} · {course.credits} cr
                  </div>

                  {/* Generation progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Generation Progress</span>
                      <span className={`font-semibold ${isGenerating ? "text-blue-400 animate-pulse" : course.generation_progress === 100 ? "text-emerald-400" : "text-slate-400"}`}>
                        {course.generation_progress}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${meta.barColor} transition-all duration-500`}
                        style={{ width: `${course.generation_progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Timing info */}
                  {course.completed_at && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                      <Clock className="w-3 h-3" />
                      Completed {new Date(course.completed_at).toLocaleDateString()}
                    </div>
                  )}

                  {/* Action button */}
                  <Link
                    href={`/dashboard/courses/${course.id}?tab=${meta.tab}`}
                    className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border text-xs font-semibold transition-all group/btn
                      ${isGenerating
                        ? "bg-blue-600/15 border-blue-500/25 text-blue-300 hover:bg-blue-600/25"
                        : course.status === "draft" || course.status === "failed"
                        ? "bg-orange-600/15 border-orange-500/25 text-orange-300 hover:bg-orange-600/25"
                        : "bg-emerald-600/15 border-emerald-500/25 text-emerald-300 hover:bg-emerald-600/25"}`}
                  >
                    {isGenerating ? "Monitor Generation" : course.status === "draft" || course.status === "failed" ? "Start Generation" : "View Results"}
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
