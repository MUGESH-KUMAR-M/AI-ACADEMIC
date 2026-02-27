"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Loader2,
  ArrowRight,
  GraduationCap,
  RefreshCw,
  Plus,
  Layers,
  CheckCircle2,
  Hash,
  TrendingUp,
  BookOpen,
  Target,
  FileText,
  ChevronDown,
  ChevronUp,
  Brain,
  List,
  Filter,
  HelpCircle,
  Lightbulb,
  Database,
} from "lucide-react";
import { GenerateQuestionPaperModal } from "@/components/courses/GenerateQuestionPaperModal";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import * as api from "@/lib/api";
import * as authLib from "@/lib/auth";
import toast from "react-hot-toast";

const typeColors: Record<string, string> = {
  quiz:       "bg-blue-500/10 border-blue-500/20 text-blue-300",
  midterm:    "bg-orange-500/10 border-orange-500/20 text-orange-300",
  final:      "bg-red-500/10 border-red-500/20 text-red-300",
  assignment: "bg-violet-500/10 border-violet-500/20 text-violet-300",
  cia:        "bg-cyan-500/10 border-cyan-500/20 text-cyan-300",
  viva:       "bg-rose-500/10 border-rose-500/20 text-rose-300",
};

const bloomColors: Record<string, string> = {
  Remember:   "bg-slate-500/15 text-slate-300 border-slate-500/20",
  Understand: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  Apply:      "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
  Analyze:    "bg-amber-500/15 text-amber-300 border-amber-500/20",
  Evaluate:   "bg-orange-500/15 text-orange-300 border-orange-500/20",
  Create:     "bg-violet-500/15 text-violet-300 border-violet-500/20",
};

