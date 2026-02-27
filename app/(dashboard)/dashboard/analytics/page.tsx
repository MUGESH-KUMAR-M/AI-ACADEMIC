"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Layers,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileText,
  TrendingUp,
  GraduationCap,
  Building2,
  Coins,
  Globe,
  Lock,
  Brain,
  Target,
  Calendar,
  Loader2,
  ArrowRight,
  CircleDot,
  Sparkles,
  AlertTriangle,
  Activity,
  ChevronDown,
  ChevronUp,
  Zap,
  Users,
  Star,
  Gauge,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import * as api from "@/lib/api";
import * as authLib from "@/lib/auth";
import toast from "react-hot-toast";

// ── Helpers ───────────────────────────────────────────────────────────────────
function countBy<T>(arr: T[], fn: (item: T) => string): Record<string, number> {
  return arr.reduce<Record<string, number>>((acc, item) => {
    const key = fn(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function percent(part: number, total: number) {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

// ── Bar component ─────────────────────────────────────────────────────────────
function HBar({ value, max, color = "violet" }: { value: number; max: number; color?: string }) {
  const pct = max === 0 ? 0 : (value / max) * 100;
  const gradientMap: Record<string, string> = {
    violet: "from-violet-500 to-indigo-500",
    emerald: "from-emerald-500 to-teal-500",
    blue: "from-blue-500 to-cyan-500",
    orange: "from-orange-500 to-amber-500",
    rose: "from-rose-500 to-pink-500",
    yellow: "from-yellow-500 to-amber-400",
  };
  return (
    <div className="flex-1 h-2 rounded-full bg-white/8 overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${gradientMap[color] ?? gradientMap.violet} transition-all duration-700`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Donut (pure CSS) ──────────────────────────────────────────────────────────
function DonutStat({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = percent(value, total);
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const dash = (pct / 100) * circ;

  const strokeMap: Record<string, string> = {
    emerald: "#10b981",
    blue: "#3b82f6",
    yellow: "#eab308",
    red: "#ef4444",
    violet: "#8b5cf6",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke={strokeMap[color] ?? strokeMap.violet}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ - dash}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white">{pct}%</span>
        </div>
      </div>
      <p className="text-[11px] text-slate-400 text-center">{label}</p>
      <p className="text-xs font-semibold text-white">{value} / {total}</p>
    </div>
  );
}

// ── Status config ─────────────────────────────────────────────────────────────
const statusMeta: Record<
  api.CourseStatus,
  { label: string; color: string; barColor: string; Icon: React.ElementType; variant: "green" | "blue" | "yellow" | "red" | "purple" }
> = {
  completed: { label: "Completed", color: "emerald", barColor: "emerald", Icon: CheckCircle2, variant: "green" },
  generating: { label: "Generating", color: "blue", barColor: "blue", Icon: RefreshCw, variant: "blue" },
  draft: { label: "Draft", color: "yellow", barColor: "yellow", Icon: CircleDot, variant: "yellow" },
  failed: { label: "Failed", color: "red", barColor: "rose", Icon: XCircle, variant: "red" },
  published: { label: "Published", color: "violet", barColor: "violet", Icon: Sparkles, variant: "purple" },
};

const programColors: Record<string, string> = {
  "B.Tech": "violet",
  "M.Tech": "blue",
  MBA: "emerald",
  BCA: "orange",
  MCA: "rose",
};

// ── Analytics Detail Panel ────────────────────────────────────────────────────
type AnalyticsTab = "overview" | "performance" | "teaching" | "benchmarking" | "interventions";

function AnalyticsDetailPanel({ analytics }: { analytics: api.CourseAnalyticsData }) {
  const [tab, setTab] = useState<AnalyticsTab>("overview");

  const tabs = [
    { key: "overview" as const, label: "Overview", Icon: Gauge, available: !!analytics.difficulty_analysis },
    { key: "performance" as const, label: "Performance", Icon: Users, available: !!analytics.student_performance_prediction },
    { key: "teaching" as const, label: "Teaching", Icon: Target, available: !!analytics.teaching_effectiveness_indicators },
    { key: "benchmarking" as const, label: "Benchmarking", Icon: Star, available: !!analytics.benchmarking },
    { key: "interventions" as const, label: "Interventions", Icon: Zap, available: !!(analytics.intervention_strategies?.length) },
  ].filter((t) => t.available);

  if (tabs.length === 0) {
    return <p className="text-xs text-slate-500 py-4 text-center">No analytics data available for this course.</p>;
  }

  const activeTab = tabs.find((t) => t.key === tab) ? tab : tabs[0].key;

  return (
    <div className="mt-3 space-y-3">
      {/* Tab bar */}
      <div className="flex gap-1 flex-wrap">
        {tabs.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === key
                ? "bg-violet-600/30 border border-violet-500/40 text-violet-300"
                : "bg-white/5 border border-white/10 text-slate-400 hover:text-slate-300 hover:bg-white/8"
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === "overview" && analytics.difficulty_analysis && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/8 text-center">
              <p className="text-2xl font-bold text-white">{analytics.difficulty_analysis.difficulty_score}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Difficulty Score</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/8 text-center">
              <p className="text-sm font-bold text-orange-300 capitalize">{analytics.difficulty_analysis.overall_difficulty}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Overall Difficulty</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/8 text-center col-span-2">
              <p className={`text-sm font-bold capitalize ${
                analytics.difficulty_analysis.prerequisite_gaps_risk === "high" ? "text-red-400" :
                analytics.difficulty_analysis.prerequisite_gaps_risk === "medium" ? "text-yellow-400" : "text-emerald-400"
              }`}>{analytics.difficulty_analysis.prerequisite_gaps_risk}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Prerequisite Gap Risk</p>
            </div>
          </div>
          {analytics.difficulty_analysis.challenging_topics.length > 0 && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/8">
              <p className="text-[11px] font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-yellow-400" /> Challenging Topics
              </p>
              <div className="flex flex-wrap gap-1.5">
                {analytics.difficulty_analysis.challenging_topics.map((t, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[10px] text-yellow-300">{t}</span>
                ))}
              </div>
            </div>
          )}
          {analytics.recommendations && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(["for_faculty", "for_students", "for_curriculum"] as const).map((key) => {
                const items = analytics.recommendations![key];
                if (!items?.length) return null;
                const labels = { for_faculty: "For Faculty", for_students: "For Students", for_curriculum: "For Curriculum" };
                const colorText: Record<string, string> = { for_faculty: "text-blue-400", for_students: "text-emerald-400", for_curriculum: "text-violet-400" };
                const colorDot: Record<string, string> = { for_faculty: "bg-blue-400", for_students: "bg-emerald-400", for_curriculum: "bg-violet-400" };
                return (
                  <div key={key} className="p-3 rounded-xl bg-white/5 border border-white/8">
                    <p className={`text-[10px] font-semibold mb-2 ${colorText[key]}`}>{labels[key]}</p>
                    <ul className="space-y-1">
                      {items.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                          <span className={`w-1 h-1 rounded-full mt-1.5 flex-shrink-0 ${colorDot[key]}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Performance tab */}
      {activeTab === "performance" && analytics.student_performance_prediction && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
              <p className="text-2xl font-bold text-emerald-300">{analytics.student_performance_prediction.expected_pass_rate}%</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Expected Pass Rate</p>
              <div className="mt-2"><HBar value={analytics.student_performance_prediction.expected_pass_rate} max={100} color="emerald" /></div>
            </div>
            <div className="p-3 rounded-xl bg-violet-500/8 border border-violet-500/20">
              <p className="text-2xl font-bold text-violet-300">{analytics.student_performance_prediction.expected_distinction_rate}%</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Expected Distinction Rate</p>
              <div className="mt-2"><HBar value={analytics.student_performance_prediction.expected_distinction_rate} max={100} color="violet" /></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/8">
              <p className="text-[10px] font-semibold text-red-400 mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> At-Risk Factors
              </p>
              <ul className="space-y-1">
                {analytics.student_performance_prediction.at_risk_factors.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                    <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/8">
              <p className="text-[10px] font-semibold text-emerald-400 mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Success Factors
              </p>
              <ul className="space-y-1">
                {analytics.student_performance_prediction.success_factors.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Teaching tab */}
      {activeTab === "teaching" && analytics.teaching_effectiveness_indicators && (
        <div className="space-y-2">
          {[
            { label: "CLO Attainability", val: analytics.teaching_effectiveness_indicators.clo_attainability_score, color: "violet" },
            { label: "Assessment Alignment", val: analytics.teaching_effectiveness_indicators.assessment_alignment_score, color: "blue" },
            { label: "Bloom Coverage", val: analytics.teaching_effectiveness_indicators.bloom_coverage_score, color: "emerald" },
            { label: "Overall Quality", val: analytics.teaching_effectiveness_indicators.overall_quality_score, color: "orange" },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-xs text-slate-300 w-44 flex-shrink-0">{label}</span>
              <HBar value={val} max={100} color={color} />
              <span className="text-xs font-bold text-white w-10 text-right flex-shrink-0">{val}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Benchmarking tab */}
      {activeTab === "benchmarking" && analytics.benchmarking && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Avg Pass Rate (Similar)", val: analytics.benchmarking.similar_courses_avg_pass_rate, color: "blue" },
              { label: "Industry Alignment", val: analytics.benchmarking.industry_alignment_score, color: "emerald" },
              { label: "Research Relevance", val: analytics.benchmarking.research_relevance_score, color: "violet" },
            ].map(({ label, val, color }) => (
              <div key={label} className="p-3 rounded-xl bg-white/5 border border-white/8 text-center">
                <p className="text-2xl font-bold text-white">{val}%</p>
                <p className="text-[10px] text-slate-400 mt-1">{label}</p>
                <div className="mt-2"><HBar value={val} max={100} color={color} /></div>
              </div>
            ))}
          </div>
          {analytics.student_performance_prediction && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/8">
              <p className="text-[10px] font-semibold text-slate-300 mb-2">Pass Rate Comparison</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 w-36 flex-shrink-0">This Course (Expected)</span>
                  <HBar value={analytics.student_performance_prediction.expected_pass_rate} max={100} color="emerald" />
                  <span className="text-[10px] font-bold text-emerald-300 w-10 text-right flex-shrink-0">{analytics.student_performance_prediction.expected_pass_rate}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 w-36 flex-shrink-0">Similar Courses (Avg)</span>
                  <HBar value={analytics.benchmarking.similar_courses_avg_pass_rate} max={100} color="blue" />
                  <span className="text-[10px] font-bold text-blue-300 w-10 text-right flex-shrink-0">{analytics.benchmarking.similar_courses_avg_pass_rate}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interventions tab */}
      {activeTab === "interventions" && analytics.intervention_strategies && (
        <div className="space-y-2">
          {analytics.intervention_strategies.map((s, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/8 space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/25 text-[9px] font-bold text-red-400 flex-shrink-0 mt-0.5">TRIGGER</span>
                <p className="text-[11px] text-slate-300">{s.trigger}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded bg-blue-500/15 border border-blue-500/25 text-[9px] font-bold text-blue-400 flex-shrink-0 mt-0.5">ACTION</span>
                <p className="text-[11px] text-slate-300">{s.action}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/25 text-[9px] font-bold text-emerald-400 flex-shrink-0 mt-0.5">IMPACT</span>
                <p className="text-[11px] text-slate-300">{s.expected_impact}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



// ── Page ──────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [courses, setCourses] = useState<api.Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [detailMap, setDetailMap] = useState<Record<string, api.Course>>({});
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = authLib.getAccessToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.listCourses(token, { page: 1, page_size: 200 });
      setCourses(res.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleCourseExpand = useCallback(async (id: string) => {
    if (expandedCourseId === id) { setExpandedCourseId(null); return; }
    setExpandedCourseId(id);
    if (!detailMap[id]) {
      setLoadingDetailId(id);
      try {
        const token = authLib.getAccessToken();
        if (!token) return;
        const full = await api.getCourse(token, id);
        setDetailMap((prev) => ({ ...prev, [id]: full }));
      } catch {
        toast.error("Failed to load course analytics");
      } finally {
        setLoadingDetailId(null);
      }
    }
  }, [expandedCourseId, detailMap]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          <p className="text-slate-400 text-sm">Loading analytics…</p>
        </div>
      </div>
    );
  }

  // ── Computed metrics ────────────────────────────────────────────────────────
  const total = courses.length;
  const byStatus = countBy(courses, (c) => c.status);
  const byProgram = countBy(courses, (c) => c.program);
  const bySemester = countBy(courses, (c) => String(c.semester));
  const byDept = countBy(courses, (c) => c.department);
  const byYear = countBy(courses, (c) => c.academic_year);

  const completed = byStatus.completed ?? 0;
  const generating = byStatus.generating ?? 0;
  const draft = byStatus.draft ?? 0;
  const failed = byStatus.failed ?? 0;
  const published = byStatus.published ?? 0;

  const totalCredits = courses.reduce((s, c) => s + c.credits, 0);
  const avgCredits = total > 0 ? (totalCredits / total).toFixed(1) : "—";
  const publicCount = courses.filter((c) => c.is_public).length;
  const generationRate = percent(completed + published, total);
  const failureRate = percent(failed, total);
  const successRate = percent(completed + published, completed + published + failed || 1);

  // Top tags
  const tagCounts: Record<string, number> = {};
  courses.forEach((c) => c.tags.forEach((t) => { tagCounts[t] = (tagCounts[t] ?? 0) + 1; }));
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Bloom distribution across all curriculum_data
  const bloomTotals: Record<string, number> = {};
  courses.forEach((c) => {
    const dist = c.curriculum_data?.bloom_analysis?.distribution;
    if (dist) {
      Object.entries(dist).forEach(([k, v]) => {
        bloomTotals[k] = (bloomTotals[k] ?? 0) + (v as number);
      });
    }
  });
  const bloomTotal = Object.values(bloomTotals).reduce((a, b) => a + b, 0);

  const bloomColors: Record<string, string> = {
    remember: "yellow",
    understand: "blue",
    apply: "emerald",
    analyze: "violet",
    evaluate: "orange",
    create: "rose",
  };

  // Recent courses (last 5 by updated_at)
  const recent = [...courses]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6);

  const maxProgramCount = Math.max(...Object.values(byProgram), 1);
  const maxDeptCount = Math.max(...Object.values(byDept), 1);
  const maxSemesterCount = Math.max(...Object.values(bySemester), 1);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-1">Platform-wide insights across {total} courses</p>
        </div>
        <Button variant="secondary" onClick={load} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* ── KPI row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Courses", val: total, Icon: Layers, color: "from-violet-600 to-indigo-600", shadow: "shadow-violet-500/20" },
          { label: "Completed", val: completed + published, Icon: CheckCircle2, color: "from-emerald-600 to-teal-600", shadow: "shadow-emerald-500/20" },
          { label: "Total Credits", val: totalCredits, Icon: Coins, color: "from-blue-600 to-cyan-600", shadow: "shadow-blue-500/20" },
          { label: "Avg Credits", val: avgCredits, Icon: TrendingUp, color: "from-orange-600 to-amber-600", shadow: "shadow-orange-500/20" },
        ].map(({ label, val, Icon, color, shadow }) => (
          <Card key={label} glow>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-lg ${shadow}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white leading-none">{val}</p>
                <p className="text-xs text-slate-400 mt-1">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Status breakdown + Donut row ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status bars */}
        <Card className="lg:col-span-2">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-400" />
              Course Status Distribution
            </h3>
            <div className="space-y-3">
              {(Object.keys(statusMeta) as api.CourseStatus[]).map((s) => {
                const meta = statusMeta[s];
                const count = byStatus[s] ?? 0;
                const Icon = meta.Icon;
                return (
                  <div key={s} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg bg-${meta.color}-500/15 border border-${meta.color}-500/25 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-3.5 h-3.5 text-${meta.color}-400 ${s === "generating" ? "animate-spin" : ""}`} />
                    </div>
                    <span className="text-xs font-medium text-slate-300 w-24 flex-shrink-0">{meta.label}</span>
                    <HBar value={count} max={total} color={meta.barColor} />
                    <span className="text-xs font-bold text-white w-6 text-right flex-shrink-0">{count}</span>
                    <span className="text-[11px] text-slate-500 w-9 flex-shrink-0">{percent(count, total)}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Donut grid */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-violet-400" />
              Key Ratios
            </h3>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <DonutStat label="Generated" value={completed + published} total={total} color="emerald" />
              <DonutStat label="Public" value={publicCount} total={total} color="blue" />
              <DonutStat label="Success Rate" value={completed + published} total={Math.max(completed + published + failed, 1)} color="violet" />
              <DonutStat label="Failed" value={failed} total={total} color="red" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Program + Semester ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Program */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-violet-400" />
              Courses by Program
            </h3>
            {Object.keys(byProgram).length === 0 ? (
              <p className="text-xs text-slate-500">No data</p>
            ) : (
              <div className="space-y-2.5">
                {Object.entries(byProgram)
                  .sort((a, b) => b[1] - a[1])
                  .map(([prog, count]) => (
                    <div key={prog} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-300 w-20 flex-shrink-0 truncate">{prog}</span>
                      <HBar value={count} max={maxProgramCount} color={programColors[prog] ?? "violet"} />
                      <span className="text-xs font-bold text-white w-6 text-right flex-shrink-0">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* By Semester */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-400" />
              Courses by Semester
            </h3>
            {Object.keys(bySemester).length === 0 ? (
              <p className="text-xs text-slate-500">No data</p>
            ) : (
              <div className="space-y-2.5">
                {Array.from({ length: 8 }, (_, i) => String(i + 1))
                  .filter((s) => bySemester[s])
                  .map((s) => (
                    <div key={s} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-300 w-20 flex-shrink-0">Semester {s}</span>
                      <HBar value={bySemester[s]} max={maxSemesterCount} color="indigo" />
                      <span className="text-xs font-bold text-white w-6 text-right flex-shrink-0">{bySemester[s]}</span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Department + Academic Year ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Department */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-violet-400" />
              Courses by Department
            </h3>
            {Object.keys(byDept).length === 0 ? (
              <p className="text-xs text-slate-500">No data</p>
            ) : (
              <div className="space-y-2.5">
                {Object.entries(byDept)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([dept, count]) => (
                    <div key={dept} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-300 w-44 flex-shrink-0 truncate" title={dept}>{dept}</span>
                      <HBar value={count} max={maxDeptCount} color="blue" />
                      <span className="text-xs font-bold text-white w-6 text-right flex-shrink-0">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Academic Year + Top tags col */}
        <div className="space-y-4">
          {/* Academic year */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-400" />
                Academic Year Breakdown
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(byYear)
                  .sort((a, b) => b[0].localeCompare(a[0]))
                  .map(([yr, count]) => (
                    <div key={yr} className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-lg font-bold text-white">{count}</p>
                      <p className="text-[10px] text-slate-500">{yr}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Top tags */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-400" />
                Top Tags
              </h3>
              {topTags.length === 0 ? (
                <p className="text-xs text-slate-500">No tags yet</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {topTags.map(([tag, count]) => (
                    <span key={tag} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 font-medium">
                      {tag}
                      <span className="bg-violet-500/30 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white">{count}</span>
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Bloom Taxonomy Aggregate ─────────────────────────────────────── */}
      {bloomTotal > 0 && (
        <Card glow>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-pink-400" />
                Bloom&apos;s Taxonomy — Aggregate CLO Distribution
              </h3>
              <span className="text-[11px] text-slate-500">Across {courses.filter(c => c.curriculum_data?.bloom_analysis).length} generated courses</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {Object.entries(bloomTotals).map(([level, count]) => {
                const pct = bloomTotal > 0 ? Math.round((count / bloomTotal) * 100) : 0;
                const color = bloomColors[level] ?? "violet";
                const colorTextMap: Record<string, string> = {
                  yellow: "text-yellow-400", blue: "text-blue-400",
                  emerald: "text-emerald-400", violet: "text-violet-400",
                  orange: "text-orange-400", rose: "text-rose-400",
                };
                const colorBgMap: Record<string, string> = {
                  yellow: "bg-yellow-500/60", blue: "bg-blue-500/60",
                  emerald: "bg-emerald-500/60", violet: "bg-violet-500/60",
                  orange: "bg-orange-500/60", rose: "bg-rose-500/60",
                };
                const maxBloom = Math.max(...Object.values(bloomTotals));
                const barH = Math.max((count / maxBloom) * 60, 6);
                return (
                  <div key={level} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/3 border border-white/8">
                    <p className="text-lg font-bold text-white">{count}</p>
                    <div className="w-full flex items-end justify-center" style={{ height: "60px" }}>
                      <div className={`w-8 rounded-t-md ${colorBgMap[color]}`} style={{ height: `${barH}px` }} />
                    </div>
                    <p className={`text-[10px] font-medium capitalize ${colorTextMap[color]}`}>{level}</p>
                    <p className="text-[9px] text-slate-500">{pct}%</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Recent Activity ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-400" />
            Recent Course Activity
          </h3>
          <Link href="/dashboard/courses" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <BarChart3 className="w-10 h-10 text-slate-600" />
              <p className="text-sm text-slate-500">No courses yet. Create your first course to see analytics.</p>
              <Link href="/dashboard/courses">
                <Button size="sm" className="gap-2 mt-1">
                  <Layers className="w-3.5 h-3.5" />
                  Go to Courses
                </Button>
              </Link>
            </div>
          ) : (
            recent.map((course) => {
              const meta = statusMeta[course.status];
              const Icon = meta.Icon;
              return (
                <Link
                  key={course.id}
                  href={`/dashboard/courses/${course.id}`}
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/8 hover:border-violet-500/30 hover:bg-white/8 transition-all duration-200"
                >
                  {/* Status dot */}
                  <div className={`w-9 h-9 rounded-xl bg-${meta.color}-500/15 border border-${meta.color}-500/25 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 text-${meta.color}-400 ${course.status === "generating" ? "animate-spin" : ""}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                        {course.title}
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono">{course.code}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />{course.program}
                      </span>
                      <span className="text-[11px] text-slate-400">Sem {course.semester}</span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Coins className="w-3 h-3" />{course.credits} cr
                      </span>
                      {course.is_public
                        ? <Globe className="w-3 h-3 text-emerald-500" />
                        : <Lock className="w-3 h-3 text-slate-500" />}
                    </div>
                  </div>

                  {/* Progress (if generating) */}
                  {course.status === "generating" && (
                    <div className="flex-shrink-0 w-24 space-y-1 hidden sm:block">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-violet-400 font-medium">{course.generation_progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/8">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                          style={{ width: `${course.generation_progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Bloom HoT if available */}
                  {course.curriculum_data?.bloom_analysis && (
                    <div className="flex-shrink-0 text-center hidden md:block">
                      <p className="text-sm font-bold text-violet-300">{Math.round(course.curriculum_data.bloom_analysis.hot_ratio * 100)}%</p>
                      <p className="text-[9px] text-slate-500">HoT ratio</p>
                    </div>
                  )}

                  {/* Status badge */}
                  <Badge variant={meta.variant} className="flex-shrink-0 gap-1">
                    <Icon className={`w-2.5 h-2.5 ${course.status === "generating" ? "animate-spin" : ""}`} />
                    {meta.label}
                  </Badge>

                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors flex-shrink-0" />
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* ── Generation Health ────────────────────────────────────────────── */}
      {total > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Generation Rate",
              value: `${generationRate}%`,
              desc: `${completed + published} of ${total} courses generated`,
              color: "emerald",
              Icon: CheckCircle2,
              sublabel: generationRate >= 70 ? "Excellent" : generationRate >= 40 ? "Good" : "Getting started",
            },
            {
              label: "Failure Rate",
              value: `${failureRate}%`,
              desc: `${failed} course${failed !== 1 ? "s" : ""} failed`,
              color: failureRate > 20 ? "red" : "yellow",
              Icon: failureRate > 20 ? AlertTriangle : Activity,
              sublabel: failureRate === 0 ? "All clear" : failureRate < 10 ? "Low failure" : "Needs attention",
            },
            {
              label: "Success Rate",
              value: `${successRate}%`,
              desc: "Of attempted generations",
              color: successRate >= 80 ? "emerald" : "orange",
              Icon: TrendingUp,
              sublabel: successRate >= 80 ? "High quality" : "Room to improve",
            },
          ].map(({ label, value, desc, color, Icon, sublabel }) => {
            const bg: Record<string, string> = {
              emerald: "from-emerald-600/15 to-teal-600/15",
              red: "from-red-600/15 to-rose-600/15",
              yellow: "from-yellow-600/15 to-amber-600/15",
              orange: "from-orange-600/15 to-amber-600/15",
            };
            const iconBg: Record<string, string> = {
              emerald: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400",
              red: "bg-red-500/20 border-red-500/30 text-red-400",
              yellow: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
              orange: "bg-orange-500/20 border-orange-500/30 text-orange-400",
            };
            return (
              <div key={label} className={`p-5 rounded-2xl bg-gradient-to-br ${bg[color] ?? bg.emerald} border border-white/10`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${iconBg[color] ?? iconBg.emerald}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-white">{label}</p>
                </div>
                <p className="text-3xl font-bold text-white">{value}</p>
                <p className="text-[11px] text-slate-400 mt-1">{desc}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 italic">{sublabel}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Per-Course Deep Analytics ────────────────────────────────────── */}
      {(() => {
        const analyticsCourses = courses.filter((c) => c.status === "completed" || c.status === "published");
        if (analyticsCourses.length === 0) return null;
        return (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-pink-400" />
                Per-Course Deep Analytics
              </h3>
              <span className="text-xs text-slate-500">
                {analyticsCourses.length} course{analyticsCourses.length !== 1 ? "s" : ""} with AI insights
              </span>
            </div>
            <div className="space-y-2">
              {analyticsCourses.map((course) => {
                const isExpanded = expandedCourseId === course.id;
                const isLoadingDetail = loadingDetailId === course.id;
                const detail = detailMap[course.id];
                const analytics = detail?.analytics_data;
                const meta = statusMeta[course.status];
                const Icon = meta.Icon;
                return (
                  <div
                    key={course.id}
                    className={`rounded-2xl border transition-all duration-200 ${
                      isExpanded ? "bg-white/7 border-violet-500/30" : "bg-white/5 border-white/8 hover:border-white/15"
                    }`}
                  >
                    <button
                      onClick={() => toggleCourseExpand(course.id)}
                      className="w-full flex items-center gap-4 p-4 text-left"
                    >
                      <div className={`w-9 h-9 rounded-xl bg-${meta.color}-500/15 border border-${meta.color}-500/25 flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 text-${meta.color}-400`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-white truncate">{course.title}</p>
                          <span className="text-[10px] text-slate-500 font-mono">{course.code}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="text-[11px] text-slate-400">{course.program}</span>
                          <span className="text-[11px] text-slate-400">Sem {course.semester}</span>
                          <span className="text-[11px] text-slate-400 truncate">{course.department}</span>
                        </div>
                      </div>
                      {isLoadingDetail && <Loader2 className="w-4 h-4 text-violet-400 animate-spin flex-shrink-0" />}
                      {!isLoadingDetail && (
                        isExpanded
                          ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        {isLoadingDetail ? (
                          <div className="flex items-center justify-center py-8 gap-2">
                            <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                            <span className="text-sm text-slate-400">Loading analytics…</span>
                          </div>
                        ) : analytics ? (
                          <AnalyticsDetailPanel analytics={analytics} />
                        ) : (
                          <p className="text-xs text-slate-500 py-4 text-center">No analytics data available for this course yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}    </div>
  );
}