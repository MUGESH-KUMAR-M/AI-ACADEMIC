"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Course } from "@/lib/api";

interface DeleteConfirmModalProps {
  course: Course | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteConfirmModal({
  course,
  open,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  if (!open || !course) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
        {/* Top danger bar */}
        <div className="h-1 w-full bg-gradient-to-r from-red-600 to-rose-600" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Delete Course</h2>
              <p className="text-[11px] text-slate-500">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-slate-400 mb-1">Course to be deleted</p>
            <p className="text-sm font-semibold text-white">{course.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {course.code} · {course.program} · Sem {course.semester}
            </p>
          </div>

          <p className="text-sm text-slate-400">
            Permanently deleting this course will remove all associated content, assets,
            and generation history. Are you sure you want to continue?
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              variant="danger"
              size="lg"
              loading={loading}
              onClick={handleConfirm}
              className="flex-1 gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Course
            </Button>
            <Button variant="ghost" size="lg" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
