"use client";

import {
  BookOpen,
  Calendar,
  FileText,
  ClipboardList,
  Award,
  BarChart3,
  BrainCircuit,
  Sparkles,
  Smile,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const agents = [
  {
    id: 1,
    name: "Curriculum Architect",
    desc: "Generates full syllabus with CLOs aligned to Bloom's taxonomy",
    icon: BookOpen,
    color: "from-violet-500 to-purple-600",
    href: "/dashboard/curriculum",
    status: "ready",
  },
  {
    id: 2,
    name: "Semester Planner",
    desc: "Creates 16-week teaching plan with assessment schedule",
    icon: Calendar,
    color: "from-blue-500 to-cyan-600",
    href: "/dashboard/semester",
    status: "ready",
  },
  {
    id: 3,
    name: "Content Generator",
    desc: "Produces lecture notes and slide deck outlines per module",
    icon: FileText,
    color: "from-emerald-500 to-teal-600",
    href: "/dashboard/content",
    status: "ready",
  },
  {
    id: 4,
    name: "Assessment Designer",
    desc: "Creates quiz, midterm, final papers + question bank",
    icon: ClipboardList,
    color: "from-orange-500 to-amber-600",
    href: "/dashboard/assessment",
    status: "ready",
  },
  {
    id: 5,
    name: "OBE Compliance",
    desc: "CO-PO mapping for NBA/NAAC accreditation standards",
    icon: Award,
    color: "from-rose-500 to-pink-600",
    href: "/dashboard/obe",
    status: "ready",
  },
  {
    id: 6,
    name: "Analytics Engine",
    desc: "Student performance prediction and teaching insights",
    icon: BarChart3,
    color: "from-indigo-500 to-blue-600",
    href: "/dashboard/analytics",
    status: "ready",
  },
];

const stats = [
  { label: "AI Agents", value: "6", icon: BrainCircuit, trend: "+2 new", color: "violet" },
  { label: "Courses Generated", value: "0", icon: BookOpen, trend: "Start now", color: "blue" },
  { label: "Active Users", value: "1", icon: Users, trend: "You!", color: "green" },
  { label: "Tasks Completed", value: "0", icon: CheckCircle2, trend: "Generate first", color: "amber" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-blue-600/20 border border-violet-500/20 p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-transparent pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-violet-400 text-sm font-medium">AI-Powered Academic OS</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              {greeting}, {user?.full_name?.split(" ")[0]}!
              <Smile className="w-6 h-6 text-violet-400" />
            </h1>
            <p className="text-slate-400 text-sm max-w-lg">
              Your multi-agent AI platform is ready. Deploy 6 specialized agents to autonomously
              generate complete academic course packages.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link href="/dashboard/curriculum">
              <Button className="gap-2">
                <Zap className="w-4 h-4" />
                Generate Course
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} glow>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-${stat.color}-500/20 border border-${stat.color}-500/20 flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] text-emerald-400">{stat.trend}</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Agents Grid */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-violet-400" />
              AI Agent Pipeline
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              6 specialized agents working in coordination
            </p>
          </div>
          <Badge variant="green">All Systems Ready</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.map((agent) => {
            const Icon = agent.icon;
            return (
              <Link href={agent.href} key={agent.id}>
                <Card className="group hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 cursor-pointer h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-white text-sm group-hover:text-violet-300 transition-colors">
                            {agent.name}
                          </p>
                          <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{agent.desc}</p>
                        <div className="flex items-center gap-1.5 mt-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[10px] text-emerald-400 font-medium">Ready</span>
                          <span className="text-[10px] text-slate-600 ml-1">Agent #{agent.id}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Account Info */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-400" />
            Account Overview
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Email", value: user?.email },
              { label: "Role", value: user?.role, isCapitalize: true },
              { label: "Institution", value: user?.institution_id },
              { label: "Department", value: user?.department },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                <p
                  className={`text-sm font-medium text-white truncate ${
                    item.isCapitalize ? "capitalize" : ""
                  }`}
                >
                  {item.value ?? "—"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
