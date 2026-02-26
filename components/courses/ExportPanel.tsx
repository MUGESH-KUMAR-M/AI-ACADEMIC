"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Package,
  ClipboardList,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Loader2,
  FileBadge,
  Archive,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import * as api from "@/lib/api";
import * as authLib from "@/lib/auth";
import toast from "react-hot-toast";

// ── trigger browser save dialog ───────────────────────────────────────────────
function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ── single export card ────────────────────────────────────────────────────────
interface ExportCardProps {
  title: string;
  description: string;
  fileType: string;
  Icon: React.ElementType;
  accentFrom: string;
  accentTo: string;
  shadowColor: string;
  badgeColor: string;
  children?: React.ReactNode;
  onDownload: () => Promise<void>;
  loading: boolean;
  disabled?: boolean;
  disabledMsg?: string;
}

function ExportCard({
  title,
  description,
  fileType,
  Icon,
  accentFrom,
  accentTo,
  shadowColor,
  badgeColor,
  children,
  onDownload,
  loading,
  disabled,
  disabledMsg,
}: ExportCardProps) {
  return (
    <Card glow className="group transition-all duration-300 hover:border-white/20">
      <CardContent className="p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${accentFrom} ${accentTo} flex items-center justify-center flex-shrink-0 shadow-lg ${shadowColor} group-hover:scale-105 transition-transform duration-300`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <span
                className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${badgeColor}`}
              >
                {fileType}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Optional selector slot */}
        {children && <div>{children}</div>}

        {/* Download button */}
        {disabled ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
            <ClipboardList className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <p className="text-xs text-slate-500">{disabledMsg ?? "Not available"}</p>
          </div>
        ) : (
          <Button
            onClick={onDownload}
            disabled={loading}
            className={`gap-2 w-full justify-center bg-gradient-to-r ${accentFrom} ${accentTo} hover:opacity-90 border-0 text-sm font-semibold`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {loading ? "Preparing…" : `Download ${fileType}`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ── main panel ────────────────────────────────────────────────────────────────
interface ExportPanelProps {
  course: api.Course;
}

export default function ExportPanel({ course }: ExportPanelProps) {
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [qpIndex, setQpIndex] = useState(0);

  const assessments = course.assessment_data?.assessments ?? [];
  const hasAssessments = assessments.length > 0;

  function setLoading(key: string, val: boolean) {
    setLoadingMap((prev) => ({ ...prev, [key]: val }));
  }

  async function download(
    key: string,
    fn: (token: string) => Promise<{ blob: Blob; filename: string }>
  ) {
    const token = authLib.getAccessToken();
    if (!token) return;
    setLoading(key, true);
    try {
      const { blob, filename } = await fn(token);
      saveBlob(blob, filename);
      toast.success(`${filename} downloaded`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    } finally {
      setLoading(key, false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Section header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileBadge className="w-5 h-5 text-violet-400" />
            Export Documents
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Download course materials as publication-ready PDF files
          </p>
        </div>
        {/* Bundle shortcut */}
        <Button
          variant="secondary"
          disabled={loadingMap["bundle"]}
          onClick={() => download("bundle", (t) => api.exportBundle(t, course.id))}
          className="gap-2 flex-shrink-0"
        >
          {loadingMap["bundle"] ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Archive className="w-4 h-4" />
          )}
          {loadingMap["bundle"] ? "Zipping…" : "Download All (ZIP)"}
        </Button>
      </div>

      {/* ── 4 export cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1 — Syllabus */}
        <ExportCard
          title="Course Syllabus"
          description="Complete course outline with CLOs, modules, teaching hours, and Bloom's taxonomy mapping. Ready to distribute to students."
          fileType="PDF"
          Icon={BookOpen}
          accentFrom="from-violet-600"
          accentTo="to-indigo-600"
          shadowColor="shadow-violet-500/30"
          badgeColor="bg-violet-500/15 text-violet-300 border border-violet-500/25"
          loading={!!loadingMap["syllabus"]}
          onDownload={() => download("syllabus", (t) => api.exportSyllabus(t, course.id))}
        />

        {/* 2 — OBE Report */}
        <ExportCard
          title="OBE / CO-PO Report"
          description="Outcome-based education report with CO-PO attainment matrix, NBA/NAAC compliance documentation and programme outcome mapping."
          fileType="PDF"
          Icon={Award}
          accentFrom="from-rose-600"
          accentTo="to-pink-600"
          shadowColor="shadow-rose-500/30"
          badgeColor="bg-rose-500/15 text-rose-300 border border-rose-500/25"
          loading={!!loadingMap["obe"]}
          onDownload={() => download("obe", (t) => api.exportObeReport(t, course.id))}
        />

        {/* 3 — Question Paper */}
        <ExportCard
          title="Question Paper"
          description="Formatted question paper for the selected assessment with section-wise questions, marks distribution, and answer key."
          fileType="PDF"
          Icon={FileText}
          accentFrom="from-orange-600"
          accentTo="to-amber-600"
          shadowColor="shadow-orange-500/30"
          badgeColor="bg-orange-500/15 text-orange-300 border border-orange-500/25"
          loading={!!loadingMap["qp"]}
          disabled={!hasAssessments}
          disabledMsg="Generate the course first to unlock question papers"
          onDownload={() =>
            download("qp", (t) => api.exportQuestionPaper(t, course.id, qpIndex))
          }
        >
          {hasAssessments && (
            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">Select Assessment</p>
              <div className="relative">
                <select
                  value={qpIndex}
                  onChange={(e) => setQpIndex(Number(e.target.value))}
                  className="w-full appearance-none bg-white/6 border border-white/12 rounded-xl px-3 py-2.5 text-sm text-white pr-8 cursor-pointer focus:outline-none focus:border-violet-500/50 transition-colors"
                >
                  {(assessments as { assessment_title?: string }[]).map((a, i) => (
                    <option key={i} value={i} className="bg-slate-900">
                      {i + 1}. {a.assessment_title ?? `Assessment ${i + 1}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}
        </ExportCard>

        {/* 4 — Full Bundle */}
        <ExportCard
          title="Complete Course Bundle"
          description="All documents packaged into a single ZIP archive — syllabus, OBE report, and all question papers. Ideal for academic records."
          fileType="ZIP"
          Icon={Package}
          accentFrom="from-emerald-600"
          accentTo="to-teal-600"
          shadowColor="shadow-emerald-500/30"
          badgeColor="bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
          loading={!!loadingMap["bundle2"]}
          onDownload={() => download("bundle2", (t) => api.exportBundle(t, course.id))}
        />
      </div>

      {/* ── What's included ─────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wide mb-4 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            What&apos;s Included in Each Export
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                icon: BookOpen,
                title: "Syllabus PDF",
                items: ["Course Learning Outcomes (CLOs)", "Module-wise topic breakdown", "Teaching hour allocation", "Bloom's level per CLO"],
                color: "text-violet-400",
              },
              {
                icon: Award,
                title: "OBE Report PDF",
                items: ["CO-PO attainment matrix", "Program Outcome coverage", "NBA/NAAC compliance", "Assessment CO mapping"],
                color: "text-rose-400",
              },
              {
                icon: FileText,
                title: "Question Paper PDF",
                items: ["Section-wise questions", "Marks distribution", "Bloom's level tags", "Answer key (optional)"],
                color: "text-orange-400",
              },
              {
                icon: Package,
                title: "Bundle ZIP",
                items: ["All PDFs in one archive", "Organised folder structure", "Version-stamped filenames", "Ready for HoD submission"],
                color: "text-emerald-400",
              },
            ].map(({ icon: Icon, title, items, color }) => (
              <div key={title} className="p-4 rounded-xl bg-white/4 border border-white/8 space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <p className="text-xs font-semibold text-white">{title}</p>
                </div>
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <CheckCircle2 className="w-2.5 h-2.5 text-slate-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
