"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calculator } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";

type TaxRes = {
  oldRegime: number;
  newRegime: number;
  better: "old" | "new";
  savingsIfSwitch: number;
  effectiveOldPct: number;
  effectiveNewPct: number;
};

export default function TaxPage() {
  const [form, setForm] = useState({
    grossSalary: 1800000,
    deductions80C: 150000,
    deductionsOther: 50000,
  });
  const [res, setRes] = useState<TaxRes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c = false;
    (async () => {
      setLoading(true);
      try {
        const t = await api<TaxRes>("/api/finance/tax", { method: "POST", body: JSON.stringify(form) });
        if (!c) setRes(t);
      } catch {
        /* ignore */
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [form]);

  const chartData = res
    ? [
        { name: "Old regime", value: res.oldRegime, fill: "#0f766e" },
        { name: "New regime", value: res.newRegime, fill: "#34d399" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Tax Wizard</h1>
        <p className="mt-1 text-sm text-slate-600">Old vs new regime comparison — simplified demo model.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-emerald-100 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-emerald-700" />
              Inputs
            </CardTitle>
            <CardDescription>Annual numbers (₹)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(
              [
                ["grossSalary", "Gross salary"],
                ["deductions80C", "80C + similar (cap considered in model)"],
                ["deductionsOther", "Other deductions (demo)"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <Input id={key} type="number" value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-emerald-100 shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Comparison</CardTitle>
            <CardDescription>Bar chart + savings highlight</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-2">
            <div className="h-64 w-full">
              {loading || !res ? (
                <Skeleton className="h-full w-full rounded-2xl" />
              ) : (
                <motion.div initial={{ opacity: 0.35 }} animate={{ opacity: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => formatINR(v)} />
                      <Tooltip formatter={(v: number) => [formatINR(v), "Tax"]} />
                      <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                        {chartData.map((c, i) => (
                          <Cell key={i} fill={c.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </div>
            <div className="space-y-4">
              {loading || !res ? (
                <Skeleton className="h-40 w-full rounded-2xl" />
              ) : (
                <>
                  <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
                    <div className="text-xs font-semibold text-slate-600">Better regime (demo)</div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="text-2xl font-black text-emerald-900">{res.better === "old" ? "Old" : "New"}</div>
                      <Badge>Lower tax</Badge>
                    </div>
                    <div className="mt-3 text-sm text-slate-600">
                      Difference: <span className="font-bold text-emerald-800">{formatINR(res.savingsIfSwitch)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                      <div className="text-xs text-slate-500">Effective (old)</div>
                      <div className="mt-1 text-lg font-bold">{res.effectiveOldPct}%</div>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                      <div className="text-xs text-slate-500">Effective (new)</div>
                      <div className="mt-1 text-lg font-bold">{res.effectiveNewPct}%</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
