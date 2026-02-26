"use client";

import { useEffect, useState } from "react";
import {
  X,
  BookOpen,
  Code2,
  AlignLeft,
  GraduationCap,
  Building2,
  Hash,
  Coins,
  CalendarRange,
  Tag,
  Globe,
  Lock,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Course,
  CreateCoursePayload,
  UpdateCoursePayload,
} from "@/lib/api";

interface CourseFormModalProps {
  mode: "create" | "edit";
  course?: Course;
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateCoursePayload | UpdateCoursePayload
  ) => Promise<void>;
}

const PROGRAMS = ["B.Tech", "M.Tech", "MBA", "BCA", "MCA", "B.Sc", "M.Sc", "Ph.D"];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const empty: CreateCoursePayload = {
  title: "",
  code: "",
  description: "",
  program: "B.Tech",
  department: "",
  semester: 1,
  credits: 4,
  academic_year: "2025-2026",
  tags: [],
  is_public: false,
};

export default function CourseFormModal({
  mode,
  course,
  open,
  onClose,
  onSubmit,
}: CourseFormModalProps) {
  const [form, setForm] = useState<CreateCoursePayload>(empty);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && course) {
      setForm({
        title: course.title,
        code: course.code,
        description: course.description,
        program: course.program,
        department: course.department,
        semester: course.semester,
        credits: course.credits,
        academic_year: course.academic_year,
        tags: [...course.tags],
        is_public: course.is_public,
      });
    } else {
      setForm(empty);
    }
    setTagInput("");
  }, [open, mode, course]);

  function set<K extends keyof CreateCoursePayload>(k: K, v: CreateCoursePayload[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
    setTagInput("");
  }

  function removeTag(t: string) {
    set("tags", form.tags.filter((x) => x !== t));
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-white/10 shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {mode === "create" ? "Create New Course" : "Edit Course"}
              </h2>
              <p className="text-[11px] text-slate-500">
                {mode === "create"
                  ? "Fill in the details to create a course"
                  : `Editing: ${course?.code}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title + Code */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Input
                label="Course Title"
                placeholder="e.g. Data Structures and Algorithms"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                icon={<BookOpen className="w-3.5 h-3.5" />}
                required
              />
            </div>
            <Input
              label="Course Code"
              placeholder="e.g. CS201"
              value={form.code}
              onChange={(e) => set("code", e.target.value)}
              icon={<Code2 className="w-3.5 h-3.5" />}
              required
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief overview of the course…"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none"
              required
            />
          </div>

          {/* Program */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              Program
            </label>
            <div className="flex flex-wrap gap-2">
              {PROGRAMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => set("program", p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
                    form.program === p
                      ? "bg-violet-600/30 border-violet-500/50 text-violet-300"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Department + Academic Year */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Department"
              placeholder="e.g. Computer Science"
              value={form.department}
              onChange={(e) => set("department", e.target.value)}
              icon={<Building2 className="w-3.5 h-3.5" />}
              required
            />
            <Input
              label="Academic Year"
              placeholder="e.g. 2025-2026"
              value={form.academic_year}
              onChange={(e) => set("academic_year", e.target.value)}
              icon={<CalendarRange className="w-3.5 h-3.5" />}
              required
            />
          </div>

          {/* Semester + Credits */}
          <div className="grid grid-cols-2 gap-4">
            {/* Semester */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                Semester
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {SEMESTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("semester", s)}
                    className={`w-9 h-9 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                      form.semester === s
                        ? "bg-violet-600/30 border-violet-500/50 text-violet-300"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Credits */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-slate-400" />
                Credits
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => set("credits", Math.max(1, form.credits - 1))}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-lg font-light flex items-center justify-center"
                >
                  −
                </button>
                <span className="text-xl font-bold text-white w-8 text-center">
                  {form.credits}
                </span>
                <button
                  type="button"
                  onClick={() => set("credits", Math.min(10, form.credits + 1))}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-lg font-light flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Tags
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Type tag and press Enter or comma"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                />
              </div>
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2.5 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 hover:bg-violet-600/30 hover:text-violet-300 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {form.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/25 text-xs text-violet-300"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="text-violet-400 hover:text-white ml-0.5 leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              {form.is_public ? (
                <Globe className="w-4 h-4 text-emerald-400" />
              ) : (
                <Lock className="w-4 h-4 text-slate-400" />
              )}
              <div>
                <p className="text-sm font-medium text-white">
                  {form.is_public ? "Public Course" : "Private Course"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {form.is_public
                    ? "Visible to all users in your institution"
                    : "Only visible to you"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => set("is_public", !form.is_public)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                form.is_public ? "bg-emerald-500" : "bg-white/20"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  form.is_public ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-white/10">
            <Button type="submit" loading={loading} size="lg" className="flex-1">
              {mode === "create" ? "Create Course" : "Save Changes"}
            </Button>
            <Button type="button" variant="ghost" size="lg" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
