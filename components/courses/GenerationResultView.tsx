"use client";

import { useState } from "react";
import {
  BookOpen,
  Calendar,
  ClipboardList,
  Award,
  BarChart3,
  Target,
  CheckCircle2,
  BookMarked,
  Clock,
  Layers,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Brain,
  Lightbulb,
  FlaskConical,
  Scale,
  Telescope,
  Sparkles,
  HelpCircle,
  CheckSquare,
  AlignLeft,
  Code2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type {
  GenerationResult,
  ResultCurriculum,
  ResultSemesterPlan,
  ResultAssessments,
  SingleAssessment,
} from "@/lib/api";

// ── Bloom level config ────────────────────────────────────────────────────────
const bloomConfig: Record<
  string,
  { label: string; color: string; variant: "purple" | "blue" | "green" | "yellow" | "red"; Icon: React.ElementType }
> = {
  remember: { label: "Remember", color: "slate", variant: "yellow", Icon: BookMarked },
  understand: { label: "Understand", color: "blue", variant: "blue", Icon: Lightbulb },
  apply: { label: "Apply", color: "emerald", variant: "green", Icon: FlaskConical },
  analyze: { label: "Analyze", color: "violet", variant: "purple", Icon: Scale },
  evaluate: { label: "Evaluate", color: "orange", variant: "red", Icon: Telescope },
  create: { label: "Create", color: "pink", variant: "purple", Icon: Sparkles },
};

const bloomBg: Record<string, string> = {
  remember: "bg-yellow-500/10 border-yellow-500/20 text-yellow-300",
  understand: "bg-blue-500/10 border-blue-500/20 text-blue-300",
  apply: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
  analyze: "bg-violet-500/10 border-violet-500/20 text-violet-300",
  evaluate: "bg-orange-500/10 border-orange-500/20 text-orange-300",
  create: "bg-pink-500/10 border-pink-500/20 text-pink-300",
};

// ── Sub-tabs ──────────────────────────────────────────────────────────────────
const SUB_TABS = [
  { key: "curriculum", label: "Curriculum", Icon: BookOpen },
  { key: "semester", label: "Semester Plan", Icon: Calendar },
  { key: "assessments", label: "Assessments", Icon: ClipboardList },
  { key: "obe", label: "OBE Report", Icon: Award },
  { key: "analytics", label: "Analytics", Icon: BarChart3 },
] as const;
type SubTab = (typeof SUB_TABS)[number]["key"];

interface Props {
  result: GenerationResult;
}

export default function GenerationResultView({ result }: Props) {
  const available = result.generated_components ?? [];
  const defaultTab =
    (SUB_TABS.find((t) => available.includes(t.key === "semester" ? "semester_plan" : t.key === "obe" ? "obe_report" : t.key))?.key as SubTab) ??
    "curriculum";
  const [subTab, setSubTab] = useState<SubTab>(defaultTab);

  function isAvailable(key: SubTab) {
    const map: Record<SubTab, string> = {
      curriculum: "curriculum",
      semester: "semester_plan",
      assessments: "assessments",
      obe: "obe_report",
      analytics: "analytics",
    };
    return available.includes(map[key]);
  }

  return (
    <div className="space-y-4">
      {/* Header chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {result.generated_components.map((c) => (
          <span
            key={c}
            className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-300"
          >
            {c.replace(/_/g, " ")}
          </span>
        ))}
        {result.duration_seconds !== undefined && result.duration_seconds > 0 && (
          <span className="ml-auto text-[11px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {result.duration_seconds}s
          </span>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
        {SUB_TABS.map(({ key, label, Icon }) => {
          const avail = isAvailable(key);
          return (
            <button
              key={key}
              onClick={() => avail && setSubTab(key)}
              disabled={!avail}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                subTab === key
                  ? "bg-violet-600/30 text-violet-300 border border-violet-500/30"
                  : avail
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-600 cursor-not-allowed"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {!avail && (
                <span className="text-[9px] opacity-60">—</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      {subTab === "curriculum" && result.curriculum && (
        <CurriculumPanel data={result.curriculum} />
      )}
      {subTab === "semester" && result.semester_plan && (
        <SemesterPanel data={result.semester_plan} />
      )}
      {subTab === "assessments" && result.assessments && (
        <AssessmentsPanel data={result.assessments} />
      )}
      {subTab === "obe" && (
        <EmptyOrJsonPanel label="OBE Report" data={result.obe_report} />
      )}
      {subTab === "analytics" && (
        <EmptyOrJsonPanel label="Analytics" data={result.analytics} />
      )}
    </div>
  );
}

// ── Curriculum Panel ──────────────────────────────────────────────────────────
function CurriculumPanel({ data }: { data: ResultCurriculum }) {
  return (
    <div className="space-y-4">
      {/* Objectives + Prerequisites row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 space-y-3">
            <h4 className="text-xs font-semibold text-white flex items-center gap-2 uppercase tracking-wide">
              <Target className="w-3.5 h-3.5 text-violet-400" />
              Course Objectives
            </h4>
            <ol className="space-y-2">
              {data.course_objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-violet-500/20 text-violet-400 flex-shrink-0 flex items-center justify-center text-[9px] font-bold mt-0.5">
                    {i + 1}
                  </span>
                  {obj}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-2">
              <h4 className="text-xs font-semibold text-white flex items-center gap-2 uppercase tracking-wide">
                <BookMarked className="w-3.5 h-3.5 text-indigo-400" />
                Prerequisites
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.prerequisites.map((p) => (
                  <span key={p} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                    {p}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-2">
              <h4 className="text-xs font-semibold text-white flex items-center gap-2 uppercase tracking-wide">
                <Scale className="w-3.5 h-3.5 text-emerald-400" />
                Assessment Weightage
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                  <p className="text-xl font-bold text-blue-300">
                    {data.assessment_weightage.internal_assessment}%
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Internal</p>
                </div>
                <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-center">
                  <p className="text-xl font-bold text-violet-300">
                    {data.assessment_weightage.end_semester_exam}%
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">End Semester</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CLOs */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <h4 className="text-xs font-semibold text-white flex items-center gap-2 uppercase tracking-wide">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Course Learning Outcomes ({data.course_learning_outcomes.length})
          </h4>
          <div className="space-y-2">
            {data.course_learning_outcomes.map((clo) => {
              const bloom = bloomConfig[clo.bloom_level] ?? bloomConfig.remember;
              return (
                <div
                  key={clo.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/8 hover:border-white/15 transition-colors"
                >
                  <span className="flex-shrink-0 w-10 h-6 rounded-md bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[10px] font-bold text-violet-300">
                    {clo.id}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300 leading-relaxed">{clo.statement}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium ${bloomBg[clo.bloom_level] ?? bloomBg.remember}`}>
                        <bloom.Icon className="w-2.5 h-2.5" />
                        {bloom.label}
                      </span>
                      {clo.po_mapping.map((po) => (
                        <span key={po} className="px-1.5 py-0.5 rounded bg-slate-700/60 text-[10px] text-slate-400">
                          {po}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modules */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <h4 className="text-xs font-semibold text-white flex items-center gap-2 uppercase tracking-wide">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            Modules ({data.modules.length})
          </h4>
          <div className="space-y-2">
            {data.modules.map((mod) => (
              <ModuleAccordion key={mod.module_number} mod={mod} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bloom Analysis */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-xs font-semibold text-white flex items-center gap-2 uppercase tracking-wide">
              <Brain className="w-3.5 h-3.5 text-pink-400" />
              Bloom&apos;s Taxonomy Analysis
            </h4>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                data.bloom_analysis.is_adequate
                  ? "bg-emerald-500/15 border border-emerald-500/25 text-emerald-300"
                  : "bg-red-500/15 border border-red-500/25 text-red-300"
              }`}
            >
              {data.bloom_analysis.is_adequate ? "Adequate" : "Needs Improvement"}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {Object.entries(data.bloom_analysis.distribution).map(([level, count]) => {
              const cfg = bloomConfig[level] ?? bloomConfig.remember;
              const pct = data.bloom_analysis.total > 0 ? (count / data.bloom_analysis.total) * 100 : 0;
              return (
                <div key={level} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/3 border border-white/8">
                  <cfg.Icon className={`w-4 h-4 ${level === "remember" ? "text-yellow-400" : level === "understand" ? "text-blue-400" : level === "apply" ? "text-emerald-400" : level === "analyze" ? "text-violet-400" : level === "evaluate" ? "text-orange-400" : "text-pink-400"}`} />
                  <p className="text-lg font-bold text-white">{count}</p>
                  <p className="text-[9px] text-slate-500 capitalize">{level}</p>
                  <div className="w-full h-1 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-white/8 text-xs text-slate-400">
            <span>HOT ratio: <strong className="text-violet-300">{(data.bloom_analysis.hot_ratio * 100).toFixed(0)}%</strong></span>
            <span>Higher-order CLOs: <strong className="text-violet-300">{data.bloom_analysis.higher_order_count}</strong></span>
          </div>
          <p className="text-xs text-slate-400 italic">{data.bloom_analysis.recommendation}</p>
        </CardContent>
      </Card>

      {/* Reference books */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BookList title="Textbooks" books={data.textbooks} color="violet" />
        <BookList title="References" books={data.references} color="indigo" />
      </div>

      {/* CO Attainment Methods */}
      <Card>
        <CardContent className="p-4 flex items-center gap-3 flex-wrap">
          <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">CO Attainment Methods:</span>
          {data.co_attainment_methods.map((m) => (
            <span key={m} className="px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300 font-medium">
              {m}
            </span>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ModuleAccordion({ mod }: { mod: import("@/lib/api").CourseModule }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/8 overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
      >
        <span className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/25 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-blue-300">
          M{mod.module_number}
        </span>
        <span className="flex-1 text-sm font-medium text-white">{mod.title}</span>
        <span className="text-[11px] text-slate-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />{mod.hours}h
        </span>
        <div className="flex gap-1">
          {mod.clo_mapping.map((c) => (
            <span key={c} className="px-1.5 py-0.5 rounded bg-violet-500/20 text-[9px] text-violet-300">{c}</span>
          ))}
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-3 pt-1 bg-white/3 border-t border-white/8">
          <ul className="space-y-1">
            {mod.topics.map((t, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-1 h-1 rounded-full bg-violet-400 flex-shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function BookList({ title, books, color }: { title: string; books: import("@/lib/api").CourseBook[]; color: string }) {
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <h4 className="text-xs font-semibold text-white flex items-center gap-2 uppercase tracking-wide">
          <BookOpen className={`w-3.5 h-3.5 text-${color}-400`} />
          {title}
        </h4>
        <div className="space-y-2">
          {books.map((b, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/3 border border-white/8">
              <p className="text-xs font-semibold text-white">{b.title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{b.author}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {b.publisher}{b.edition ? `, ${b.edition} ed.` : ""} · {b.year}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Semester Plan Panel ───────────────────────────────────────────────────────
function SemesterPanel({ data }: { data: ResultSemesterPlan }) {
  const [expandAll, setExpandAll] = useState(false);

  const hasAssessment = (w: import("@/lib/api").WeekPlan) => w.assessment !== null;

  return (
    <div className="space-y-4">
      {/* Overview stats */}
      {data.semester_overview && (
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Weeks", val: data.semester_overview.total_weeks, Icon: Calendar },
          { label: "Total Hours", val: data.semester_overview.total_hours, Icon: Clock },
          { label: "Hours / Week", val: data.semester_overview.teaching_hours_per_week, Icon: TrendingUp },
        ].map(({ label, val, Icon }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{val}</p>
                <p className="text-[10px] text-slate-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Assessment schedule */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <h4 className="text-xs font-semibold text-white flex items-center gap-2 uppercase tracking-wide">
            <ClipboardList className="w-3.5 h-3.5 text-orange-400" />
            Assessment Schedule
          </h4>
          <div className="flex items-center gap-3 overflow-x-auto">
            {data.assessment_schedule.map((a) => (
              <div key={a.week} className="flex-shrink-0 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 min-w-[140px]">
                <p className="text-[10px] text-orange-400/70 font-medium">Week {a.week}</p>
                <p className="text-xs font-semibold text-white mt-0.5">{a.type}</p>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  {a.topics_covered.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Week table */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-white flex items-center gap-2 uppercase tracking-wide">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              16-Week Plan
            </h4>
            <button
              onClick={() => setExpandAll((p) => !p)}
              className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
            >
              {expandAll ? "Collapse all" : "Expand all"}
            </button>
          </div>
          <div className="space-y-1.5">
            {data.weeks.map((week) => (
              <WeekRow key={week.week} week={week} forceOpen={expandAll} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WeekRow({ week, forceOpen }: { week: import("@/lib/api").WeekPlan; forceOpen: boolean }) {
  const [open, setOpen] = useState(false);
  const isOpen = forceOpen || open;
  const hasAssessment = week.assessment !== null;

  return (
    <div className={`rounded-xl border overflow-hidden transition-colors ${hasAssessment ? "border-orange-500/25" : "border-white/8"}`}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
      >
        <span className={`w-9 h-6 rounded-md flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${hasAssessment ? "bg-orange-500/20 border border-orange-500/30 text-orange-300" : "bg-slate-700/60 text-slate-400"}`}>
          W{week.week}
        </span>
        <span className="flex-1 text-xs font-medium text-slate-300 truncate">{week.module}</span>
        <div className="flex gap-1">
          {week.topics.slice(0, 2).map((t) => (
            <span key={t} className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/8 text-[9px] text-slate-500 truncate max-w-[80px]">{t}</span>
          ))}
        </div>
        {hasAssessment && (
          <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-[10px] font-medium text-orange-300">
            {week.assessment!.type}
          </span>
        )}
        {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />}
      </button>
      {isOpen && (
        <div className="px-3 pb-3 pt-1 bg-white/3 border-t border-white/8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <InfoCell label="Topics" items={week.topics} />
          <InfoCell label="CLOs" items={week.clos_addressed} />
          <InfoCell label="Methods" items={week.teaching_methods} />
          <InfoCell label="Activities" items={week.activities} />
        </div>
      )}
    </div>
  );
}

function InfoCell({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-[9px] text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <ul className="space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className="text-[11px] text-slate-400 flex items-start gap-1">
            <span className="w-1 h-1 rounded-full bg-violet-500/60 mt-1.5 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Assessments Panel ─────────────────────────────────────────────────────────
function AssessmentsPanel({ data }: { data: ResultAssessments }) {
  const assessments = data.assessments ?? [];
  const [activeIdx, setActiveIdx] = useState(0);
  const selected = assessments[activeIdx];

  const typeColor: Record<string, string> = {
    quiz: "bg-blue-500/10 border-blue-500/25 text-blue-300",
    midterm: "bg-orange-500/10 border-orange-500/25 text-orange-300",
    final: "bg-red-500/10 border-red-500/25 text-red-300",
    assignment: "bg-violet-500/10 border-violet-500/25 text-violet-300",
  };

  return (
    <div className="space-y-4">
      {/* Bloom coverage bar */}
      {data.bloom_coverage && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-[10px] text-slate-500 uppercase tracking-wide mb-3">Bloom Coverage Across All Assessments</h4>
            <div className="flex items-end gap-2 h-14">
              {Object.entries(data.bloom_coverage).map(([level, count]) => {
                const max = Math.max(...Object.values(data.bloom_coverage!));
                const h = max > 0 ? (count / max) * 100 : 0;
                const cfg = bloomConfig[level];
                return (
                  <div key={level} className="flex-1 flex flex-col items-center gap-1">
                    <p className="text-[10px] font-bold text-white">{count}</p>
                    <div
                      className={`w-full rounded-t-md ${level === "remember" ? "bg-yellow-500/60" : level === "understand" ? "bg-blue-500/60" : level === "apply" ? "bg-emerald-500/60" : level === "analyze" ? "bg-violet-500/60" : level === "evaluate" ? "bg-orange-500/60" : "bg-pink-500/60"}`}
                      style={{ height: `${Math.max(h, 8)}%` }}
                    />
                    <p className="text-[9px] text-slate-500 capitalize truncate w-full text-center">{level.slice(0, 3)}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {assessments.length === 0 && (
        <div className="flex items-center justify-center py-12 text-slate-500 text-sm">
          No assessment data available yet.
        </div>
      )}

      {/* Assessment selector */}
      {assessments.length > 0 && (
      <div className="flex gap-2 overflow-x-auto pb-1">
        {assessments.map((a, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
              activeIdx === i
                ? "border-violet-500/40 bg-violet-600/20 text-violet-300"
                : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            <p className="font-semibold">{a.assessment_title}</p>
            <p className="text-[10px] opacity-70 mt-0.5">{a.total_marks} marks · {a.duration_minutes}m</p>
          </button>
        ))}
      </div>
      )}

      {/* Selected assessment */}
      {selected && <AssessmentDetail a={selected} typeColor={typeColor} />}
    </div>
  );
}

function AssessmentDetail({ a, typeColor }: { a: SingleAssessment; typeColor: Record<string, string> }) {
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));
  function toggleSection(i: number) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold text-white">{a.assessment_title}</h3>
            <p className="text-xs text-slate-400 mt-0.5 italic">{a.instructions}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium capitalize ${typeColor[a.type] ?? typeColor.quiz}`}>
              {a.type}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/8 border border-white/12 text-[11px] text-slate-300">
              {a.total_marks} marks
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/8 border border-white/12 text-[11px] text-slate-300">
              {a.duration_minutes} min
            </span>
          </div>
        </div>

        {/* Sections */}
        {a.sections.map((sec, si) => (
          <div key={si} className="rounded-xl border border-white/10 overflow-hidden">
            <button
              onClick={() => toggleSection(si)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white/3 hover:bg-white/5 transition-colors text-left"
            >
              <span className="w-6 h-6 rounded-md bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[10px] font-bold text-violet-300">
                {sec.section}
              </span>
              <span className="flex-1 text-xs font-semibold text-white">{sec.type}</span>
              <span className="text-[10px] text-slate-500">{sec.marks_per_question} mark{sec.marks_per_question !== 1 ? "s" : ""} each · {sec.questions.length} Qs</span>
              {openSections.has(si) ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
            </button>

            {openSections.has(si) && (
              <div className="divide-y divide-white/5">
                {sec.questions.map((q, qi) => (
                  <QuestionCard key={qi} q={q} idx={qi} sectionType={sec.type} />
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function QuestionCard({ q, idx, sectionType }: { q: import("@/lib/api").AssessmentQuestion; idx: number; sectionType: string }) {
  const [show, setShow] = useState(false);
  const bloom = bloomConfig[q.bloom_level] ?? bloomConfig.remember;

  return (
    <div className="px-4 py-3 hover:bg-white/3 transition-colors">
      <div className="flex items-start gap-3">
        <span className="w-6 h-6 rounded-full bg-white/8 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-400 mt-0.5">
          {q.id}
        </span>
        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-xs text-slate-200 leading-relaxed">{q.question}</p>

          {/* MCQ options */}
          {q.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
              {q.options.map((opt, oi) => {
                const letter = opt.charAt(0);
                const isCorrect = q.answer === letter;
                return (
                  <div
                    key={oi}
                    className={`flex items-start gap-2 px-2.5 py-1.5 rounded-lg text-[11px] border ${
                      show && isCorrect
                        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                        : "bg-white/3 border-white/8 text-slate-400"
                    }`}
                  >
                    {show && isCorrect && <CheckSquare className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />}
                    {opt}
                  </div>
                );
              })}
            </div>
          )}

          {/* Short/long answer model answer */}
          {q.model_answer && show && (
            <div className="p-2.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
              <p className="text-[10px] text-emerald-400 uppercase tracking-wide font-medium mb-1 flex items-center gap-1">
                <AlignLeft className="w-3 h-3" /> Model Answer
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">{q.model_answer}</p>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium ${bloomBg[q.bloom_level] ?? bloomBg.remember}`}>
              <bloom.Icon className="w-2.5 h-2.5" />
              {bloom.label}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-violet-500/15 text-[10px] text-violet-400">{q.clo}</span>
            <button
              onClick={() => setShow((p) => !p)}
              className="ml-auto text-[10px] text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3" />
              {show ? "Hide answer" : "Show answer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Empty / JSON fallback ──────────────────────────────────────────────────────
function EmptyOrJsonPanel({ label, data }: { label: string; data?: Record<string, unknown> }) {
  const isEmpty = !data || Object.keys(data).length === 0;
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Code2 className="w-6 h-6 text-slate-500" />
        </div>
        <p className="text-sm text-slate-500">{label} data not generated yet</p>
      </div>
    );
  }
  return (
    <Card>
      <CardContent className="p-5">
        <pre className="text-[11px] text-slate-300 bg-black/30 rounded-xl p-4 overflow-auto max-h-96 border border-white/10 font-mono leading-relaxed">
          {JSON.stringify(data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}
