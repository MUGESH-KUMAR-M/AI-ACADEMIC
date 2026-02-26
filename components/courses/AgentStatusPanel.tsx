"use client";

import {
  CheckCircle2,
  Loader2,
  CircleDot,
  XCircle,
  MinusCircle,
  BookOpen,
  Calendar,
  FileText,
  ClipboardList,
  Award,
  BarChart3,
} from "lucide-react";
import { AgentStatus, AgentRunStatus } from "@/lib/api";

interface AgentStatusPanelProps {
  agents: AgentStatus[];
  progress: number;
  overallStatus: string;
  error: string | null;
  startedAt: string;
}

const agentMeta: Record<
  string,
  { label: string; desc: string; Icon: React.ElementType; color: string }
> = {
  CurriculumAgent: {
    label: "Curriculum Architect",
    desc: "Building CLOs, topics & Bloom's taxonomy alignment",
    Icon: BookOpen,
    color: "violet",
  },
  SemesterAgent: {
    label: "Semester Planner",
    desc: "Creating 16-week teaching plan with assessments",
    Icon: Calendar,
    color: "blue",
  },
  ContentAgent: {
    label: "Content Generator",
    desc: "Producing lecture notes and slide outlines",
    Icon: FileText,
    color: "emerald",
  },
  AssessmentAgent: {
    label: "Assessment Designer",
    desc: "Generating quiz, midterm, finals & question bank",
    Icon: ClipboardList,
    color: "orange",
  },
  OBEAgent: {
    label: "OBE Compliance",
    desc: "Mapping CO-PO for NBA/NAAC accreditation",
    Icon: Award,
    color: "rose",
  },
  AnalyticsAgent: {
    label: "Analytics Engine",
    desc: "Predicting performance and generating insights",
    Icon: BarChart3,
    color: "indigo",
  },
};

const statusIcons: Record<AgentRunStatus, React.ElementType> = {
  pending: CircleDot,
  running: Loader2,
  completed: CheckCircle2,
  failed: XCircle,
  skipped: MinusCircle,
};

const statusColors: Record<AgentRunStatus, string> = {
  pending: "text-slate-500",
  running: "text-blue-400 animate-spin",
  completed: "text-emerald-400",
  failed: "text-red-400",
  skipped: "text-slate-600",
};

const statusBg: Record<AgentRunStatus, string> = {
  pending: "bg-white/5 border-white/10",
  running: "bg-blue-500/10 border-blue-500/25",
  completed: "bg-emerald-500/10 border-emerald-500/25",
  failed: "bg-red-500/10 border-red-500/25",
  skipped: "bg-white/5 border-white/5",
};

export default function AgentStatusPanel({
  agents,
  progress,
  overallStatus,
  error,
  startedAt,
}: AgentStatusPanelProps) {
  const completedCount = agents.filter((a) => a.status === "completed").length;
  const elapsed = Math.floor(
    (Date.now() - new Date(startedAt).getTime()) / 1000
  );
  const elapsedStr =
    elapsed < 60
      ? `${elapsed}s`
      : `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`;

  return (
    <div className="space-y-4">
      {/* Overall progress */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {overallStatus === "generating" ? (
              <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
            ) : overallStatus === "completed" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400" />
            )}
            <span className="text-sm font-semibold text-white capitalize">
              {overallStatus === "generating" ? "Generating…" : overallStatus}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              {completedCount}/{agents.length} agents
            </span>
            <span>Elapsed: {elapsedStr}</span>
            <span className="text-violet-400 font-semibold">{progress}%</span>
          </div>
        </div>
        <div className="w-full h-2 rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        {error && (
          <p className="mt-2 text-xs text-red-400">{error}</p>
        )}
      </div>

      {/* Agent cards */}
      <div className="space-y-2">
        {agents.map((agent, idx) => {
          const meta = agentMeta[agent.agent_name] ?? {
            label: agent.agent_name,
            desc: "",
            Icon: CircleDot,
            color: "slate",
          };
          const StatusIcon = statusIcons[agent.status] ?? CircleDot;
          const AgentIcon = meta.Icon;
          const updatedAt = new Date(agent.updated_at).toLocaleTimeString();

          return (
            <div
              key={agent.agent_name}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 ${statusBg[agent.status]}`}
            >
              {/* Step number + icon */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border bg-${meta.color}-500/15 border-${meta.color}-500/25`}
              >
                <AgentIcon className={`w-4 h-4 text-${meta.color}-400`} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-600 font-mono">
                    #{idx + 1}
                  </span>
                  <span className="text-sm font-semibold text-white truncate">
                    {meta.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{meta.desc}</p>
              </div>

              {/* Status */}
              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                <StatusIcon
                  className={`w-4 h-4 ${statusColors[agent.status]}`}
                />
                <span className="text-[9px] text-slate-600">{updatedAt}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
