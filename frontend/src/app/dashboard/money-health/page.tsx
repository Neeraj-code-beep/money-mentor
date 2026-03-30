"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Gauge } from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

type Result = {
  score: number;
  label: string;
  color: "red" | "yellow" | "green";
  factors: {
    savingsRate: number;
    debtToIncome: number;
    emergencyMonths: number;
    investmentRatio: number;
    expenseStability: number;
    creditHealth: number;
  };
  breakdown: { name: string; value: number; weight: number }[];
};

const factorLabels: (keyof Result["factors"])[] = [
  "savingsRate",
  "debtToIncome",
  "emergencyMonths",
  "investmentRatio",
  "expenseStability",
  "creditHealth",
];

const pretty: Record<keyof Result["factors"], string> = {
  savingsRate: "Savings rate",
  debtToIncome: "Debt load",
  emergencyMonths: "Emergency buffer",
  investmentRatio: "Investing discipline",
  expenseStability: "Expense stability",
  creditHealth: "Credit health",
};

export default function MoneyHealthPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    monthlyIncome: 120000,
    monthlyExpenses: 72000,
    monthlyDebtPayment: 8000,
    liquidSavings: 400000,
    monthlyInvestments: 18000,
    expenseStabilityScore: 72,
    creditHealthScore: 78,
  });
  const [result, setResult] = useState<Result | null>(null);

  async function load() {
    setLoading(true);
    try {
      const p = await api<{ profile: Record<string, number> }>("/api/profile");
      const pr = p.profile || {};
      setForm((f) => ({
        ...f,
        ...Object.fromEntries(Object.entries(pr).filter(([k]) => k in f)),
      }));
    } catch {
      /* demo */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const r = await api<Result>("/api/finance/money-health", { method: "POST", body: JSON.stringify(form) });
        if (!c) setResult(r);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      c = true;
    };
  }, [form]);

  async function persist() {
    setSaving(true);
    try {
      await api("/api/profile", { method: "PUT", body: JSON.stringify({ profile: form }) });
    } finally {
      setSaving(false);
    }
  }

  const radarData = result
    ? factorLabels.map((k) => ({ subject: pretty[k], A: Math.round(result.factors[k]), fullMark: 100 }))
    : [];

  const scoreColor =
    result?.color === "green" ? "#059669" : result?.color === "yellow" ? "#f59e0b" : "#ef4444";
  const pieData = result
    ? [
        { name: "score", value: result.score, fill: scoreColor },
        { name: "rest", value: 100 - result.score, fill: "#e2e8f0" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Money Health Score</h1>
        <p className="mt-1 text-sm text-slate-600">Six dimensions, radar view, and weighted breakdown.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-emerald-100 shadow-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-emerald-700" />
              Inputs
            </CardTitle>
            <CardDescription>Adjust numbers — we recompute instantly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                {(
                  [
                    ["monthlyIncome", "Monthly income (₹)"],
                    ["monthlyExpenses", "Monthly expenses (₹)"],
                    ["monthlyDebtPayment", "Monthly debt payments (₹)"],
                    ["liquidSavings", "Liquid savings (₹)"],
                    ["monthlyInvestments", "Monthly investments (₹)"],
                    ["expenseStabilityScore", "Expense stability (0–100)"],
                    ["creditHealthScore", "Credit health (0–100)"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{label}</Label>
                    <Input
                      id={key}
                      type="number"
                      value={form[key as keyof typeof form]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [key]: Number(e.target.value) }))
                      }
                    />
                  </div>
                ))}
                <Button className="w-full rounded-xl" onClick={persist} disabled={saving}>
                  {saving ? "Saving…" : "Save to profile"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="h-full border-emerald-100 shadow-card">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>Score</CardTitle>
                    <CardDescription>Circular progress + label</CardDescription>
                  </div>
                  {result && <Badge variant="outline">{result.label}</Badge>}
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-4">
                  {!result ? (
                    <Skeleton className="h-44 w-44 rounded-full" />
                  ) : (
                    <div className="relative mx-auto h-48 w-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} dataKey="value" innerRadius={62} outerRadius={86} startAngle={90} endAngle={-270} stroke="none">
                            {pieData.map((e, i) => (
                              <Cell key={i} fill={e.fill} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: number) => [`${v}`, ""]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-5xl font-black text-slate-900">{result.score}</div>
                        <div className="text-xs font-semibold text-slate-500">/ 100</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Card className="h-full border-emerald-100 shadow-card">
                <CardHeader>
                  <CardTitle>6 dimensions</CardTitle>
                  <CardDescription>Radar chart</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    {!result ? (
                      <Skeleton className="h-full w-full" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData} outerRadius="75%">
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                          <Radar name="Score" dataKey="A" stroke="#059669" fill="#059669" fillOpacity={0.25} />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Card className="border-emerald-100 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-700" />
                Factor breakdown
              </CardTitle>
              <CardDescription>Radar + progress bars</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-2">
              <div className="h-72 w-full">
                {!result ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="75%">
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                      <Radar name="Score" dataKey="A" stroke="#059669" fill="#059669" fillOpacity={0.22} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="space-y-4">
                {result?.breakdown.map((b) => (
                  <div key={b.name} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>{b.name}</span>
                      <span className="text-emerald-800">{b.value}</span>
                    </div>
                    <Progress value={b.value} indicatorClassName="bg-emerald-600" />
                    <div className="text-[11px] text-slate-500">Weight {b.weight}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
