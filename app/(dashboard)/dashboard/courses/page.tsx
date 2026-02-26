"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Grid3x3,
  List,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Layers,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import CourseCard from "@/components/courses/CourseCard";
import CourseFormModal from "@/components/courses/CourseFormModal";
import DeleteConfirmModal from "@/components/courses/DeleteConfirmModal";
import * as api from "@/lib/api";
import * as authLib from "@/lib/auth";
import toast from "react-hot-toast";
import { Course, CourseFilters, CreateCoursePayload, UpdateCoursePayload } from "@/lib/api";

const PROGRAMS = ["B.Tech", "M.Tech", "MBA", "BCA", "MCA", "B.Sc", "M.Sc", "Ph.D"];
const STATUS_OPTIONS: { label: string; value: api.CourseStatus }[] = [
  { label: "Draft", value: "draft" },
  { label: "Generating", value: "generating" },
  { label: "Completed", value: "completed" },
  { label: "Published", value: "published" },
  { label: "Failed", value: "failed" },
];

export default function CoursesPage() {
  // ── Data state ────────────────────────────────────────────────────────────
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [program, setProgram] = useState("");
  const [status, setStatus] = useState<api.CourseStatus | "">("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  // ── View ──────────────────────────────────────────────────────────────────
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);

  // ── Modals ────────────────────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Course | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchCourses = useCallback(
    async (silent = false) => {
      const token = authLib.getAccessToken();
      if (!token) return;
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const filters: CourseFilters = {
          page,
          page_size: PAGE_SIZE,
          ...(search ? { search } : {}),
          ...(program ? { program } : {}),
          ...(status ? { status } : {}),
        };
        const res = await api.listCourses(token, filters);
        setCourses(res.items);
        setTotal(res.total);
        setTotalPages(res.total_pages);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to load courses");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, program, status]
  );

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Debounce search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function handleCreate(data: CreateCoursePayload | UpdateCoursePayload) {
    const token = authLib.getAccessToken()!;
    const created = await api.createCourse(token, data as CreateCoursePayload);
    toast.success(`"${created.title}" created!`);
    await fetchCourses(true);
  }

  async function handleUpdate(data: CreateCoursePayload | UpdateCoursePayload) {
    if (!editTarget) return;
    const token = authLib.getAccessToken()!;
    const updated = await api.updateCourse(token, editTarget.id, data as UpdateCoursePayload);
    toast.success(`"${updated.title}" updated!`);
    setEditTarget(null);
    await fetchCourses(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const token = authLib.getAccessToken()!;
    await api.deleteCourse(token, deleteTarget.id);
    toast.success(`"${deleteTarget.title}" deleted`);
    setDeleteTarget(null);
    await fetchCourses(true);
  }

  function clearFilters() {
    setProgram("");
    setStatus("");
    setSearchInput("");
    setPage(1);
  }

  const hasFilters = !!search || !!program || !!status;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-violet-400" />
            Courses
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage and generate AI-powered course packages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchCourses(true)}
            className={`w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all ${refreshing ? "animate-spin text-violet-400" : ""}`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Course
          </Button>
        </div>
      </div>

      {/* ── Stats Bar ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Courses", value: total, icon: Layers, color: "violet" },
          {
            label: "Draft",
            value: courses.filter((c) => c.status === "draft").length,
            icon: BookOpen,
            color: "yellow",
          },
          {
            label: "Completed",
            value: courses.filter((c) => c.status === "completed").length,
            icon: GraduationCap,
            color: "green",
          },
          {
            label: "Generating",
            value: courses.filter((c) => c.status === "generating").length,
            icon: RefreshCw,
            color: "blue",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl bg-${s.color}-500/15 border border-${s.color}-500/20 flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className={`w-4 h-4 text-${s.color}-400`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white leading-none">{s.value}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title, code, description…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <button
            onClick={() => setFilterOpen((p) => !p)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              filterOpen || hasFilters
                ? "bg-violet-600/20 border-violet-500/40 text-violet-300"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasFilters && (
              <span className="w-4 h-4 rounded-full bg-violet-500 text-white text-[9px] flex items-center justify-center font-bold">
                {[!!search, !!program, !!status].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* View toggle */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={`px-3 py-2.5 transition-all ${
                view === "grid" ? "bg-violet-600/30 text-violet-300" : "text-slate-400 hover:text-white"
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-2.5 transition-all border-l border-white/10 ${
                view === "list" ? "bg-violet-600/30 text-violet-300" : "text-slate-400 hover:text-white"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Filter Panel ─────────────────────────────────────────────────── */}
      {filterOpen && (
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-violet-400" />
              Filter Courses
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Program filter */}
            <div>
              <p className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                <GraduationCap className="w-3 h-3" /> Program
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PROGRAMS.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setProgram(program === p ? "" : p); setPage(1); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      program === p
                        ? "bg-violet-600/30 border-violet-500/50 text-violet-300"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Status filter */}
            <div>
              <p className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                <Layers className="w-3 h-3" /> Status
              </p>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => { setStatus(status === s.value ? "" : s.value); setPage(1); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      status === s.value
                        ? "bg-violet-600/30 border-violet-500/50 text-violet-300"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Active filter chips ───────────────────────────────────────────── */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Active filters:</span>
          {search && (
            <Badge variant="purple" className="gap-1 cursor-pointer" onClick={() => setSearchInput("")}>
              Search: {search} <X className="w-2.5 h-2.5" />
            </Badge>
          )}
          {program && (
            <Badge variant="blue" className="gap-1 cursor-pointer" onClick={() => setProgram("")}>
              {program} <X className="w-2.5 h-2.5" />
            </Badge>
          )}
          {status && (
            <Badge variant="yellow" className="gap-1 cursor-pointer" onClick={() => setStatus("")}>
              {status} <X className="w-2.5 h-2.5" />
            </Badge>
          )}
        </div>
      )}

      {/* ── Course Grid / List ────────────────────────────────────────────── */}
      {loading ? (
        <div
          className={`grid gap-4 ${
            view === "grid"
              ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
              : "grid-cols-1"
          }`}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white/5 border border-white/10 h-60 animate-pulse"
            />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-lg font-semibold text-white mb-1">
            {hasFilters ? "No courses match your filters" : "No courses yet"}
          </p>
          <p className="text-sm text-slate-500 mb-6 max-w-sm">
            {hasFilters
              ? "Try adjusting your search or filters to find what you're looking for."
              : "Create your first course and let AI agents generate the complete academic package."}
          </p>
          {hasFilters ? (
            <Button variant="secondary" onClick={clearFilters} className="gap-2">
              <X className="w-4 h-4" />
              Clear Filters
            </Button>
          ) : (
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create First Course
            </Button>
          )}
        </div>
      ) : (
        <div
          className={`grid gap-4 ${
            view === "grid"
              ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
              : "grid-cols-1"
          }`}
        >
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="text-white font-medium">
              {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, total)}
            </span>{" "}
            of <span className="text-white font-medium">{total}</span> courses
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                if (idx > 0 && (arr[idx - 1] as number) + 1 < p) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="text-slate-600 text-xs px-1">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-8 h-8 rounded-xl text-xs font-medium border transition-all ${
                      page === p
                        ? "bg-violet-600/30 border-violet-500/40 text-violet-300"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <CourseFormModal
        mode="create"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
      <CourseFormModal
        mode="edit"
        course={editTarget ?? undefined}
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdate}
      />
      <DeleteConfirmModal
        course={deleteTarget}
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
