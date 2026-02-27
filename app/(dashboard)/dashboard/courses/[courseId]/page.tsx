"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Code2,
  GraduationCap,
  Building2,
  Calendar,
  Coins,
  Tag,
  Globe,
  Lock,
  Zap,
  RefreshCw,
  CircleCheck,
  XCircle,
  CircleDot,
  BarChart3,
  ClipboardList,
  Award,
  FileText,
  Loader2,
  ExternalLink,
  Layers,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import GenerateModal from "@/components/courses/GenerateModal";
import AgentStatusPanel from "@/components/courses/AgentStatusPanel";
import GenerationResultView from "@/components/courses/GenerationResultView";
import ExportPanel from "@/components/courses/ExportPanel";
import * as api from "@/lib/api";
import * as authLib from "@/lib/auth";
import toast from "react-hot-toast";

const REGENERATE_COMPONENTS: {
  key: api.RegenerateComponent;
  label: string;
  desc: string;
  Icon: React.ElementType;
  color: string;
}[] = [
  { key: "curriculum", label: "Curriculum", desc: "CLOs, topics, Bloom\u2019s taxonomy", Icon: BookOpen, color: "violet" },
  { key: "semester", label: "Semester Plan", desc: "16-week teaching plan", Icon: Calendar, color: "blue" },
  { key: "assessments", label: "Assessments", desc: "Quizzes, midterm, finals", Icon: ClipboardList, color: "orange" },
  { key: "obe", label: "OBE / CO-PO", desc: "NBA/NAAC mapping", Icon: Award, color: "rose" },
  { key: "analytics", label: "Analytics", desc: "Performance insights", Icon: BarChart3, color: "indigo" },
];

