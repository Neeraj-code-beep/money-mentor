"use client";

import { useEffect, useMemo, useState } from "react";
import { animate, motion } from "framer-motion";
import { Flame, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";

type FireRes = {
  monthlySip: number;
  monthsToGoal: number;
  yearsToRetirement: number;
  growth: { year: number; value: number }[];
};

export default function FirePage() {
  const [form, setForm] = useState({
    currentAge: 28,
    retirementAge: 50,
    goalAmount: 20000000,
    currentSavings: 500000,
    annualReturnPct: 12,
  });
  const [data, setData] = useState<FireRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayCorpus, setDisplayCorpus] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let anim: { stop: () => void } | undefined;
    (async () => {
      setLoading(true);
      try {
        const r = await api<FireRes>("/api/finance/fire", { method: "POST", body: JSON.stringify(form) });
        if (cancelled) return;
        setData(r);
        const last = r.growth[r.growth.length - 1]?.value ?? 0;
        anim = animate(0, last, {
          duration: 0.9,
          ease: "easeOut",
          onUpdate: (v) => setDisplayCorpus(v),
        });
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      anim?.stop();
    };
  }, [form]);

  const chartKey = useMemo(() => JSON.stringify(form), [form]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">FIRE Planner</h1>
        <p className="mt-1 text-sm text-slate-600">Monthly SIP, time horizon, and animated corpus growth.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-emerald-100 shadow-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-emerald-700" />
              Inputs
            </CardTitle>
            <CardDescription>Goal-based SIP estimate (illustrative)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(
              [
                ["currentAge", "Current age"],
                ["retirementAge", "Target retirement age"],
                ["goalAmount", "Goal corpus (₹)"],
                ["currentSavings", "Current investments/savings (₹)"],
                ["annualReturnPct", "Expected annual return (%)"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  type="number"
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-emerald-100 shadow-card">
              <CardHeader>
                <CardTitle>Outputs</CardTitle>
                <CardDescription>What it takes to reach the goal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading || !data ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                      <div className="text-xs font-semibold text-emerald-900">Suggested monthly SIP</div>
                      <div className="mt-1 text-3xl font-black text-emerald-800">{formatINR(data.monthlySip)}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Years: {data.yearsToRetirement}</Badge>
                      <Badge variant="outline">Months: {data.monthsToGoal}</Badge>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <TrendingUp className="h-4 w-4 text-emerald-700" />
                        Projected corpus (end of horizon)
                      </div>
                      <motion.div className="mt-2 text-3xl font-black text-slate-900">
                        {formatINR(Math.round(displayCorpus))}
                      </motion.div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="h-full border-emerald-100 shadow-card">
                <CardHeader>
                  <CardTitle>Growth vibe</CardTitle>
                  <CardDescription>Micro-animation on milestone</CardDescription>
                </CardHeader>
                <CardContent className="flex h-[220px] items-center justify-center">
                  <motion.div
                    className="relative h-40 w-40 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lift"
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="absolute inset-4 rounded-full bg-white/15 backdrop-blur-sm" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <div className="text-xs font-semibold opacity-90">Wealth</div>
                      <div className="text-2xl font-black">+</div>
                      <div className="text-[11px] opacity-90">compounding</div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Card className="border-emerald-100 shadow-card">
            <CardHeader>
              <CardTitle>Year vs investment growth</CardTitle>
              <CardDescription>Line chart of projected corpus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                {!data ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <motion.div key={chartKey} initial={{ opacity: 0.35 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.growth}>
                        <defs>
                          <linearGradient id="fireg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#059669" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                        <Tooltip formatter={(v: number) => [formatINR(v), "Corpus"]} />
                        <Area type="monotone" dataKey="value" stroke="#059669" fill="url(#fireg)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
