"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bot,
  Loader2,
  BookOpen,
  Calendar,
  FileText,
  ClipboardList,
  Award,
  BarChart3,
  RefreshCw,
  CheckCircle2,
  Hash,
  Cpu,
  Zap,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import * as api from "@/lib/api";
import * as authLib from "@/lib/auth";
import toast from "react-hot-toast";

// ── Per-agent display metadata ────────────────────────────────────────────────

const agentMeta: Record<
  string,
  {
    label: string;
    Icon: React.ElementType;
    gradient: string;
    shadow: string;
    iconColor: string;
    border: string;
    capability: string;
    link?: string;
  }
> = {
  CurriculumAgent: {
    label: "Curriculum Architect",
    Icon: BookOpen,
    gradient: "from-violet-600 to-purple-600",
    shadow: "shadow-violet-500/25",
    iconColor: "text-violet-400",
    border: "border-violet-500/20",
    capability: "Course syllabus · CLOs · Bloom's taxonomy",
    link: "/dashboard/curriculum",
  },
  SemesterAgent: {
    label: "Semester Planner",
    Icon: Calendar,
    gradient: "from-blue-600 to-cyan-600",
    shadow: "shadow-blue-500/25",
    iconColor: "text-blue-400",
    border: "border-blue-500/20",
    capability: "16-week plan · Topic sequencing · Milestones",
    link: "/dashboard/semester",
  },
  ContentAgent: {
    label: "Content Generator",
    Icon: FileText,
    gradient: "from-emerald-600 to-teal-600",
    shadow: "shadow-emerald-500/25",
    iconColor: "text-emerald-400",
    border: "border-emerald-500/20",
    capability: "Lecture notes · Slide decks · Reading lists",
    link: "/dashboard/content",
  },
  AssessmentAgent: {
    label: "Assessment Designer",
    Icon: ClipboardList,
    gradient: "from-orange-600 to-amber-600",
    shadow: "shadow-orange-500/25",
    iconColor: "text-orange-400",
    border: "border-orange-500/20",
    capability: "Quiz · Midterm · Final · Question bank",
    link: "/dashboard/assessment",
  },
  OBEAgent: {
    label: "OBE Compliance",
    Icon: Award,
    gradient: "from-rose-600 to-pink-600",
    shadow: "shadow-rose-500/25",
    iconColor: "text-rose-400",
    border: "border-rose-500/20",
    capability: "CO-PO mapping · NBA/NAAC · Attainment",
    link: "/dashboard/obe",
  },
  AnalyticsAgent: {
    label: "Analytics Engine",
    Icon: BarChart3,
    gradient: "from-indigo-600 to-violet-600",
    shadow: "shadow-indigo-500/25",
    iconColor: "text-indigo-400",
    border: "border-indigo-500/20",
    capability: "Performance · Predictions · Insights",
    link: "/dashboard/analytics",
  },
};

const fallbackMeta = (name: string) => ({
  label: name,
  Icon: Cpu,
  gradient: "from-slate-600 to-slate-700",
  shadow: "shadow-slate-500/20",
  iconColor: "text-slate-400",
  border: "border-slate-500/20",
  capability: "AI-powered processing",
  link: undefined,
});

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const [agents, setAgents] = useState<api.AgentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    const token = authLib.getAccessToken();
    if (!token) return;
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const res = await api.getAgents(token);
      setAgents(res.agents);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load agents");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Bot className="w-5 h-5 text-white" />
            </div>
            AI Agents
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Registered LLM agents powering the academic operating system
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{agents.length}</p>
                <p className="text-xs text-slate-400">Total Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{agents.length}</p>
                <p className="text-xs text-slate-400">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {agents.filter((a) => agentMeta[a.name]).length}
                </p>
                <p className="text-xs text-slate-400">Mapped to Pages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent grid */}
      {agents.length === 0 ? (
        <Card>
          <CardContent className="p-16 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Bot className="w-8 h-8 text-slate-600" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">No agents found</p>
              <p className="text-slate-400 text-sm mt-1">
                The agent registry returned an empty list.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.map((agent) => {
            const meta = agentMeta[agent.name] ?? fallbackMeta(agent.name);
            const AgentIcon = meta.Icon;

            return (
              <Card
                key={agent.id}
                className={`group border ${meta.border} hover:border-opacity-60 transition-all duration-300 hover:scale-[1.01]`}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top row: icon + name + available badge */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-lg ${meta.shadow} flex-shrink-0`}
                    >
                      <AgentIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white leading-tight">
                          {meta.label}
                        </h3>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Active
                        </span>
                      </div>
                      {/* ID pill */}
                      <div className="flex items-center gap-1 mt-1">
                        <Hash className="w-3 h-3 text-slate-600" />
                        <span className="text-[10px] font-mono text-slate-500">{agent.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {agent.description}
                  </p>

                  {/* Capability chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {meta.capability.split(" · ").map((cap) => (
                      <span
                        key={cap}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-slate-400`}
                      >
                        <Zap className={`w-2.5 h-2.5 ${meta.iconColor}`} />
                        {cap}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  {meta.link && (
                    <div className="pt-1 border-t border-white/5">
                      <a
                        href={meta.link}
                        className={`text-[11px] font-medium ${meta.iconColor} hover:underline flex items-center gap-1 transition-opacity opacity-70 hover:opacity-100`}
                      >
                        View output →
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
