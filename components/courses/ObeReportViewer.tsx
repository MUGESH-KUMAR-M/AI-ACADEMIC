"use client";

import { useState } from "react";
import {
  Award,
  Target,
  Grid3X3,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Brain,
  Lightbulb,
  FlaskConical,
  Scale,
  Telescope,
  Sparkles,
  BookMarked,
  ClipboardList,
  Layers,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { ObeReport } from "@/lib/api";

// ── Bloom config ──────────────────────────────────────────────────────────────
const bloomCfg: Record<
  string,
  { label: string; bg: string; bar: string; Icon: React.ElementType }
> = {
  remember:   { label: "Remember",   bg: "bg-yellow-500/15 border-yellow-500/25 text-yellow-300",    bar: "bg-yellow-500",  Icon: BookMarked },
  understand: { label: "Understand", bg: "bg-blue-500/15 border-blue-500/25 text-blue-300",          bar: "bg-blue-500",    Icon: Lightbulb },
  apply:      { label: "Apply",      bg: "bg-emerald-500/15 border-emerald-500/25 text-emerald-300", bar: "bg-emerald-500", Icon: FlaskConical },
  analyze:    { label: "Analyze",    bg: "bg-violet-500/15 border-violet-500/25 text-violet-300",    bar: "bg-violet-500",  Icon: Scale },
  evaluate:   { label: "Evaluate",   bg: "bg-orange-500/15 border-orange-500/25 text-orange-300",    bar: "bg-orange-500",  Icon: Telescope },
  create:     { label: "Create",     bg: "bg-pink-500/15 border-pink-500/25 text-pink-300",          bar: "bg-pink-500",    Icon: Sparkles },
};

// ── CO-PO correlation cell styles ─────────────────────────────────────────────
const cellStyle: Record<number, { bg: string; text: string; label: string }> = {
  0: { bg: "bg-white/5 border-white/8",                          text: "text-slate-600",             label: "—" },
  1: { bg: "bg-emerald-900/40 border-emerald-700/30",            text: "text-emerald-400",            label: "1" },
  2: { bg: "bg-emerald-700/50 border-emerald-600/40",            text: "text-emerald-300",            label: "2" },
  3: { bg: "bg-emerald-500/30 border-emerald-500/40",            text: "text-emerald-200 font-bold",  label: "3" },
};

// ── Sub-tab definition ────────────────────────────────────────────────────────
type Sect = "summary" | "copo" | "copso" | "attainment" | "assessments" | "bloom";
const SECTS: { key: Sect; label: string; Icon: React.ElementType }[] = [
  { key: "summary",     label: "Summary",       Icon: Award },
  { key: "copo",        label: "CO-PO",         Icon: Grid3X3 },
  { key: "copso",       label: "CO-PSO",        Icon: Layers },
  { key: "attainment",  label: "Attainment",    Icon: TrendingUp },
  { key: "assessments", label: "Assessments",   Icon: ClipboardList },
  { key: "bloom",       label: "Bloom",         Icon: BarChart3 },
];

// ── Helper: natural sort of object keys ──────────────────────────────────────
function sortedKeys(obj: Record<string, unknown>) {
  return Object.keys(obj).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function ObeReportViewer({
  report,
}: {
  report?: ObeReport | Record<string, unknown>;
}) {
  const [sect, setSect] = useState<Sect>("summary");

  const obe = (report ?? {}) as ObeReport;

  const hasCoPo   = !!obe.co_po_mapping   && Object.keys(obe.co_po_mapping).length   > 0;
  const hasCoPso  = !!obe.co_pso_mapping  && Object.keys(obe.co_pso_mapping).length  > 0;
  const hasAttn   = !!obe.co_attainment_targets && Object.keys(obe.co_attainment_targets).length > 0;
  const hasAssess = !!obe.assessment_co_mapping && Object.keys(obe.assessment_co_mapping).length > 0;
  const hasBloom  = !!obe.bloom_analysis?.distribution && Object.keys(obe.bloom_analysis.distribution).length > 0;

  const isEmpty =
    !hasCoPo && !hasCoPso && !hasAttn && !hasAssess && !hasBloom &&
    !obe.compliance_score && !obe.recommendations?.length;

  if (isEmpty) return <ObeEmptyState />;

  const available: Record<Sect, boolean> = {
    summary:     true,
    copo:        hasCoPo,
    copso:       hasCoPso,
    attainment:  hasAttn,
    assessments: hasAssess,
    bloom:       hasBloom,
  };

  return (
    <div className="space-y-4">
      {/* Sub-nav */}
      <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
        {SECTS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => available[key] && setSect(key)}
            disabled={!available[key]}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
              sect === key
                ? "bg-rose-600/25 border border-rose-500/40 text-rose-300"
                : available[key]
                  ? "text-slate-400 hover:text-white hover:bg-white/8"
                  : "text-slate-700 cursor-not-allowed"
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
            {!available[key] && <span className="text-[9px] opacity-50">—</span>}
          </button>
        ))}
      </div>

      {/* Panels */}
      {sect === "summary"     && <SummaryPanel obe={obe} hasCoPo={hasCoPo} />}
      {sect === "copo"        && <MatrixPanel mapping={obe.co_po_mapping!}  title="CO-PO Correlation Matrix"  rowColor="text-rose-300"  colColor="text-violet-300" />}
      {sect === "copso"       && <MatrixPanel mapping={obe.co_pso_mapping!} title="CO-PSO Correlation Matrix" rowColor="text-rose-300"  colColor="text-blue-300"   />}
      {sect === "attainment"  && <AttainmentPanel obe={obe} />}
      {sect === "assessments" && <AssessmentsPanel obe={obe} />}
      {sect === "bloom"       && <BloomPanel obe={obe} />}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function ObeEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
        <Award className="w-8 h-8 text-rose-500/60" />
      </div>
      <div>
        <p className="text-white font-semibold">OBE report not yet generated</p>
        <p className="text-slate-400 text-sm mt-1 max-w-sm">
          Trigger a full generation or select the{" "}
          <span className="text-rose-300">OBE</span> component to map Course
          Outcomes to Program Outcomes and compute NBA attainment.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center mt-1">
        {["CO-PO Matrix", "CO-PSO Matrix", "Attainment Targets", "NBA Compliance", "Bloom Coverage"].map((t) => (
          <span key={t} className="text-[10px] px-2.5 py-1 rounded-full bg-rose-500/8 border border-rose-500/15 text-rose-400">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Summary ───────────────────────────────────────────────────────────────────
function SummaryPanel({ obe, hasCoPo }: { obe: ObeReport; hasCoPo: boolean }) {
  const cloCnt = hasCoPo ? Object.keys(obe.co_po_mapping!).length : 0;
  const poCnt  = hasCoPo
    ? [...new Set(Object.values(obe.co_po_mapping!).flatMap((r) => Object.keys(r)))].length
    : 0;
  const bloom = obe.bloom_analysis;
  const score = obe.compliance_score;

  const kpis = [
    { label: "CLOs Mapped",     val: cloCnt || "—", Icon: Target,    grad: "from-rose-600 to-pink-600",     sh: "shadow-rose-500/20"   },
    { label: "POs Covered",     val: poCnt  || "—", Icon: Layers,    grad: "from-violet-600 to-indigo-600", sh: "shadow-violet-500/20" },
    {
      label: "Compliance Score",
      val:   score != null ? `${score}%` : "—",
      Icon:  Award,
      grad:  score != null && score >= 80 ? "from-emerald-600 to-teal-600" : "from-amber-600 to-orange-600",
      sh:    "shadow-emerald-500/20",
    },
    {
      label: "HOT Ratio",
      val:   bloom ? `${Math.round(bloom.hot_ratio * 100)}%` : "—",
      Icon:  Brain,
      grad:  bloom?.is_adequate ? "from-indigo-600 to-violet-600" : "from-amber-600 to-orange-600",
      sh:    "shadow-indigo-500/20",
    },
  ];

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map(({ label, val, Icon, grad, sh }) => (
          <Card key={label} glow>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0 shadow-lg ${sh}`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-white leading-tight">{val}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* NBA compliance notes */}
      {obe.nba_compliance_notes && (
        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-300 mb-1">NBA Compliance</p>
              <p className="text-xs text-slate-300 leading-relaxed">{obe.nba_compliance_notes}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bloom quick summary */}
      {bloom && (
        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <Brain className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Bloom Analysis</p>
                <Badge variant={bloom.is_adequate ? "green" : "yellow"} className="text-[9px]">
                  {bloom.is_adequate ? "Adequate" : "Needs improvement"}
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                {bloom.higher_order_count} of {bloom.total} CLOs are higher-order thinking
              </p>
              {bloom.recommendation && (
                <p className="text-xs text-slate-300 italic">&ldquo;{bloom.recommendation}&rdquo;</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {obe.recommendations && obe.recommendations.length > 0 && (
        <Card>
          <CardContent className="p-5 space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wide flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              Recommendations ({obe.recommendations.length})
            </h4>
            <ul className="space-y-2">
              {obe.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 text-[9px] flex items-center justify-center flex-shrink-0 font-bold mt-0.5">
                    {i + 1}
                  </span>
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Matrix (CO-PO or CO-PSO) ──────────────────────────────────────────────────
function MatrixPanel({
  mapping,
  title,
  rowColor,
  colColor,
}: {
  mapping: Record<string, Record<string, number>>;
  title: string;
  rowColor: string;
  colColor: string;
}) {
  const rows = sortedKeys(mapping);
  const cols = [
    ...new Set(rows.flatMap((r) => Object.keys(mapping[r]))),
  ].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3">
        {([0, 1, 2, 3] as const).map((lvl) => (
          <div key={lvl} className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded border flex items-center justify-center text-[10px] font-semibold ${cellStyle[lvl].bg} ${cellStyle[lvl].text}`}>
              {cellStyle[lvl].label}
            </div>
            <span className="text-[10px] text-slate-400">
              {lvl === 0 ? "No mapping" : lvl === 1 ? "Low" : lvl === 2 ? "Medium" : "High"}
            </span>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-5 space-y-3">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wide flex items-center gap-2">
            <Grid3X3 className="w-3.5 h-3.5 text-rose-400" />
            {title}
          </h4>
          <div className="overflow-x-auto">
            <table className="text-[10px]">
              <thead>
                <tr>
                  <th className="text-left text-slate-500 pr-4 pb-2 font-medium min-w-[52px]">CO ╲</th>
                  {cols.map((col) => (
                    <th key={col} className={`text-center font-semibold pb-2 px-1.5 min-w-[36px] ${colColor}`}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((coId) => {
                  const row = mapping[coId] ?? {};
                  return (
                    <tr key={coId}>
                      <td className={`font-bold pr-4 py-1 ${rowColor}`}>{coId}</td>
                      {cols.map((col) => {
                        const raw = row[col] ?? 0;
                        const lvl = Math.min(3, Math.max(0, Math.round(raw))) as 0 | 1 | 2 | 3;
                        const sty = cellStyle[lvl];
                        return (
                          <td key={col} className="py-1 px-1.5">
                            <div className={`w-8 h-8 rounded border flex items-center justify-center font-semibold ${sty.bg} ${sty.text}`}>
                              {sty.label}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Attainment ────────────────────────────────────────────────────────────────
function AttainmentPanel({ obe }: { obe: ObeReport }) {
  const targets  = obe.co_attainment_targets   ?? {};
  const poContrib = obe.po_attainment_contribution ?? {};
  const justif   = obe.mapping_justification   ?? {};
  const [showJustif, setShowJustif] = useState(false);

  const coIds = sortedKeys(targets);
  const poIds = sortedKeys(poContrib);

  const methodBadge: Record<string, string> = {
    "Direct":            "bg-emerald-500/15 border-emerald-500/25 text-emerald-300",
    "Indirect":          "bg-blue-500/15 border-blue-500/25 text-blue-300",
    "Direct + Indirect": "bg-violet-500/15 border-violet-500/25 text-violet-300",
  };

  return (
    <div className="space-y-4">
      {/* CO Attainment Targets */}
      {coIds.length > 0 && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wide flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-rose-400" />
              CO Attainment Targets
            </h4>
            <div className="space-y-3">
              {coIds.map((co) => {
                const { target, method } = targets[co];
                const mbg = methodBadge[method] ?? "bg-slate-500/15 border-slate-500/25 text-slate-300";
                return (
                  <div key={co} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-rose-300 w-10">{co}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full border ${mbg}`}>{method}</span>
                      </div>
                      <span className="font-bold text-white">{target}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/8 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-rose-500" style={{ width: `${target}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* PO Contribution */}
      {poIds.length > 0 && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wide flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
              Program Outcome Contribution
            </h4>
            <div className="space-y-3">
              {poIds.map((po) => {
                const { contributing_cos, average_level } = poContrib[po];
                const pct = Math.round((average_level / 3) * 100);
                return (
                  <div key={po} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-bold text-violet-300 flex-shrink-0 w-8">{po}</span>
                        <div className="flex flex-wrap gap-1">
                          {contributing_cos.map((co) => (
                            <span key={co} className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/20 text-rose-300 font-mono">
                              {co}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="font-bold text-white flex-shrink-0">
                        {average_level.toFixed(1)}<span className="text-slate-500 font-normal">/3</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/8 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mapping Justification (collapsible) */}
      {Object.keys(justif).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <button
              onClick={() => setShowJustif((p) => !p)}
              className="flex items-center gap-2 w-full text-xs text-slate-300 hover:text-white transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="font-semibold">Mapping Justification</span>
              <span className="text-slate-500 text-[9px] ml-1">{Object.keys(justif).length} entries</span>
              <div className="ml-auto">
                {showJustif ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </div>
            </button>
            {showJustif && (
              <div className="mt-3 space-y-2 border-t border-white/8 pt-3">
                {Object.entries(justif).map(([key, val]) => (
                  <div key={key} className="flex items-start gap-2">
                    <span className="text-[9px] font-bold text-rose-300 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 font-mono">
                      {key}
                    </span>
                    <p className="text-xs text-slate-400 leading-relaxed">{val}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Assessments tab ───────────────────────────────────────────────────────────
function AssessmentsPanel({ obe }: { obe: ObeReport }) {
  const mapping     = obe.assessment_co_mapping ?? {};
  const assessments = Object.keys(mapping).sort();

  // Reverse index: CO → assessments
  const coToAssess: Record<string, string[]> = {};
  for (const [aName, clos] of Object.entries(mapping)) {
    for (const co of clos) {
      if (!coToAssess[co]) coToAssess[co] = [];
      coToAssess[co].push(aName);
    }
  }
  const coveredCos = sortedKeys(coToAssess);

  return (
    <div className="space-y-4">
      {/* Assessment → CLOs */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wide flex items-center gap-2">
            <ClipboardList className="w-3.5 h-3.5 text-amber-400" />
            Assessment → CLO Coverage
          </h4>
          <div className="space-y-1">
            {assessments.map((aName) => {
              const clos = mapping[aName];
              return (
                <div key={aName} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{aName}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{clos.length} CLO{clos.length !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {clos.map((co) => (
                      <span key={co} className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/20 text-rose-300 font-mono">
                        {co}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* CLO → Assessed By reverse view */}
      {coveredCos.length > 0 && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wide flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-rose-400" />
              CLO → Assessed By
            </h4>
            <div className="space-y-1">
              {coveredCos.map((co) => (
                <div key={co} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <span className="text-xs font-bold text-rose-300 w-10 flex-shrink-0">{co}</span>
                  <div className="flex flex-wrap gap-1">
                    {coToAssess[co].map((a) => (
                      <span key={a} className="text-[9px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Bloom Coverage ────────────────────────────────────────────────────────────
function BloomPanel({ obe }: { obe: ObeReport }) {
  const bloom = obe.bloom_analysis;
  if (!bloom) return null;

  const { distribution, higher_order_count, total, hot_ratio, is_adequate, recommendation } = bloom;
  const bloomOrder = ["remember", "understand", "apply", "analyze", "evaluate", "create"];
  const entries = Object.entries(distribution).sort(
    (a, b) => bloomOrder.indexOf(a[0].toLowerCase()) - bloomOrder.indexOf(b[0].toLowerCase())
  );
  const hotPct = Math.round(hot_ratio * 100);

  return (
    <Card>
      <CardContent className="p-5 space-y-5">
        <h4 className="text-xs font-semibold text-white uppercase tracking-wide flex items-center gap-2">
          <Brain className="w-3.5 h-3.5 text-violet-400" />
          Bloom&apos;s Taxonomy Distribution
        </h4>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-4 text-xs text-slate-400">
          <span>Total CLOs: <span className="text-white font-semibold">{total}</span></span>
          <span>Higher-order: <span className="text-white font-semibold">{higher_order_count}</span></span>
          <span>HOT Ratio: <span className={`font-semibold ${is_adequate ? "text-emerald-300" : "text-amber-300"}`}>{hotPct}%</span></span>
          <Badge variant={is_adequate ? "green" : "yellow"} className="text-[9px]">
            {is_adequate ? "Adequate" : "Needs improvement"}
          </Badge>
        </div>

        {/* Bars */}
        <div className="space-y-3">
          {entries.map(([level, count]) => {
            const key = level.toLowerCase();
            const cfg = bloomCfg[key] ?? bloomCfg.understand;
            const BIcon = cfg.Icon;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={level} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] ${cfg.bg}`}>
                    <BIcon className="w-2.5 h-2.5" />
                    {cfg.label}
                  </span>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="font-semibold text-white">{count}</span>
                    <span className="text-[10px]">CLO{count !== 1 ? "s" : ""} ({pct}%)</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-white/8 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* HOT vs LOT stacked bar */}
        <div className="space-y-1.5 pt-2 border-t border-white/8">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Higher-Order (HOT) vs Lower-Order (LOT)</span>
            <span className={`font-bold ${is_adequate ? "text-emerald-300" : "text-amber-300"}`}>{hotPct}%</span>
          </div>
          <div className="w-full h-3 bg-white/8 rounded-full overflow-hidden flex">
            <div className="h-full bg-violet-500 rounded-l-full transition-all" style={{ width: `${hotPct}%` }} />
          </div>
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>HOT ({hotPct}%)</span>
            <span>LOT ({100 - hotPct}%)</span>
          </div>
        </div>

        {/* AI Recommendation */}
        {recommendation && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-violet-500/8 border border-violet-500/20">
            <AlertCircle className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 italic">&ldquo;{recommendation}&rdquo;</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