const TABS = ["overview", "generate", "results", "export"] as const;
type Tab = (typeof TABS)[number];

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Course data ────────────────────────────────────────────────────────────
  const [course, setCourse] = useState<api.Course | null>(null);
  const [courseLoading, setCourseLoading] = useState(true);

  // ── Generation state ───────────────────────────────────────────────────────
  const [genStatus, setGenStatus] = useState<api.GenerationStatus | null>(null);
  const [genResult, setGenResult] = useState<api.GenerationResult | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<Tab>("overview");
  const [generateOpen, setGenerateOpen] = useState(false);
  const [regenLoading, setRegenLoading] = useState<string | null>(null);

  // ── Load course ────────────────────────────────────────────────────────────
  const loadCourse = useCallback(async () => {
    const token = authLib.getAccessToken();
    if (!token) return;
    try {
      const found = await api.getCourse(token, courseId);
      setCourse(found);
      // Honour ?tab= query param first, then fall back to status-based auto-switch
      const qTab = searchParams.get("tab") as Tab | null;
      if (qTab && TABS.includes(qTab as Tab)) {
        setTab(qTab);
      } else if (found.status === "generating" || found.status === "failed") {
        setTab("generate");
      } else if (found.status === "completed" || found.status === "published") {
        setTab("results");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load course");
      router.replace("/dashboard/courses");
    } finally {
      setCourseLoading(false);
    }
  }, [courseId, router, searchParams]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  // ── Poll generation status ─────────────────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    const token = authLib.getAccessToken();
    if (!token) return;
    setStatusLoading(true);
    try {
      const s = await api.getCourseGenerationStatus(token, courseId);
      setGenStatus(s);
      if (s.status === "completed" || s.status === "failed") {
        stopPolling();
        if (s.status === "completed") {
          try {
            const r = await api.getCourseResult(token, courseId);
            setGenResult(r);
          } catch {}
          await loadCourse();
          setTab("results");
          toast.success("Generation complete!");
        } else {
          toast.error(`Generation failed: ${s.error ?? "Unknown error"}`);
        }
      }
    } catch {
      // status endpoint may not exist until generation starts
    } finally {
      setStatusLoading(false);
    }
  }, [courseId, loadCourse]);

  function startPolling() {
    stopPolling();
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, 3000);
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  useEffect(() => {
    if (course?.status === "generating") {
      setTab("generate");
      startPolling();
    }
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.status]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function handleGenerate(payload: api.GeneratePayload) {
    const token = authLib.getAccessToken()!;
    const res = await api.generateCourse(token, courseId, payload);
    toast.success(res.message);
    setTab("generate");
    setGenStatus(null);
    setGenResult(null);
    await loadCourse();
    startPolling();
  }

  async function handleRegenerate(component: api.RegenerateComponent) {
    const token = authLib.getAccessToken()!;
    setRegenLoading(component);
    try {
      const res = await api.regenerateComponent(token, courseId, component);
      toast.success(`Re-generating ${res.component}…`);
      setGenStatus(null);
      await loadCourse();
      startPolling();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to regenerate");
    } finally {
      setRegenLoading(null);
    }
  }

  async function handleRefreshStatus() {
    await fetchStatus();
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (courseLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          <p className="text-slate-400 text-sm">Loading course…</p>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const isGenerating = course.status === "generating";
  const isCompleted = course.status === "completed" || course.status === "published";
  const isFailed = course.status === "failed";
  const isDraft = course.status === "draft";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── Back + Header ─────────────────────────────────────────────── */}
      <div className="flex items-start gap-4">
        <Link
          href="/dashboard/courses"
          className="mt-1 w-8 h-8 flex-shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white truncate">{course.title}</h1>
            <CourseStatusBadge status={course.status} />
            {course.is_public ? (
              <Badge variant="green" className="gap-1">
                <Globe className="w-2.5 h-2.5" /> Public
              </Badge>
            ) : (
              <Badge variant="yellow" className="gap-1">
                <Lock className="w-2.5 h-2.5" /> Private
              </Badge>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-1 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5" />
            {course.code} &nbsp;·&nbsp; {course.program} &nbsp;·&nbsp; Sem {course.semester} &nbsp;·&nbsp; {course.credits} Credits
          </p>
        </div>
        {!isGenerating && (
          <Button
            onClick={() => setGenerateOpen(true)}
            className="flex-shrink-0 gap-2"
            variant={isCompleted ? "secondary" : "primary"}
          >
            <Zap className="w-4 h-4" />
            {isDraft ? "Generate" : isCompleted ? "Re-run" : isFailed ? "Retry" : "Generate"}
          </Button>
        )}
        {isGenerating && (
          <Button
            variant="secondary"
            onClick={handleRefreshStatus}
            loading={statusLoading}
            className="flex-shrink-0 gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        )}
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl w-fit flex-wrap">
        {TABS.map((t) => {
          const label =
            t === "generate" ? "Generation"
            : t === "results" ? "Results"
            : t === "export" ? "Export"
            : "Overview";
          const disabled = (t === "results" || t === "export") && !isCompleted;
          return (
            <button
              key={t}
              onClick={() => !disabled && setTab(t)}
              disabled={disabled}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                tab === t
                  ? "bg-violet-600/30 text-violet-300 border border-violet-500/30"
                  : disabled
                  ? "text-slate-600 cursor-not-allowed"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── OVERVIEW TAB ──────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-violet-400" />
                  Course Details
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">{course.description}</p>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                  {[
                    { icon: GraduationCap, label: "Program", val: course.program },
                    { icon: Building2, label: "Department", val: course.department },
                    { icon: Calendar, label: "Semester", val: `Semester ${course.semester}` },
                    { icon: Coins, label: "Credits", val: `${course.credits} Credits` },
                    { icon: Code2, label: "Academic Year", val: course.academic_year },
                    { icon: Layers, label: "Course Code", val: course.code },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5 text-violet-400" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wide">{item.label}</p>
                          <p className="text-sm font-medium text-white mt-0.5">{item.val}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {course.tags.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-violet-400" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Assets (if generated) */}
            {isCompleted && (
              <Card glow>
                <CardContent className="p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-white">Generated Assets</h3>
                  {course.syllabus_pdf_url ? (
                    <a
                      href={course.syllabus_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Download Syllabus PDF
                    </a>
                  ) : (
                    <p className="text-xs text-slate-500">No PDF generated yet</p>
                  )}
                  {course.presentation_urls && course.presentation_urls.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-slate-500">Presentations:</p>
                      {course.presentation_urls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Module {i + 1} Presentation
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardContent className="p-5 space-y-3">
                <h3 className="text-sm font-semibold text-white">Timeline</h3>
                {[
                  { label: "Created", val: new Date(course.created_at).toLocaleString() },
                  { label: "Updated", val: new Date(course.updated_at).toLocaleString() },
                  {
                    label: "Completed",
                    val: course.completed_at
                      ? new Date(course.completed_at).toLocaleString()
                      : "—",
                  },
                ].map((t) => (
                  <div key={t.label} className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                      {t.label}
                    </span>
                    <span className="text-xs font-medium text-white mt-0.5">{t.val}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Workflow ID */}
            {course.workflow_id && (
              <Card>
                <CardContent className="p-5">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">
                    Workflow ID
                  </p>
                  <p className="text-xs font-mono text-violet-400 break-all">
                    {course.workflow_id}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Quick generate CTA */}
            {isDraft && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-600/15 to-indigo-600/15 border border-violet-500/20">
                <Zap className="w-5 h-5 text-violet-400 mb-2" />
                <p className="text-sm font-semibold text-white mb-1">Ready to generate</p>
                <p className="text-xs text-slate-400 mb-3">
                  Launch 6 AI agents to automatically build the complete course package.
                </p>
                <Button
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => setGenerateOpen(true)}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Start Generation
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── GENERATION TAB ────────────────────────────────────────────── */}
      {tab === "generate" && (
        <div className="space-y-6">
          {/* Generating → live status */}
          {(isGenerating && genStatus) && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                  Agent Pipeline — Live Status
                </h3>
                <p className="text-[11px] text-slate-500">
                  Auto-refreshes every 3s
                </p>
              </div>
              <AgentStatusPanel
                agents={genStatus.agents}
                progress={genStatus.progress}
                overallStatus={genStatus.status}
                error={genStatus.error}
                startedAt={genStatus.started_at}
              />
              {genStatus.workflow_id && (
                <p className="text-[11px] text-slate-600 mt-2 font-mono">
                  Workflow: {genStatus.workflow_id}
                </p>
              )}
            </div>
          )}

          {/* Generating but no status yet (just started) */}
          {isGenerating && !genStatus && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
              <p className="text-slate-400 text-sm">Connecting to generation pipeline…</p>
            </div>
          )}

          {/* Draft — no generation started yet */}
          {isDraft && !genStatus && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Zap className="w-8 h-8 text-violet-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white mb-1">Course not yet generated</p>
                <p className="text-sm text-slate-400 max-w-md">
                  Kick off the AI agent pipeline to automatically generate curriculum, lesson plans,
                  assessments, OBE mappings, and analytics.
                </p>
              </div>
              <Button className="gap-2" onClick={() => setGenerateOpen(true)}>
                <Zap className="w-4 h-4" />
                Start Generation
              </Button>
            </div>
          )}

          {/* Failed */}
          {isFailed && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-5 rounded-2xl bg-red-500/10 border border-red-500/25">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-300">Generation Failed</p>
                  <p className="text-xs text-red-400/70 mt-1">
                    {course.error_message ?? "An unexpected error occurred during generation."}
                  </p>
                </div>
              </div>
              {genStatus && (
                <AgentStatusPanel
                  agents={genStatus.agents}
                  progress={genStatus.progress}
                  overallStatus={genStatus.status}
                  error={genStatus.error}
                  startedAt={genStatus.started_at}
                />
              )}
              <Button className="gap-2" onClick={() => setGenerateOpen(true)}>
                <RefreshCw className="w-4 h-4" />
                Retry Generation
              </Button>
            </div>
          )}

          {/* Completed */}
          {isCompleted && (
            <div className="space-y-6">
              {/* Success banner */}
              <div className="flex items-start gap-3 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                <CircleCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-300">Generation Complete</p>
                  <p className="text-xs text-emerald-400/70 mt-1">
                    All AI agents have successfully generated the course package.
                    {course.completed_at &&
                      ` Completed at ${new Date(course.completed_at).toLocaleString()}.`}
                  </p>
                </div>
                {course.syllabus_pdf_url && (
                  <a
                    href={course.syllabus_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0"
                  >
                    <Button variant="secondary" size="sm" className="gap-2">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Download PDF
                    </Button>
                  </a>
                )}
              </div>

              {/* View Results shortcut */}
              <div className="flex gap-3 flex-wrap">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  onClick={() => setTab("results")}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  View Full Results
                </Button>
              </div>

              {/* Per-component regenerate */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-violet-400" />
                  Regenerate by Component
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {REGENERATE_COMPONENTS.map((comp) => {
                    const Icon = comp.Icon;
                    const isLoading = regenLoading === comp.key;
                    return (
                      <button
                        key={comp.key}
                        onClick={() => handleRegenerate(comp.key)}
                        disabled={!!regenLoading}
                        className={`group flex flex-col items-start gap-2 p-4 rounded-xl border transition-all duration-200 text-left hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10 disabled:opacity-50 disabled:cursor-not-allowed bg-white/5 border-white/10`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg bg-${comp.color}-500/15 border border-${comp.color}-500/25 flex items-center justify-center`}
                        >
                          {isLoading ? (
                            <Loader2 className={`w-4 h-4 text-${comp.color}-400 animate-spin`} />
                          ) : (
                            <Icon className={`w-4 h-4 text-${comp.color}-400`} />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white group-hover:text-violet-300 transition-colors">
                            {comp.label}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{comp.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── RESULTS TAB ───────────────────────────────────────────────── */}
      {tab === "results" && (() => {
        // Build a GenerationResult from the embedded course data (GET /courses/{id})
        // or fall back to genResult from GET /courses/{id}/result if available
        const courseResult: api.GenerationResult | null = course.curriculum_data
          ? {
              workflow_id: course.workflow_id ?? "",
              course_id: course.id,
              success: true,
              generated_components: [
                ...(course.curriculum_data ? ["curriculum"] : []),
                ...(course.semester_plan_data ? ["semester_plan"] : []),
                ...(course.assessment_data ? ["assessments"] : []),
                ...(course.obe_data && Object.keys(course.obe_data).length > 0 ? ["obe_report"] : []),
                ...(course.analytics_data && Object.keys(course.analytics_data).length > 0 ? ["analytics"] : []),
              ],
              curriculum: course.curriculum_data,
              semester_plan: course.semester_plan_data,
              assessments: course.assessment_data,
              obe_report: course.obe_data,
              analytics: course.analytics_data,
              file_urls: {
                syllabus_pdf: course.syllabus_pdf_url,
                presentations: course.presentation_urls ?? [],
              },
            }
          : genResult;

        return (
          <div className="space-y-4">
            {courseResult ? (
              <GenerationResultView result={courseResult} />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                <p className="text-slate-400 text-sm">Loading results…</p>
              </div>
            )}

            {/* Regenerate component buttons */}
            {isCompleted && (
              <div className="pt-4 border-t border-white/8 space-y-3">
                <h3 className="text-xs font-semibold text-white flex items-center gap-2 uppercase tracking-wide">
                  <RefreshCw className="w-3.5 h-3.5 text-violet-400" />
                  Regenerate Individual Components
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {REGENERATE_COMPONENTS.map((comp) => {
                    const Icon = comp.Icon;
                    const isLoading = regenLoading === comp.key;
                    return (
                      <button
                        key={comp.key}
                        onClick={() => handleRegenerate(comp.key)}
                        disabled={!!regenLoading}
                        className="group flex flex-col items-start gap-2 p-3 rounded-xl border transition-all duration-200 text-left hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10 disabled:opacity-50 disabled:cursor-not-allowed bg-white/5 border-white/10"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white/8 border border-white/12 flex items-center justify-center">
                          {isLoading ? (
                            <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                          ) : (
                            <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-400 transition-colors" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white group-hover:text-violet-300 transition-colors">{comp.label}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{comp.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── EXPORT TAB ───────────────────────────────────────────────── */}
      {tab === "export" && isCompleted && (
        <ExportPanel course={course} />
      )}

      {/* ── Generate Modal ────────────────────────────────────────────── */}
      <GenerateModal
        open={generateOpen}
        courseId={course.id}
        courseTitle={course.title}
        onClose={() => setGenerateOpen(false)}
        onSubmit={handleGenerate}
      />
    </div>
  );
}

function CourseStatusBadge({ status }: { status: api.CourseStatus }) {
  const map: Record<api.CourseStatus, { label: string; variant: "yellow" | "blue" | "green" | "red" | "purple"; Icon: React.ElementType }> = {
    draft: { label: "Draft", variant: "yellow", Icon: CircleDot },
    generating: { label: "Generating", variant: "blue", Icon: Loader2 },
    completed: { label: "Completed", variant: "green", Icon: CircleCheck },
    failed: { label: "Failed", variant: "red", Icon: XCircle },
    published: { label: "Published", variant: "purple", Icon: CircleCheck },
  };
  const cfg = map[status];
  return (
    <Badge variant={cfg.variant} className="gap-1 capitalize">
      <cfg.Icon className={`w-2.5 h-2.5 ${status === "generating" ? "animate-spin" : ""}`} />
      {cfg.label}
    </Badge>
  );
}
