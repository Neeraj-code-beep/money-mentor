"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, PiggyBank, Receipt, Scale, Sparkles } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatCompact, formatINR } from "@/lib/format";

type Profile = {
  monthlyIncome?: number;
  monthlyExpenses?: number;
  monthlyDebtPayment?: number;
  liquidSavings?: number;
  monthlyInvestments?: number;
  grossSalary?: number;
  deductions80C?: number;
  deductionsOther?: number;
};

type Health = {
  score: number;
  label: string;
  color: "red" | "yellow" | "green";
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>({
    monthlyIncome: 120000,
    monthlyExpenses: 72000,
    monthlyDebtPayment: 8000,
    liquidSavings: 400000,
    monthlyInvestments: 18000,
    grossSalary: 1800000,
    deductions80C: 150000,
    deductionsOther: 50000,
  });
  const [health, setHealth] = useState<Health | null>(null);
  const [sipSeries, setSipSeries] = useState<{ year: number; value: number }[]>([]);
  const [tax, setTax] = useState<{ oldRegime: number; newRegime: number; better: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await api<{ profile: Profile }>("/api/profile");
        if (p.profile && Object.keys(p.profile).length) setProfile((prev) => ({ ...prev, ...p.profile }));
      } catch {
        /* demo fallback */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const h = await api<Health>("/api/finance/money-health", {
          method: "POST",
          body: JSON.stringify({
            monthlyIncome: profile.monthlyIncome,
            monthlyExpenses: profile.monthlyExpenses,
            monthlyDebtPayment: profile.monthlyDebtPayment,
            liquidSavings: profile.liquidSavings,
            monthlyInvestments: profile.monthlyInvestments,
          }),
        });
        if (!cancelled) setHealth(h);
        const sip = await api<{ series: { year: number; value: number }[] }>("/api/finance/sip-projection", {
          method: "POST",
          body: JSON.stringify({ monthlySip: profile.monthlyInvestments, annualReturnPct: 12, years: 18 }),
        });
        if (!cancelled) setSipSeries(sip.series);
        const t = await api<{ oldRegime: number; newRegime: number; better: string }>("/api/finance/tax", {
          method: "POST",
          body: JSON.stringify({
            grossSalary: profile.grossSalary,
            deductions80C: profile.deductions80C,
            deductionsOther: profile.deductionsOther,
          }),
        });
        if (!cancelled) setTax(t);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile]);

  const expenseVsSavings = useMemo(() => {
    const inc = profile.monthlyIncome ?? 0;
    const exp = profile.monthlyExpenses ?? 0;
    const sav = Math.max(inc - exp, 0);
    return [
      { name: "Expenses", value: exp, fill: "#94a3b8" },
      { name: "Savings", value: sav, fill: "#059669" },
    ];
  }, [profile]);

  const scoreColor = health?.color === "green" ? "#059669" : health?.color === "yellow" ? "#f59e0b" : "#ef4444";
  const pieData = health
    ? [
        { name: "score", value: health.score, fill: scoreColor },
        { name: "rest", value: 100 - health.score, fill: "#e2e8f0" },
      ]
    : [
        { name: "score", value: 0, fill: "#e2e8f0" },
        { name: "rest", value: 100, fill: "#e2e8f0" },
      ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Your wealth snapshot — charts update from your profile defaults.</p>
        </div>
        <Button asChild variant="secondary" className="rounded-xl">
          <Link href="/dashboard/money-health">
            Deep dive <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden border-emerald-100 shadow-card">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-emerald-700" />
                  Money Health Score
                </CardTitle>
                <CardDescription>Holistic score with circular progress</CardDescription>
              </div>
              {health && <Badge>{health.label}</Badge>}
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              {loading && !health ? (
                <div className="space-y-3">
                  <Skeleton className="h-36 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : (
                <>
                  <div className="relative mx-auto h-44 w-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} dataKey="value" innerRadius={58} outerRadius={72} startAngle={90} endAngle={-270} stroke="none">
                          {pieData.map((e, i) => (
                            <Cell key={i} fill={e.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => [`${v}`, ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-3xl font-extrabold text-slate-900">{health?.score ?? "—"}</div>
                      <div className="text-xs font-semibold text-slate-500">/ 100</div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-emerald-50 bg-emerald-50/30 p-4">
                      <div className="text-xs font-semibold text-emerald-800">Savings rate</div>
                      <div className="mt-2 text-2xl font-bold text-slate-900">
                        {profile.monthlyIncome
                          ? `${Math.round(((profile.monthlyIncome - (profile.monthlyExpenses ?? 0)) / profile.monthlyIncome) * 100)}%`
                          : "—"}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">of income</div>
                    </div>
                    <Button asChild variant="outline" className="w-full rounded-xl">
                      <Link href="/dashboard/money-health">View breakdown</Link>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="overflow-hidden border-emerald-100 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-emerald-700" />
                SIP Projection
              </CardTitle>
              <CardDescription>Investment growth (illustrative @ 12% CAGR)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56 w-full">
                {sipSeries.length === 0 ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sipSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => formatCompact(v)} />
                      <Tooltip formatter={(v: number) => [formatINR(v), "Corpus"]} />
                      <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                <span>Monthly SIP (from investments)</span>
                <span className="font-semibold text-emerald-800">{formatINR(profile.monthlyInvestments ?? 0)}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="overflow-hidden border-emerald-100 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-700" />
                Expense vs Savings
              </CardTitle>
              <CardDescription>Monthly split</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expenseVsSavings}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCompact(v)} />
                    <Tooltip formatter={(v: number) => [formatINR(v), ""]} />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                      {expenseVsSavings.map((e, i) => (
                        <Cell key={i} fill={e.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="overflow-hidden border-emerald-100 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-700" />
                Tax Summary
              </CardTitle>
              <CardDescription>Old vs new regime (simplified demo)</CardDescription>
            </CardHeader>
            <CardContent>
              {!tax ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <div className="space-y-4">
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: "Old", tax: tax.oldRegime },
                          { name: "New", tax: tax.newRegime },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(v) => formatCompact(v)} />
                        <Tooltip formatter={(v: number) => [formatINR(v), "Tax"]} />
                        <Bar dataKey="tax" radius={[10, 10, 0, 0]}>
                          <Cell fill="#0f766e" />
                          <Cell fill="#34d399" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                    <div className="text-xs font-semibold text-slate-500">Better regime (demo)</div>
                    <div className="mt-1 text-lg font-bold text-emerald-800">{tax.better === "old" ? "Old regime" : "New regime"}</div>
                    <div className="mt-2 text-xs text-slate-600">
                      Compare assumptions in <Link className="font-semibold text-emerald-800 underline" href="/dashboard/tax">Tax Wizard</Link>.
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
