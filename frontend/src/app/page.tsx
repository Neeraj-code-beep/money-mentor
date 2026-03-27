"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  LineChart,
  PiggyBank,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const fade = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

const features = [
  {
    title: "Money Health Score",
    desc: "Six-factor radar, progress bars, and a clear score you can improve.",
    icon: TrendingUp,
  },
  {
    title: "FIRE Planner",
    desc: "SIP targets, horizon math, and animated growth curves.",
    icon: LineChart,
  },
  {
    title: "Life Event Advisor",
    desc: "Bonus to baby — smart allocation pies with AI explanations.",
    icon: Sparkles,
  },
  {
    title: "Tax Wizard",
    desc: "Old vs new regime bars with savings highlights.",
    icon: BarChart3,
  },
  {
    title: "AI Copilot",
    desc: "Context-aware chat that knows your dashboard numbers.",
    icon: Bot,
  },
  {
    title: "Bank-grade feel",
    desc: "Groww-inspired green theme, motion, and premium cards.",
    icon: Shield,
  },
];

const steps = [
  { title: "Connect context", body: "Tell us income, spends, and goals — stored securely." },
  { title: "See clarity", body: "Charts turn numbers into a plan you can trust." },
  { title: "Ask AI", body: "Get explanations, nudges, and next steps in plain English." },
];

const testimonials = [
  { name: "Aditi S.", quote: "Finally a dashboard that feels calm — not cluttered." },
  { name: "Rohan K.", quote: "The FIRE planner made SIP math click for me." },
  { name: "Neha P.", quote: "Tax comparison saved me hours of spreadsheet pain." },
];

const heroChart = Array.from({ length: 12 }).map((_, i) => ({
  m: `M${i + 1}`,
  v: 12 + i * 2.2 + Math.sin(i) * 3,
}));

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f6fbf9] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-emerald-100/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white shadow-lift">
              M
            </div>
            <div>
              <div className="text-sm font-bold">Money Mentor</div>
              <div className="text-xs text-slate-500">Wealth OS</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="hidden text-sm font-semibold text-emerald-800 sm:inline">
              Dashboard
            </Link>
            <Button asChild>
              <Link href="/dashboard">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 mm-grid opacity-60" />
        <div className="pointer-events-none absolute -right-32 top-10 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                <PiggyBank className="h-3.5 w-3.5" /> AI + charts + calm UX
              </div>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Grow your wealth with <span className="text-emerald-600">AI</span>
              </h1>
              <p className="mt-4 max-w-xl text-lg text-slate-600">Your personal AI financial advisor — built for clarity, not noise.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-2xl">
                  <Link href="/dashboard">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="rounded-2xl">
                  <Link href="/dashboard/money-health">Explore Money Health</Link>
                </Button>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-4 text-sm">
                <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-card">
                  <div className="text-2xl font-bold text-emerald-700">6</div>
                  <div className="text-xs text-slate-500">Health factors</div>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-card">
                  <div className="text-2xl font-bold text-emerald-700">AI</div>
                  <div className="text-xs text-slate-500">Guided answers</div>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-card">
                  <div className="text-2xl font-bold text-emerald-700">₹</div>
                  <div className="text-xs text-slate-500">India-first</div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55 }}>
            <Card className="overflow-hidden border-emerald-100 shadow-lift">
              <div className="flex items-center justify-between border-b border-emerald-50 bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-4 text-white">
                <div>
                  <div className="text-sm font-bold">Wealth trajectory</div>
                  <div className="text-xs text-emerald-50/90">Illustrative growth curve</div>
                </div>
                <TrendingUp className="h-5 w-5 opacity-90" />
              </div>
              <CardContent className="p-4">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={heroChart}>
                      <defs>
                        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#059669" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="m" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid #d1fae5" }}
                        formatter={(v: number) => [`${v.toFixed(1)}x`, "Growth"]}
                      />
                      <Area type="monotone" dataKey="v" stroke="#059669" fill="url(#g)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs text-slate-600">
                  <div className="rounded-xl bg-emerald-50 py-2 font-semibold text-emerald-800">SIP</div>
                  <div className="rounded-xl bg-emerald-50 py-2 font-semibold text-emerald-800">Tax</div>
                  <div className="rounded-xl bg-emerald-50 py-2 font-semibold text-emerald-800">Goals</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <motion.div {...fade} className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Everything you need</h2>
          <p className="mt-2 text-slate-600">Premium cards, charts, and motion — no empty screens.</p>
        </motion.div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div key={f.title} {...fade} transition={{ delay: i * 0.05 }}>
              <Card className="h-full border-emerald-100 shadow-card transition-all hover:-translate-y-1 hover:shadow-lift">
                <CardContent className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-y border-emerald-100 bg-white/70 py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <motion.div {...fade} className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <p className="mt-2 text-slate-600">Three calm steps — then AI helps you stay on track.</p>
          </motion.div>
          <div className="grid gap-6 lg:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div key={s.title} {...fade} transition={{ delay: i * 0.08 }}>
                <div className="rounded-2xl border border-emerald-100 bg-[#f6fbf9] p-6 shadow-card">
                  <div className="text-sm font-bold text-emerald-700">Step {i + 1}</div>
                  <div className="mt-2 text-lg font-bold">{s.title}</div>
                  <p className="mt-2 text-sm text-slate-600">{s.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <motion.div {...fade} className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Loved by early users</h2>
          <p className="mt-2 text-slate-600">Dummy testimonials for demo polish.</p>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} {...fade} transition={{ delay: i * 0.06 }}>
              <Card className="border-emerald-100 shadow-card">
                <CardContent className="p-6">
                  <p className="text-sm text-slate-700">“{t.quote}”</p>
                  <div className="mt-4 text-sm font-bold text-emerald-800">{t.name}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-slate-600 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">M</div>
            <span>© {new Date().getFullYear()} Money Mentor</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard" className="hover:text-emerald-800">
              Dashboard
            </Link>
            <span className="text-slate-300">|</span>
            <span>Made for learning & demos</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
