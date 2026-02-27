"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Loader2,
  ArrowRight,
  GraduationCap,
  Clock,
  Layers,
  RefreshCw,
  Plus,
  ClipboardList,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import * as api from "@/lib/api";
import * as authLib from "@/lib/auth";
import toast from "react-hot-toast";

// ── Inline semester plan viewer ───────────────────────────────────────────────
function SemesterDetailPanel({ plan }: { plan: api.ResultSemesterPlan }) {
  const ov = plan.semester_overview;
  const weeks = plan.weeks ?? [];
  const sched = plan.assessment_schedule ?? [];

  return (
    <div className="mt-4 space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Weeks", val: ov?.total_weeks ?? weeks.length, color: "text-blue-300" },
          { label: "Total Hours", val: ov?.total_hours ?? "—", color: "text-emerald-300" },
          { label: "Hours / Week", val: ov?.teaching_hours_per_week ?? "—", color: "text-violet-300" },
          { label: "Scheduled Assessments", val: sched.length, color: "text-orange-300" },
        ].map(({ label, val, color }) => (
          <div key={label} className="p-3 rounded-xl bg-white/5 border border-white/8 text-center">
            <p className={`text-lg font-bold ${color}`}>{val}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Assessment schedule */}
      {sched.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <ClipboardList className="w-3 h-3" /> Assessment Schedule
          </p>
          <div className="flex flex-wrap gap-2">
            {sched.map((a, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/8 border border-orange-500/20">
                <span className="text-[10px] font-bold text-orange-400">Wk {a.week}</span>
                <span className="text-[11px] text-slate-300 font-semibold capitalize">{a.type}</span>
                {a.topics_covered?.length > 0 && (
                  <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                    {a.topics_covered[0]}{a.topics_covered.length > 1 ? ` +${a.topics_covered.length - 1}` : ""}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weeks table */}
      {weeks.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Calendar className="w-3 h-3" /> Week-by-Week Plan
          </p>
          <div className="rounded-xl border border-white/8 overflow-hidden">
            {/* Header row — desktop only */}
            <div className="hidden sm:grid grid-cols-[48px_140px_1fr_90px_70px] gap-3 text-[10px] text-slate-500 font-semibold uppercase tracking-widest px-4 py-2 border-b border-white/8 bg-white/3">
              <span>Week</span>
              <span>Module</span>
              <span>Topics</span>
              <span>CLOs</span>
              <span>Exam</span>
            </div>
            <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
              {weeks.map((w) => (
                <div
                  key={w.week}
                  className="grid grid-cols-1 sm:grid-cols-[48px_140px_1fr_90px_70px] gap-x-3 gap-y-1 px-4 py-3 hover:bg-white/3 transition-colors"
                >
                  <div className="hidden sm:flex items-start pt-0.5">
                    <span className="text-sm font-bold text-blue-300">{w.week}</span>
                  </div>
                  <div className="hidden sm:flex items-start pt-0.5">
                    <p className="text-[11px] text-slate-400 leading-snug">{w.module}</p>
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    {/* Mobile inline label */}
                    <div className="flex items-center gap-1.5 sm:hidden mb-1">
                      <span className="text-xs font-bold text-blue-300">Wk {w.week}</span>
                      <span className="text-[10px] text-slate-500">{w.module}</span>
                    </div>
                    {w.topics.map((t, ti) => (
                      <p key={ti} className="text-[11px] text-slate-300 truncate leading-snug">{t}</p>
                    ))}
                    {w.activities.length > 0 && (
                      <p className="text-[10px] text-slate-500 italic">{w.activities.join(", ")}</p>
                    )}
                  </div>
                  <div className="hidden sm:flex flex-wrap gap-1 items-start pt-0.5">
                    {w.clos_addressed.map((clo, ci) => (
                      <span key={ci} className="text-[9px] font-mono px-1 py-0.5 rounded bg-violet-500/10 border border-violet-500/15 text-violet-300">{clo}</span>
                    ))}
                  </div>
                  <div className="hidden sm:flex items-start pt-0.5">
                    {w.assessment ? (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-orange-500/15 border border-orange-500/20 text-orange-300">
                        {w.assessment.type ?? "exam"}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SemesterPlanPage() {
  const [courses, setCourses] = useState<api.Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [planCache, setPlanCache] = useState<Record<string, api.ResultSemesterPlan>>({});
  const [planLoading, setPlanLoading] = useState<Record<string, boolean>>({});

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

  const toggleExpand = useCallback(async (courseId: string) => {
    if (expandedId === courseId) { setExpandedId(null); return; }
    setExpandedId(courseId);
    if (planCache[courseId]) return;

    const token = authLib.getAccessToken();
    if (!token) return;
    setPlanLoading((p) => ({ ...p, [courseId]: true }));
    try {
      const full = await api.getCourse(token, courseId);
      if (!full.semester_plan_data) throw new Error("No semester plan found for this course");
      setPlanCache((p) => ({ ...p, [courseId]: full.semester_plan_data! }));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load semester plan");
      setExpandedId(null);
    } finally {
      setPlanLoading((p) => ({ ...p, [courseId]: false }));
    }
  }, [expandedId, planCache]);

  const withPlan = courses.filter((c) => c.status === "completed" || c.status === "published");
  const pending  = courses.filter((c) => c.status !== "completed" && c.status !== "published");

  // Aggregate stats from already-loaded caches
  const cachedPlans = Object.values(planCache);
  const totalWeeks  = cachedPlans.reduce((s, p) => s + (p.semester_overview?.total_weeks ?? 0), 0);
  const totalHours  = cachedPlans.reduce((s, p) => s + (p.semester_overview?.total_hours ?? 0), 0);
  const totalSched  = cachedPlans.reduce((s, p) => s + (p.assessment_schedule?.length ?? 0), 0);

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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            Semester Plan
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Week-by-week teaching plans with assessment schedules
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
          { label: "Courses Ready",         val: withPlan.length,           Icon: Calendar,     color: "from-blue-600 to-cyan-600",     shadow: "shadow-blue-500/20"    },
          { label: "Weeks Loaded",          val: totalWeeks   || "—",        Icon: Layers,       color: "from-violet-600 to-indigo-600", shadow: "shadow-violet-500/20"  },
          { label: "Hours Loaded",          val: totalHours   || "—",        Icon: Clock,        color: "from-emerald-600 to-teal-600",  shadow: "shadow-emerald-500/20" },
          { label: "Assessments Scheduled", val: totalSched   || "—",        Icon: ClipboardList,color: "from-orange-600 to-amber-600",  shadow: "shadow-orange-500/20"  },
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

      {/* Accordion list */}
      {withPlan.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-slate-600" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold">No semester plans yet</p>
            <p className="text-slate-400 text-sm mt-1">Generate a course to create its semester plan</p>
          </div>
          <Link href="/dashboard/courses">
            <Button className="gap-2 mt-1">
              <Layers className="w-4 h-4" />
              Go to Courses
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {withPlan.map((course) => {
            const isExpanded    = expandedId === course.id;
            const isLoadingPlan = planLoading[course.id];
            const plan          = planCache[course.id];

            return (
              <Card
                key={course.id}
                className={`transition-all duration-200 ${isExpanded ? "border-blue-500/30" : "hover:border-white/15"}`}
              >
                <CardContent className="p-5">
                  {/* Course header row */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-blue-400" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-white text-sm truncate">{course.title}</p>
                        <Badge variant="blue" className="flex-shrink-0 text-[10px] gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Generated
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                        <span className="font-mono">{course.code}</span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          {course.program} · Sem {course.semester}
                        </span>
                        <span className="truncate">{course.department}</span>
                        {plan && (
                          <>
                            <span className="text-blue-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {plan.semester_overview?.total_weeks} wks · {plan.semester_overview?.total_hours}h
                            </span>
                            <span className="text-orange-400">
                              {plan.assessment_schedule?.length ?? 0} assessments
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/dashboard/courses/${course.id}?tab=results`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                      >
                        Full View
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      <button
                        onClick={() => toggleExpand(course.id)}
                        disabled={isLoadingPlan}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                          isExpanded
                            ? "bg-blue-600/20 border-blue-500/30 text-blue-300"
                            : "bg-blue-600/10 border-blue-500/25 text-blue-400 hover:bg-blue-600/20"
                        }`}
                      >
                        {isLoadingPlan
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : isExpanded
                          ? <ChevronUp className="w-3.5 h-3.5" />
                          : <ChevronDown className="w-3.5 h-3.5" />
                        }
                        {isExpanded ? "Collapse" : "View Plan"}
                      </button>
                    </div>
                  </div>

                  {/* Expandable semester plan */}
                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t border-white/8">
                      {isLoadingPlan ? (
                        <div className="flex items-center justify-center py-10">
                          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                          <span className="ml-2 text-sm text-slate-400">Loading semester plan…</span>
                        </div>
                      ) : plan ? (
                        <SemesterDetailPanel plan={plan} />
                      ) : null}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pending generation */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" />
            Pending Generation ({pending.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {pending.map((course) => (
              <Link
                key={course.id}
                href={`/dashboard/courses/${course.id}?tab=generate`}
                className="group flex items-center gap-3 p-4 rounded-xl bg-white/3 border border-white/8 hover:border-white/15 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-300 truncate group-hover:text-white transition-colors">{course.title}</p>
                  <p className="text-[10px] text-slate-600 font-mono">{course.code}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
