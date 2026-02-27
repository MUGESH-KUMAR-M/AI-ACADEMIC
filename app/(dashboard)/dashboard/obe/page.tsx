"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  Loader2,
  ArrowRight,
  GraduationCap,
  RefreshCw,
  Plus,
  Layers,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  Target,
  Grid3X3,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ObeReportViewer } from "@/components/courses/ObeReportViewer";
import * as api from "@/lib/api";
import * as authLib from "@/lib/auth";
import toast from "react-hot-toast";

export default function ObePage() {
  const [courses, setCourses] = useState<api.Course[]>([]);
  const [loading, setLoading] = useState(true);
  // Per-course OBE report cache and expand state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [obeReports, setObeReports] = useState<Record<string, api.ObeReport>>({});
  const [obeLoading, setObeLoading] = useState<Record<string, boolean>>({});

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

  async function toggleExpand(courseId: string) {
    if (expandedId === courseId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(courseId);
    if (obeReports[courseId]) return; // already cached

    const token = authLib.getAccessToken();
    if (!token) return;
    setObeLoading((p) => ({ ...p, [courseId]: true }));
    try {
      const res = await api.getObeReport(token, courseId);
      setObeReports((p) => ({ ...p, [courseId]: res.obe_report }));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch OBE report");
      setExpandedId(null);
    } finally {
      setObeLoading((p) => ({ ...p, [courseId]: false }));
    }
  }

  async function handleExportObe(courseId: string) {
    const token = authLib.getAccessToken();
    if (!token) return;
    try {
      const { blob, filename } = await api.exportObeReport(token, courseId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    }
  }

  const withObe = courses.filter((c) => c.status === "completed" || c.status === "published");
  const pending = courses.filter((c) => c.status !== "completed" && c.status !== "published");

  // Aggregate quick stats from cached reports
  const cachedCount = Object.values(obeReports).filter((r) => r.course_outcomes?.length).length;
  const totalCOs = Object.values(obeReports).reduce((s, r) => s + (r.course_outcomes?.length ?? 0), 0);
  const totalPOs = Object.values(obeReports).reduce((s, r) => s + (r.program_outcomes?.length ?? 0), 0);

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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/25">
              <Award className="w-5 h-5 text-white" />
            </div>
            OBE / CO-PO
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Outcome-based education — CO-PO mapping, NBA/NAAC attainment reports
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
          { label: "Generated Courses", val: withObe.length, Icon: Award,     color: "from-rose-600 to-pink-600",     shadow: "shadow-rose-500/20" },
          { label: "Total COs (fetched)", val: totalCOs || "—", Icon: Target,   color: "from-violet-600 to-indigo-600", shadow: "shadow-violet-500/20" },
          { label: "Total POs (fetched)", val: totalPOs || "—", Icon: Grid3X3,  color: "from-blue-600 to-cyan-600",     shadow: "shadow-blue-500/20" },
          { label: "Coverage",           val: courses.length > 0 ? `${Math.round(withObe.length / courses.length * 100)}%` : "—", Icon: BarChart3, color: "from-emerald-600 to-teal-600", shadow: "shadow-emerald-500/20" },
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

      {/* Info box */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-rose-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">NBA / NAAC Outcome-Based Education</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                OBE reports map Course Outcomes (COs) to Program Outcomes (POs) and PSOs,
                generating CO-PO attainment matrices required for NBA accreditation. Click a course card below
                to load and preview its full OBE report inline.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {["CO-PO Matrix", "Attainment Levels", "NBA Compliance", "NAAC Documentation", "PSO Mapping", "Bloom Coverage"].map((tag) => (
                  <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full bg-rose-500/8 border border-rose-500/15 text-rose-300 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses with OBE */}
      {withObe.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Award className="w-8 h-8 text-slate-600" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold">No completed courses yet</p>
            <p className="text-slate-400 text-sm mt-1">Generate a course to create its OBE / CO-PO mapping</p>
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
          {withObe.map((course) => {
            const isExpanded = expandedId === course.id;
            const isLoadingObe = obeLoading[course.id];
            const report = obeReports[course.id];
            const hasReport = report && (report.course_outcomes?.length ?? 0) > 0;

            return (
              <Card key={course.id} className={`transition-all duration-200 ${isExpanded ? "border-rose-500/30" : "hover:border-white/15"}`}>
                <CardContent className="p-5 space-y-0">
                  {/* Course header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Award className="w-5 h-5 text-rose-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm leading-snug">
                          {course.title}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{course.code}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                          <GraduationCap className="w-3 h-3 flex-shrink-0" />
                          {course.program} · Sem {course.semester}
                        </div>
                        {/* Cached stat pills */}
                        {hasReport && (
                          <div className="flex gap-2 mt-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300">
                              {report.course_outcomes?.length} COs
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300">
                              {report.program_outcomes?.length ?? "—"} POs
                            </span>
                            {report.co_po_matrix && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">Matrix ✓</span>}
                            {report.summary?.nba_compliance != null && (
                              <Badge variant={report.summary.nba_compliance ? "green" : "red"} className="text-[9px] gap-1">
                                {report.summary.nba_compliance ? <CheckCircle2 className="w-2.5 h-2.5" /> : null}
                                {report.summary.nba_compliance ? "NBA OK" : "NBA ✗"}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleExportObe(course.id)}
                        title="Export OBE PDF"
                        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        href={`/dashboard/courses/${course.id}?tab=results`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                      >
                        Full View
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      <button
                        onClick={() => toggleExpand(course.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                          isExpanded
                            ? "bg-rose-600/20 border-rose-500/40 text-rose-300"
                            : "bg-rose-600/10 border-rose-500/25 text-rose-400 hover:bg-rose-600/20"
                        }`}
                      >
                        {isLoadingObe
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        }
                        {isExpanded ? "Collapse" : "Preview OBE"}
                      </button>
                    </div>
                  </div>

                  {/* Expandable OBE panel */}
                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t border-white/8">
                      {isLoadingObe ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-6 h-6 text-rose-400 animate-spin" />
                          <span className="ml-2 text-sm text-slate-400">Fetching OBE report…</span>
                        </div>
                      ) : (
                        <ObeReportViewer report={report} />
                      )}
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
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-rose-400 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
