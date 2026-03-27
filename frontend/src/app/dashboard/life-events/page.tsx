"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";

type Presets = Record<string, { label: string; emoji: string; allocation: Record<string, number> }>;

type BreakRow = { key: string; label: string; pct: number; amount: number };

const COLORS = ["#059669", "#10b981", "#6ee7b7", "#0f766e"];

export default function LifeEventsPage() {
  const [presets, setPresets] = useState<Presets | null>(null);
  const [eventKey, setEventKey] = useState("bonus");
  const [amount, setAmount] = useState(250000);
  const [breakdown, setBreakdown] = useState<BreakRow[]>([]);
  const [ai, setAi] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await api<{ events: Presets }>("/api/finance/life-events");
        setPresets(r.events);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const r = await api<{ breakdown: BreakRow[] }>("/api/finance/life-event", {
          method: "POST",
          body: JSON.stringify({ eventKey, amount }),
        });
        if (!c) setBreakdown(r.breakdown);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      c = true;
    };
  }, [eventKey, amount]);

  const pieData = useMemo(
    () => breakdown.map((b) => ({ name: b.label, value: b.pct, amount: b.amount })),
    [breakdown]
  );

  async function explain() {
    setAiLoading(true);
    try {
      const r = await api<{ reply: string }>("/api/ai/explain-life-event", {
        method: "POST",
        body: JSON.stringify({ eventKey, amount }),
      });
      setAi(r.reply);
    } catch {
      setAi("We couldn’t reach AI — try again after setting GEMINI_API_KEY or OPENAI_API_KEY.");
    } finally {
      setAiLoading(false);
    }
  }

  useEffect(() => {
    explain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventKey, amount]);

  const cards = presets
    ? Object.entries(presets).map(([k, v]) => ({ key: k, ...v }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Life Event Advisor</h1>
        <p className="mt-1 text-sm text-slate-600">Pick a milestone — see allocation, charts, and AI context.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {!presets
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)
          : cards.map((c, idx) => (
              <motion.button
                key={c.key}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                onClick={() => setEventKey(c.key)}
                className={`rounded-2xl border bg-white p-4 text-left shadow-card transition ${
                  eventKey === c.key ? "border-emerald-600 ring-2 ring-emerald-600/20" : "border-emerald-100 hover:border-emerald-200"
                }`}
              >
                <div className="text-2xl">{c.emoji}</div>
                <div className="mt-2 text-sm font-bold text-slate-900">{c.label}</div>
                <div className="mt-1 text-xs text-slate-500">Tap to simulate</div>
              </motion.button>
            ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-emerald-100 shadow-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-700" />
              Amount
            </CardTitle>
            <CardDescription>How much are you planning with?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amt">Amount (₹)</Label>
              <Input id="amt" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
            </div>
            {presets && (
              <div className="rounded-2xl border border-emerald-50 bg-emerald-50/40 p-4 text-sm text-slate-700">
                <div className="font-semibold text-emerald-900">Selected</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xl">{presets[eventKey]?.emoji}</span>
                  <span className="font-bold">{presets[eventKey]?.label ?? "—"}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-emerald-100 shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Allocation</CardTitle>
            <CardDescription>Pie chart + rupee breakdown</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="h-64 w-full">
              {pieData.length === 0 ? (
                <Skeleton className="h-full w-full rounded-2xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number, _n, p) => [`${v}%`, (p?.payload as { name?: string })?.name ?? ""]} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="space-y-3">
              {breakdown.map((b, i) => (
                <div key={b.key} className="flex items-center justify-between rounded-xl border border-emerald-100 bg-white p-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <div>
                      <div className="text-sm font-bold">{b.label}</div>
                      <div className="text-xs text-slate-500">{b.pct}%</div>
                    </div>
                  </div>
                  <Badge>{formatINR(b.amount)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-emerald-100 shadow-card">
        <CardHeader>
          <CardTitle>AI explanation</CardTitle>
          <CardDescription>Why this allocation can make sense (not personalized legal advice)</CardDescription>
        </CardHeader>
        <CardContent>
          {aiLoading || !ai ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm leading-relaxed text-slate-700">
              {ai}
            </motion.p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
