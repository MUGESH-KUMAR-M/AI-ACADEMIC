"use client";

import { useEffect, useState } from "react";
import {
  X,
  Zap,
  AlignLeft,
  Link2,
  Plus,
  Trash2,
  RefreshCw,
  BookOpen,
  Calendar,
  FileText,
  ClipboardList,
  Award,
  BarChart3,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GeneratePayload, GenerationMode } from "@/lib/api";

interface GenerateModalProps {
  open: boolean;
  courseId: string;
  courseTitle: string;
  onClose: () => void;
  onSubmit: (payload: GeneratePayload) => Promise<void>;
}

const MODES: { value: GenerationMode; label: string; desc: string; Icon: React.ElementType }[] = [
  {
    value: "full",
    label: "Full Package",
    desc: "All 6 agents — curriculum, semester plan, content, assessments, OBE mapping, analytics",
    Icon: Layers,
  },
  {
    value: "curriculum",
    label: "Curriculum Only",
    desc: "CLOs, topics, Bloom's taxonomy alignment",
    Icon: BookOpen,
  },
  {
    value: "semester",
    label: "Semester Plan",
    desc: "16-week teaching plan with assessment schedule",
    Icon: Calendar,
  },
  {
    value: "assessments",
    label: "Assessments",
    desc: "Quiz, midterm, final papers and question bank",
    Icon: ClipboardList,
  },
  {
    value: "obe",
    label: "OBE / CO-PO",
    desc: "CO-PO mapping for NBA/NAAC accreditation",
    Icon: Award,
  },
  {
    value: "analytics",
    label: "Analytics",
    desc: "Student performance prediction and teaching insights",
    Icon: BarChart3,
  },
];

export default function GenerateModal({
  open,
  courseId,
  courseTitle,
  onClose,
  onSubmit,
}: GenerateModalProps) {
  const [mode, setMode] = useState<GenerationMode>("full");
  const [context, setContext] = useState("");
  const [refs, setRefs] = useState<string[]>([""]);
  const [force, setForce] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setMode("full");
      setContext("");
      setRefs([""]);
      setForce(false);
    }
  }, [open]);

  function addRef() {
    setRefs((r) => [...r, ""]);
  }
  function updateRef(i: number, v: string) {
    setRefs((r) => r.map((x, idx) => (idx === i ? v : x)));
  }
  function removeRef(i: number) {
    setRefs((r) => r.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanRefs = refs.filter((r) => r.trim() !== "");
    setLoading(true);
    try {
      await onSubmit({
        course_id: courseId,
        mode,
        additional_context: context.trim() || undefined,
        reference_docs: cleanRefs.length ? cleanRefs : undefined,
        force_regenerate: force,
      });
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-slate-900 border border-white/10 shadow-2xl shadow-black/50">
        {/* Top glow bar */}
        <div className="h-1 w-full bg-gradient-to-r from-violet-600 via-indigo-500 to-blue-600" />

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Generate Course Package</h2>
              <p className="text-[11px] text-slate-500 truncate max-w-xs">{courseTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Mode selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Generation Mode</label>
            <div className="grid grid-cols-1 gap-2">
              {MODES.map((m) => {
                const Icon = m.Icon;
                return (
                  <label
                    key={m.value}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                      mode === m.value
                        ? "bg-violet-600/15 border-violet-500/40 text-violet-300"
                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/8 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="mode"
                      value={m.value}
                      checked={mode === m.value}
                      onChange={() => setMode(m.value)}
                      className="sr-only"
                    />
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        mode === m.value
                          ? "bg-violet-600/30 border border-violet-500/40"
                          : "bg-white/5 border border-white/10"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none">{m.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{m.desc}</p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${
                        mode === m.value
                          ? "border-violet-400 bg-violet-400"
                          : "border-slate-600"
                      }`}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Additional context */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
              Additional Context
              <span className="text-[10px] text-slate-500 font-normal ml-1">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Design the course with strong problem-solving emphasis, include industry-relevant case studies, align with Bloom's taxonomy…"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none"
            />
          </div>

          {/* Reference docs */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-slate-400" />
              Reference Documents
              <span className="text-[10px] text-slate-500 font-normal ml-1">(optional URLs)</span>
            </label>
            <div className="space-y-2">
              {refs.map((ref, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    type="url"
                    placeholder="https://example.com/reference.pdf"
                    value={ref}
                    onChange={(e) => updateRef(i, e.target.value)}
                    icon={<Link2 className="w-3.5 h-3.5" />}
                    className="flex-1"
                  />
                  {refs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRef(i)}
                      className="w-9 h-9 flex-shrink-0 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addRef}
                className="flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add another reference
              </button>
            </div>
          </div>

          {/* Force regenerate toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-sm font-medium text-white">Force Regenerate</p>
                <p className="text-[11px] text-slate-500">
                  Overwrite previously generated content for this course
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setForce((f) => !f)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                force ? "bg-amber-500" : "bg-white/20"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  force ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-white/10">
            <Button type="submit" size="lg" loading={loading} className="flex-1 gap-2">
              <Zap className="w-4 h-4" />
              Start Generation
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
