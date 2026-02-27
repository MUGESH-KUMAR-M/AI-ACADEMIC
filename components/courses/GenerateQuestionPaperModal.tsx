"use client";

import { useCallback, useEffect, useState } from "react";
import {
  X,
  FileText,
  ChevronRight,
  ChevronLeft,
  Download,
  Loader2,
  GraduationCap,
  Clock,
  Hash,
  Layers,
  ClipboardList,
  CheckCircle2,
  Lightbulb,
  BookOpen,
  AlertCircle,
  Building2,
  Calendar,
  AlignLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import * as api from "@/lib/api";
import * as authLib from "@/lib/auth";
import toast from "react-hot-toast";

// ── Exam type accent colours ──────────────────────────────────────────────────
const EXAM_COLORS: Record<string, { from: string; to: string; border: string; text: string; icon: string }> = {
  "CIA-1":        { from: "from-violet-600/25", to: "to-indigo-600/25",  border: "border-violet-500/40",  text: "text-violet-300",  icon: "bg-violet-500/20"  },
  "CIA-2":        { from: "from-blue-600/25",   to: "to-cyan-600/25",    border: "border-blue-500/40",    text: "text-blue-300",    icon: "bg-blue-500/20"    },
  "Model Exam":   { from: "from-amber-600/25",  to: "to-orange-600/25",  border: "border-amber-500/40",   text: "text-amber-300",   icon: "bg-amber-500/20"   },
  "End Semester": { from: "from-red-600/25",    to: "to-rose-600/25",    border: "border-red-500/40",     text: "text-red-300",     icon: "bg-red-500/20"     },
  "Lab Record":   { from: "from-emerald-600/25",to: "to-teal-600/25",    border: "border-emerald-500/40", text: "text-emerald-300", icon: "bg-emerald-500/20" },
  "Assignment":   { from: "from-pink-600/25",   to: "to-fuchsia-600/25", border: "border-pink-500/40",    text: "text-pink-300",    icon: "bg-pink-500/20"    },
  "Quiz":         { from: "from-sky-600/25",    to: "to-cyan-600/25",    border: "border-sky-500/40",     text: "text-sky-300",     icon: "bg-sky-500/20"     },
  "Viva":         { from: "from-slate-600/25",  to: "to-slate-500/25",   border: "border-slate-500/40",   text: "text-slate-300",   icon: "bg-slate-500/20"   },
};
const DEFAULT_COLOR = { from: "from-violet-600/20", to: "to-indigo-600/20", border: "border-violet-500/30", text: "text-violet-300", icon: "bg-violet-500/15" };

const DIFFICULTY_OPTIONS: { value: api.QuestionPaperPayload["difficulty"]; label: string; desc: string }[] = [
  { value: "easy",   label: "Easy",   desc: "Recall & comprehension" },
  { value: "medium", label: "Medium", desc: "Application & analysis" },
  { value: "hard",   label: "Hard",   desc: "Evaluation & creation" },
  { value: "mixed",  label: "Mixed",  desc: "All Bloom levels (recommended)" },
];

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  courses: api.Course[];
  onClose: () => void;
  preselectedCourseId?: string;
}

type Step = 1 | 2 | 3;

