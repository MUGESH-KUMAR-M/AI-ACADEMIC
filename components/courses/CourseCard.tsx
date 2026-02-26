import {
  BookOpen,
  Code2,
  GraduationCap,
  Building2,
  Calendar,
  Coins,
  Tag,
  Globe,
  Lock,
  MoreVertical,
  Pencil,
  Trash2,
  CircleDot,
  CircleCheck,
  CircleAlert,
  Loader2,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Course } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { useState, useRef, useEffect } from "react";

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
}

const statusConfig: Record<
  Course["status"],
  { label: string; variant: "purple" | "blue" | "green" | "red" | "yellow"; Icon: React.ElementType }
> = {
  draft: { label: "Draft", variant: "yellow", Icon: CircleDot },
  generating: { label: "Generating", variant: "blue", Icon: Loader2 },
  completed: { label: "Completed", variant: "green", Icon: CircleCheck },
  failed: { label: "Failed", variant: "red", Icon: CircleAlert },
  published: { label: "Published", variant: "purple", Icon: CircleCheck },
};

const programColors: Record<string, string> = {
  "B.Tech": "from-violet-500 to-indigo-600",
  "M.Tech": "from-blue-500 to-cyan-600",
  MBA: "from-emerald-500 to-teal-600",
  BCA: "from-orange-500 to-amber-600",
  MCA: "from-rose-500 to-pink-600",
};

export default function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const bg = programColors[course.program] ?? "from-slate-500 to-slate-600";
  const { label, variant, Icon } = statusConfig[course.status];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="group relative rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Top colour bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${bg}`} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${bg} flex items-center justify-center flex-shrink-0 shadow-lg`}
            >
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <Link href={`/dashboard/courses/${course.id}`}>
              <h3 className="font-semibold text-white text-sm leading-snug hover:text-violet-300 transition-colors line-clamp-2 cursor-pointer">
                {course.title}
              </h3>
              <span className="inline-flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                <Code2 className="w-3 h-3" />
                {course.code}
              </span>
              </Link>
            </div>
          </div>

          {/* Menu */}
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 w-36 rounded-xl bg-slate-900 border border-white/10 shadow-2xl shadow-black/50 z-20 overflow-hidden">
                <button
                  onClick={() => { setMenuOpen(false); onEdit(course); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5 text-violet-400" />
                  Edit
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(course); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
          {course.description}
        </p>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: GraduationCap, label: course.program },
            { icon: Building2, label: course.department },
            { icon: Calendar, label: `Sem ${course.semester} · ${course.academic_year}` },
            { icon: Coins, label: `${course.credits} Credits` },
          ].map((item) => {
            const ItemIcon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-1.5 text-[11px] text-slate-400"
              >
                <ItemIcon className="w-3 h-3 text-slate-500 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Tags */}
        {course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {course.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] text-violet-300 font-medium"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
            {course.tags.length > 3 && (
              <span className="text-[10px] text-slate-500">+{course.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Progress bar (if generating) */}
        {course.status === "generating" && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Generating…
              </span>
              <span className="text-violet-400 font-medium">
                {course.generation_progress}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${course.generation_progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
        <Badge variant={variant} className="gap-1">
          <Icon
            className={`w-2.5 h-2.5 ${course.status === "generating" ? "animate-spin" : ""}`}
          />
          {label}
        </Badge>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            {course.is_public ? (
              <>
                <Globe className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-500">Public</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" />
                Private
              </>
            )}
          </div>
          <Link
            href={`/dashboard/courses/${course.id}`}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-[11px] text-violet-400 hover:bg-violet-500/20 hover:text-violet-300 transition-all font-medium"
          >
            Open <ArrowRight className="w-2.5 h-2.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