const BLOOM_LEVELS = ["Full", "Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];

function BloomBadge({ level }: { level: string }) {
  const cls = bloomColors[level] ?? "bg-white/10 text-slate-400 border-white/10";
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${cls}`}>
      <Brain className="w-2.5 h-2.5" />
      {level}
    </span>
  );
}

function QuestionCard({ q, idx }: { q: api.AssessmentQuestion; idx: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
      <button
        className="w-full flex items-start gap-3 p-3.5 text-left hover:bg-white/4 transition-colors"
        onClick={() => setOpen((p) => !p)}
      >
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/8 border border-white/10 text-[10px] font-bold text-slate-400 flex items-center justify-center mt-0.5">
          {idx + 1}
        </span>
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="text-xs text-slate-200 leading-relaxed">{q.question}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <BloomBadge level={q.bloom_level} />
            {q.clo && (
              <span className="text-[9px] font-mono text-slate-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/8">
                {q.clo}
              </span>
            )}
          </div>
        </div>
        {(q.options || q.answer || q.model_answer) && (
          open
            ? <ChevronUp className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
            : <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-3.5 space-y-2 border-t border-white/5 pt-3">
          {q.options && q.options.length > 0 && (
            <div className="space-y-1">
              {q.options.map((opt, i) => (
                <div key={i} className={`flex items-start gap-2 text-[11px] px-2 py-1.5 rounded-lg ${q.answer && opt.trimStart().startsWith(q.answer.trim() + ")") ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300" : "text-slate-400"}`}>
                  <span className="font-bold flex-shrink-0">{String.fromCharCode(65 + i)}.</span>
                  <span>{opt}</span>
                </div>
              ))}
            </div>
          )}
          {(q.answer || q.model_answer) && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-500/8 border border-emerald-500/15">
              <Lightbulb className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-emerald-300 leading-relaxed">
                {q.model_answer ?? q.answer}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type DetailTab = "assessments" | "questionbank";

function CourseDetailPanel({
  data,
  qbData,
  qbLoading,
  bloomFilter,
  onBloomFilter,
  onLoadQB,
}: {
  data: api.CourseAssessmentsResponse;
  qbData: api.QuestionBankResponse | null;
  qbLoading: boolean;
  bloomFilter: string;
  onBloomFilter: (level: string) => void;
  onLoadQB: (level: string) => void;
}) {
  const [tab, setTab] = useState<DetailTab>("assessments");

  const handleBloomChange = (level: string) => {
    onBloomFilter(level);
    onLoadQB(level);
  };

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden">
      <div className="flex items-center gap-0 border-b border-white/8 px-4 pt-3">
        {[
          { id: "assessments" as DetailTab, label: "Assessments", Icon: List, count: data.assessments.assessments.length },
          { id: "questionbank" as DetailTab, label: "Question Bank", Icon: Database, count: qbData?.questions?.length ?? qbData?.question_bank?.total_questions ?? data.assessments.question_bank?.total_questions },
        ].map(({ id, label, Icon, count }) => (
          <button
            key={id}
            onClick={() => {
              setTab(id);
              if (id === "questionbank" && !qbData) onLoadQB(bloomFilter);
            }}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-colors -mb-px ${
              tab === id
                ? "border-orange-500 text-orange-300"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            {count !== undefined && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-white/8 text-slate-400">{count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === "assessments" && (
          <div className="space-y-5">
            {/* Bloom coverage summary */}
            {data.assessments.bloom_coverage && Object.keys(data.assessments.bloom_coverage).length > 0 && (
              <div className="flex flex-wrap gap-2 pb-1 border-b border-white/5">
                {Object.entries(data.assessments.bloom_coverage)
                  .sort((a, b) => (b[1] as number) - (a[1] as number))
                  .map(([lvl, cnt]) => {
                    const key = lvl.charAt(0).toUpperCase() + lvl.slice(1).toLowerCase();
                    return (
                      <span key={lvl} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${bloomColors[key] ?? "bg-white/8 text-slate-400 border-white/10"}`}>
                        {key}: {cnt as number}
                      </span>
                    );
                  })}
              </div>
            )}
            {data.assessments.assessments.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No assessments found for this course.</div>
            ) : (
              data.assessments.assessments.map((assessment, ai) => (
                <div key={ai} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 px-2 py-1 rounded-lg border text-[10px] font-bold uppercase ${typeColors[assessment.type?.toLowerCase() ?? ""] ?? "bg-white/8 border-white/10 text-slate-300"}`}>
                      {assessment.type ?? "exam"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">{assessment.assessment_title}</p>
                      <p className="text-[11px] text-slate-500">{assessment.total_marks} marks � {assessment.duration_minutes} min</p>
                    </div>
                  </div>
                  {assessment.instructions && (
                    <p className="text-[11px] text-slate-500 italic px-1 leading-relaxed">{assessment.instructions}</p>
                  )}
                  {assessment.sections.map((sec, si) => (
                    <div key={si} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Section {sec.section} � {sec.type}
                        </span>
                        <span className="text-[10px] text-slate-600">{sec.marks_per_question} mark(s) each</span>
                      </div>
                      <div className="space-y-1.5">
                        {sec.questions.map((q, qi) => (
                          <QuestionCard key={q.id ?? String(qi)} q={q} idx={qi} />
                        ))}
                      </div>
                    </div>
                  ))}
                  {ai < data.assessments.assessments.length - 1 && <div className="border-t border-white/5" />}
                </div>
              ))
            )}
          </div>
        )}

        {tab === "questionbank" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mr-1">Bloom level</span>
              {BLOOM_LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => handleBloomChange(lvl)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${
                    bloomFilter === lvl
                      ? lvl === "Full"
                        ? "bg-orange-600/30 border-orange-500/50 text-orange-300"
                        : (bloomColors[lvl] ?? "bg-white/15 border-white/20 text-white")
                      : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {qbData?.question_bank?.by_bloom_level && Object.keys(qbData.question_bank.by_bloom_level).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(qbData.question_bank.by_bloom_level).map(([lvl, cnt]) => (
                  <span key={lvl} className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${bloomColors[lvl] ?? "bg-white/8 text-slate-400 border-white/10"}`}>
                    {lvl}: {cnt}
                  </span>
                ))}
              </div>
            )}

            {qbLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              </div>
            ) : !qbData ? (
              <div className="text-center py-8 text-slate-500 text-sm">Select a bloom level to load questions.</div>
            ) : bloomFilter === "Full" ? (
              /* Full overview — API returns summary only, no question list */
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-white/4 border border-white/8 text-center space-y-2">
                  <p className="text-2xl font-bold text-white">{qbData.question_bank?.total_questions ?? 0}</p>
                  <p className="text-xs text-slate-400">Total questions in bank</p>
                </div>
                {qbData.question_bank?.by_bloom_level && Object.keys(qbData.question_bank.by_bloom_level).length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(qbData.question_bank.by_bloom_level).map(([lvl, cnt]) => {
                      const key = lvl.charAt(0).toUpperCase() + lvl.slice(1).toLowerCase();
                      return (
                        <button
                          key={lvl}
                          onClick={() => handleBloomChange(key)}
                          className={`p-2.5 rounded-xl border text-center transition-all hover:scale-[1.02] ${bloomColors[key] ?? "bg-white/5 border-white/10 text-slate-400"}`}
                        >
                          <p className="text-sm font-bold">{cnt as number}</p>
                          <p className="text-[10px] opacity-80">{key}</p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-xs text-slate-500">Pick a Bloom level above to browse questions.</p>
                )}
              </div>
            ) : (qbData.questions ?? []).length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No questions found for &ldquo;{bloomFilter}&rdquo; level.</div>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest flex items-center gap-1.5">
                  <HelpCircle className="w-3 h-3" />
                  {(qbData.questions ?? []).length} question{(qbData.questions ?? []).length !== 1 ? "s" : ""}
                </p>
                {(qbData.questions ?? []).map((q, qi) => (
                  <QuestionCard key={q.id ?? String(qi)} q={q} idx={qi} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AssessmentPage() {
  const [courses, setCourses] = useState<api.Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailCache, setDetailCache] = useState<Record<string, api.CourseAssessmentsResponse>>({});
  const [detailLoading, setDetailLoading] = useState<Record<string, boolean>>({});

  const [qbCache, setQbCache] = useState<Record<string, api.QuestionBankResponse>>({});
  const [qbLoadingMap, setQbLoadingMap] = useState<Record<string, boolean>>({});
  const [bloomFilter, setBloomFilter] = useState<Record<string, string>>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [modalCourseId, setModalCourseId] = useState<string | undefined>();

  function openModal(courseId?: string) {
    setModalCourseId(courseId);
    setModalOpen(true);
  }

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

  const handleExpand = useCallback(async (courseId: string) => {
    if (expandedId === courseId) { setExpandedId(null); return; }
    setExpandedId(courseId);
    if (detailCache[courseId]) return;

    const token = authLib.getAccessToken();
    if (!token) return;

    setDetailLoading((p) => ({ ...p, [courseId]: true }));
    try {
      const data = await api.getCourseAssessments(token, courseId);
      setDetailCache((p) => ({ ...p, [courseId]: data }));
      setBloomFilter((p) => ({ ...p, [courseId]: "Full" }));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load assessments");
      setExpandedId(null);
    } finally {
      setDetailLoading((p) => ({ ...p, [courseId]: false }));
    }
  }, [expandedId, detailCache]);

  const handleLoadQB = useCallback(async (courseId: string, level: string) => {
    const token = authLib.getAccessToken();
    if (!token) return;

    const cacheKey = `${courseId}__${level}`;
    if (qbCache[cacheKey]) {
      setQbCache((p) => ({ ...p, [courseId]: p[cacheKey] }));
      return;
    }

    setQbLoadingMap((p) => ({ ...p, [courseId]: true }));
    try {
      // API uses lowercase bloom_level values ("apply", "remember", etc.)
      const bloomParam = level === "Full" ? undefined : level.toLowerCase();
      const data = await api.getCourseQuestionBank(token, courseId, bloomParam);
      setQbCache((p) => ({ ...p, [cacheKey]: data, [courseId]: data }));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load question bank");
    } finally {
      setQbLoadingMap((p) => ({ ...p, [courseId]: false }));
    }
  }, [qbCache]);

  const withAssessment = courses.filter(
    (c) => c.status === "completed" || c.status === "published"
  );
  const pending = courses.filter(
    (c) => c.status !== "completed" && c.status !== "published"
  );

  const totalAssessments = withAssessment.reduce(
    (s, c) => s + (c.assessment_data?.assessments?.length ?? 0), 0
  );
  const totalMarks = withAssessment.reduce((s, c) => {
    const assessments = c.assessment_data?.assessments ?? [];
    return s + assessments.reduce(
      (ms: number, a: { total_marks?: number }) => ms + (a.total_marks ?? 0), 0
    );
  }, 0);

  const typeCounts: Record<string, number> = {};
  withAssessment.forEach((c) => {
    (c.assessment_data?.assessments ?? []).forEach((a) => {
      const t = a.type ?? "other";
      typeCounts[t] = (typeCounts[t] ?? 0) + 1;
    });
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              Assessment
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Quizzes, midterms, finals and question banks across all courses
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={load} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              onClick={() => openModal()}
              className="gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500"
            >
              <FileText className="w-4 h-4" />
              Generate Question Paper
            </Button>
            <Link href="/dashboard/courses">
              <Button variant="secondary" className="gap-2">
                <Plus className="w-4 h-4" />
                New Course
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Courses Ready",     val: withAssessment.length,         Icon: ClipboardList, color: "from-orange-600 to-amber-600",  shadow: "shadow-orange-500/20" },
            { label: "Total Assessments", val: totalAssessments,              Icon: Hash,          color: "from-violet-600 to-indigo-600", shadow: "shadow-violet-500/20" },
            { label: "Total Marks",       val: totalMarks,                    Icon: Target,        color: "from-blue-600 to-cyan-600",     shadow: "shadow-blue-500/20"   },
            { label: "Assessment Types",  val: Object.keys(typeCounts).length, Icon: Layers,       color: "from-emerald-600 to-teal-600",  shadow: "shadow-emerald-500/20" },
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

        {Object.keys(typeCounts).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(typeCounts).map(([type, count]) => (
              <div key={type} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${typeColors[type] ?? "bg-white/5 border-white/10 text-slate-300"}`}>
                <span className="capitalize">{type}</span>
                <span className="opacity-70">{count}</span>
              </div>
            ))}
          </div>
        )}

        {withAssessment.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <ClipboardList className="w-8 h-8 text-slate-600" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">No assessments yet</p>
              <p className="text-slate-400 text-sm mt-1">Generate a course to create its assessments</p>
            </div>
            <Link href="/dashboard/courses">
              <Button className="gap-2 mt-1"><Layers className="w-4 h-4" />Go to Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {withAssessment.map((course) => {
              const assessments: api.SingleAssessment[] = course.assessment_data?.assessments ?? [];
              const totalCourseMarks = assessments.reduce((s, a) => s + (a.total_marks ?? 0), 0);
              const isExpanded = expandedId === course.id;
              const isLoadingDetail = detailLoading[course.id];
              const detail = detailCache[course.id];

              return (
                <div key={course.id}>
                  <Card className={`transition-all duration-200 ${isExpanded ? "border-orange-500/30" : "hover:border-white/15"}`}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-white text-sm truncate">{course.title}</p>
                            <Badge variant="yellow" className="flex-shrink-0 text-[10px] gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              {assessments.length} set{assessments.length !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                            <span className="font-mono">{course.code}</span>
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              {course.program} � Sem {course.semester}
                            </span>
                            {totalCourseMarks > 0 && (
                              <span className="flex items-center gap-1 text-orange-400">
                                <Target className="w-3 h-3" />
                                {totalCourseMarks} marks
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {assessments.slice(0, 5).map((a, i) => (
                              <span key={i} className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${typeColors[a.type?.toLowerCase() ?? ""] ?? "bg-white/8 border-white/10 text-slate-400"}`}>
                                {a.type ?? "exam"}
                              </span>
                            ))}
                            {assessments.length > 5 && (
                              <span className="text-[9px] text-slate-600">+{assessments.length - 5}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => openModal(course.id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600/12 border border-amber-500/25 text-amber-300 text-xs font-semibold hover:bg-amber-600/22 transition-all"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Gen Paper
                          </button>
                          <button
                            onClick={() => handleExpand(course.id)}
                            disabled={isLoadingDetail}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                              isExpanded
                                ? "bg-orange-600/20 border-orange-500/30 text-orange-300"
                                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                            }`}
                          >
                            {isLoadingDetail
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : isExpanded
                              ? <ChevronUp className="w-3.5 h-3.5" />
                              : <ChevronDown className="w-3.5 h-3.5" />
                            }
                            {isExpanded ? "Collapse" : "View Details"}
                          </button>
                          <Link
                            href={`/dashboard/courses/${course.id}?tab=results`}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-600/15 border border-orange-500/25 text-orange-300 text-xs font-semibold hover:bg-orange-600/25 transition-all group"
                          >
                            Full View
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>

                      {isExpanded && (
                        isLoadingDetail ? (
                          <div className="flex items-center justify-center py-8 mt-4">
                            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                          </div>
                        ) : detail ? (
                          <CourseDetailPanel
                            data={detail}
                            qbData={qbCache[course.id] ?? null}
                            qbLoading={qbLoadingMap[course.id] ?? false}
                            bloomFilter={bloomFilter[course.id] ?? "Full"}
                            onBloomFilter={(level) =>
                              setBloomFilter((p) => ({ ...p, [course.id]: level }))
                            }
                            onLoadQB={(level) => handleLoadQB(course.id, level)}
                          />
                        ) : null
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}

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
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-orange-400 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <GenerateQuestionPaperModal
          courses={courses}
          preselectedCourseId={modalCourseId}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