export function GenerateQuestionPaperModal({ courses, onClose, preselectedCourseId }: Props) {
  const [step, setStep] = useState<Step>(preselectedCourseId ? 2 : 1);
  const [examTypes, setExamTypes] = useState<api.ExamTypesResponse["exam_types"]>({});
  const [examTypesLoading, setExamTypesLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [includeHints, setIncludeHints] = useState(false);

  // Step 1 state
  const [selectedCourseId, setSelectedCourseId] = useState(preselectedCourseId ?? "");

  // Step 2 state
  const [selectedExamType, setSelectedExamType] = useState("");

  // Step 3 form state
  const [form, setForm] = useState({
    department:       "",
    institution_name: "",
    academic_year:    "2025-2026",
    subject_code:     "",
    modules_covered:  "",
    duration_minutes: 90,
    total_marks:      50,
    instructions:     "",
    difficulty:       "mixed" as api.QuestionPaperPayload["difficulty"],
    additional_context: "",
  });

  // Load exam types once
  useEffect(() => {
    api.getExamTypes()
      .then((res) => setExamTypes(res.exam_types))
      .catch(() => toast.error("Failed to load exam types"))
      .finally(() => setExamTypesLoading(false));
  }, []);

  // Pre-fill form from selected course + exam type
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const examConfig = examTypes[selectedExamType];

  const prefillFromExamType = useCallback((cfg: api.ExamTypeConfig) => {
    setForm((f) => ({
      ...f,
      duration_minutes: cfg.duration_minutes ?? f.duration_minutes,
      total_marks:       cfg.total_marks      ?? f.total_marks,
      modules_covered:   cfg.modules_covered  ?? f.modules_covered,
      instructions:      cfg.instructions     ?? f.instructions,
    }));
  }, []);

  function handleSelectExamType(name: string) {
    setSelectedExamType(name);
    const cfg = examTypes[name];
    if (cfg) prefillFromExamType(cfg);
    // Pre-fill from course
    if (selectedCourse) {
      setForm((f) => ({
        ...f,
        department:   f.department   || selectedCourse.department,
        subject_code: f.subject_code || selectedCourse.code,
        academic_year: f.academic_year || selectedCourse.academic_year,
      }));
    }
  }

  function setField<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleGenerate() {
    if (!selectedCourseId || !selectedExamType) return;
    const token = authLib.getAccessToken();
    if (!token) { toast.error("Not authenticated"); return; }

    setGenerating(true);
    try {
      const { blob, filename } = await api.generateQuestionPaper(
        token,
        {
          course_id:         selectedCourseId,
          exam_type:         selectedExamType,
          department:        form.department,
          institution_name:  form.institution_name,
          academic_year:     form.academic_year,
          subject_code:      form.subject_code,
          modules_covered:   form.modules_covered,
          duration_minutes:  Number(form.duration_minutes),
          total_marks:       Number(form.total_marks),
          instructions:      form.instructions,
          difficulty:        form.difficulty,
          additional_context: form.additional_context || undefined,
          export_format:     "pdf",
        },
        includeHints
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || `${selectedExamType.replace(/\s+/g, "_")}_${form.subject_code}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${selectedExamType} paper downloaded!`);
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  const examTypeNames = Object.keys(examTypes);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Generate Question Paper</h2>
              <p className="text-[10px] text-slate-500">
                Step {step} of 3 — {step === 1 ? "Select Course" : step === 2 ? "Choose Exam Type" : "Paper Details"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step progress */}
        <div className="flex gap-1 px-6 pt-4 pb-0 flex-shrink-0">
          {([1, 2, 3] as const).map((s) => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-all ${s <= step ? "bg-orange-500" : "bg-white/10"}`} />
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* ── Step 1: Select Course ─────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">Choose the course to generate a question paper for.</p>
              <div className="space-y-2">
                {courses.length === 0 && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/3 border border-white/8 text-slate-500 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    No courses found. Create a course first.
                  </div>
                )}
                {courses.map((c) => {
                  const selected = selectedCourseId === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCourseId(c.id)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 ${
                        selected
                          ? "bg-gradient-to-r from-orange-600/20 to-amber-600/20 border-orange-500/40"
                          : "bg-white/3 border-white/8 hover:bg-white/6 hover:border-white/15"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${selected ? "bg-orange-500/20" : "bg-white/5"}`}>
                        <BookOpen className={`w-4 h-4 ${selected ? "text-orange-300" : "text-slate-500"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${selected ? "text-orange-200" : "text-slate-200"}`}>{c.title}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{c.code} · {c.department}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-slate-500">Sem {c.semester}</span>
                        {selected && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Step 2: Select Exam Type ──────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">Select the exam type. Paper structure will be pre-filled automatically.</p>
              {selectedCourse && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500/8 border border-orange-500/20">
                  <BookOpen className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                  <span className="text-xs text-orange-300 font-semibold truncate">{selectedCourse.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">{selectedCourse.code}</span>
                </div>
              )}
              {examTypesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                  <span className="ml-2 text-xs text-slate-400">Loading exam types…</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {examTypeNames.map((name) => {
                    const cfg = examTypes[name];
                    const col = EXAM_COLORS[name] ?? DEFAULT_COLOR;
                    const active = selectedExamType === name;
                    return (
                      <button
                        key={name}
                        onClick={() => handleSelectExamType(name)}
                        className={`flex flex-col gap-2 p-3.5 rounded-xl border text-left transition-all duration-200 ${
                          active
                            ? `bg-gradient-to-br ${col.from} ${col.to} ${col.border}`
                            : "bg-white/3 border-white/8 hover:bg-white/6 hover:border-white/15"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-bold ${active ? col.text : "text-slate-200"}`}>{name}</p>
                          {active && <CheckCircle2 className={`w-3.5 h-3.5 ${col.text} flex-shrink-0`} />}
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
                          {cfg.total_marks != null && (
                            <span className="flex items-center gap-1"><Hash className="w-2.5 h-2.5" />{cfg.total_marks} marks</span>
                          )}
                          {cfg.duration_minutes != null && (
                            <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{cfg.duration_minutes} min</span>
                          )}
                          {cfg.modules_covered && (
                            <span className="flex items-center gap-1"><Layers className="w-2.5 h-2.5" />{cfg.modules_covered}</span>
                          )}
                        </div>
                        {cfg.parts.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {cfg.parts.map((p) => (
                              <span key={p.label} className={`text-[9px] px-1.5 py-0.5 rounded-full border ${active ? `${col.icon} ${col.border} ${col.text}` : "bg-white/5 border-white/10 text-slate-500"}`}>
                                {p.label}: {p.num_questions}×{p.marks_each}m
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Exam type detail preview */}
              {selectedExamType && examConfig && (
                <div className="p-4 rounded-xl bg-white/4 border border-white/10 space-y-2 mt-1">
                  <p className="text-xs font-semibold text-white flex items-center gap-2">
                    <ClipboardList className="w-3.5 h-3.5 text-orange-400" />
                    {selectedExamType} — Instructions
                  </p>
                  {examConfig.instructions && (
                    <p className="text-[11px] text-slate-400 leading-relaxed">{examConfig.instructions}</p>
                  )}
                  {examConfig.parts.length > 0 && (
                    <div className="grid grid-cols-1 gap-1.5 pt-1">
                      {examConfig.parts.map((p) => (
                        <div key={p.label} className="flex items-center gap-2 text-[10px]">
                          <span className="font-semibold text-orange-300 w-14 flex-shrink-0">{p.label}</span>
                          <span className="text-slate-400">{p.type}</span>
                          <span className="ml-auto text-slate-500">
                            {p.num_questions} Qs × {p.marks_each}m
                            {p.choose ? ` (answer ${p.choose})` : ""}
                            {p.either_or ? " (either/or)" : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Paper Details Form ────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Review and customise the paper details. Fields are pre-filled from the exam type and course.
              </p>

              {/* Selected course + exam type reminder */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/8 border border-orange-500/20">
                <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <p className="text-xs text-orange-300">
                  <span className="font-semibold">{selectedCourse?.title}</span>
                  {" "}&mdash; <span className="font-semibold">{selectedExamType}</span>
                </p>
              </div>

              {/* Institution + Department */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input
                    label="Institution Name"
                    placeholder="My University"
                    value={form.institution_name}
                    onChange={(e) => setField("institution_name", e.target.value)}
                    icon={<Building2 className="w-4 h-4" />}
                  />
                </div>
                <div>
                  <Input
                    label="Department"
                    placeholder="Computer Science & Engineering"
                    value={form.department}
                    onChange={(e) => setField("department", e.target.value)}
                    icon={<GraduationCap className="w-4 h-4" />}
                  />
                </div>
              </div>

              {/* Subject code + Academic year */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input
                    label="Subject Code"
                    placeholder="CS201"
                    value={form.subject_code}
                    onChange={(e) => setField("subject_code", e.target.value)}
                    icon={<Hash className="w-4 h-4" />}
                  />
                </div>
                <div>
                  <Input
                    label="Academic Year"
                    placeholder="2025-2026"
                    value={form.academic_year}
                    onChange={(e) => setField("academic_year", e.target.value)}
                    icon={<Calendar className="w-4 h-4" />}
                  />
                </div>
              </div>

              {/* Duration + Total Marks */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input
                    label="Duration (minutes)"
                    type="number"
                    placeholder="90"
                    value={String(form.duration_minutes)}
                    onChange={(e) => setField("duration_minutes", Number(e.target.value))}
                    icon={<Clock className="w-4 h-4" />}
                  />
                </div>
                <div>
                  <Input
                    label="Total Marks"
                    type="number"
                    placeholder="50"
                    value={String(form.total_marks)}
                    onChange={(e) => setField("total_marks", Number(e.target.value))}
                    icon={<Hash className="w-4 h-4" />}
                  />
                </div>
              </div>

              {/* Modules covered */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-500" />
                  Modules Covered
                </label>
                <textarea
                  rows={2}
                  value={form.modules_covered}
                  onChange={(e) => setField("modules_covered", e.target.value)}
                  placeholder="e.g. Module 1: Introduction to Data Structures, Module 2: Arrays and Linked Lists"
                  className="w-full bg-slate-900/80 border border-white/12 rounded-xl px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-violet-500/50 transition-colors placeholder:text-slate-600"
                />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-slate-500" />
                  Instructions
                </label>
                <textarea
                  rows={2}
                  value={form.instructions}
                  onChange={(e) => setField("instructions", e.target.value)}
                  placeholder="Answer all questions. Assume suitable data where necessary."
                  className="w-full bg-slate-900/80 border border-white/12 rounded-xl px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-violet-500/50 transition-colors placeholder:text-slate-600"
                />
              </div>

              {/* Difficulty */}
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-slate-300">Difficulty</p>
                <div className="grid grid-cols-4 gap-2">
                  {DIFFICULTY_OPTIONS.map(({ value, label, desc }) => {
                    const active = form.difficulty === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setField("difficulty", value)}
                        className={`flex flex-col gap-0.5 p-2.5 rounded-xl border text-left transition-all ${
                          active
                            ? "bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border-violet-500/40"
                            : "bg-white/3 border-white/8 hover:bg-white/6"
                        }`}
                      >
                        <span className={`text-xs font-semibold ${active ? "text-violet-300" : "text-slate-300"}`}>{label}</span>
                        <span className="text-[9px] text-slate-600 leading-tight">{desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional context */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-slate-500" />
                  Additional Context
                  <span className="text-[10px] text-slate-600 font-normal ml-1">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={form.additional_context}
                  onChange={(e) => setField("additional_context", e.target.value)}
                  placeholder="Include conceptual and problem-solving questions aligned with Bloom levels…"
                  className="w-full bg-slate-900/80 border border-white/12 rounded-xl px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-violet-500/50 transition-colors placeholder:text-slate-600"
                />
              </div>

              {/* Answer hints toggle */}
              <div
                onClick={() => setIncludeHints((v) => !v)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none ${
                  includeHints
                    ? "bg-emerald-600/12 border-emerald-500/25"
                    : "bg-white/3 border-white/8 hover:bg-white/6"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${includeHints ? "bg-emerald-500/20" : "bg-white/5"}`}>
                  <Lightbulb className={`w-4 h-4 ${includeHints ? "text-emerald-400" : "text-slate-500"}`} />
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-semibold ${includeHints ? "text-emerald-300" : "text-slate-300"}`}>
                    Include Answer Hints
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Append model answer pointers to each question</p>
                </div>
                <div className={`w-8 h-4 rounded-full transition-all flex-shrink-0 ${includeHints ? "bg-emerald-500" : "bg-white/15"}`}>
                  <div className={`w-3.5 h-3.5 rounded-full bg-white shadow transition-transform m-px ${includeHints ? "translate-x-3.5" : "translate-x-0"}`} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/8 flex-shrink-0">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <Button
              onClick={() => setStep((s) => (s + 1) as Step)}
              disabled={step === 1 ? !selectedCourseId : !selectedExamType}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              loading={generating}
              className="gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500"
              disabled={!form.institution_name || !form.department || !form.subject_code}
            >
              <Download className="w-3.5 h-3.5" />
              Generate & Download PDF
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
