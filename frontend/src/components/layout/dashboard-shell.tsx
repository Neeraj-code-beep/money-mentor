"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  HeartPulse,
  Flame,
  Sparkles,
  Receipt,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FloatingChat } from "@/components/chat/floating-chat";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/money-health", label: "Money Health", icon: HeartPulse },
  { href: "/dashboard/fire", label: "FIRE Planner", icon: Flame },
  { href: "/dashboard/life-events", label: "Life Events", icon: Sparkles },
  { href: "/dashboard/tax", label: "Tax Wizard", icon: Receipt },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),_transparent_55%),#f6fbf9]">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 lg:px-8">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 flex-col rounded-2xl border border-emerald-100/80 bg-white/90 p-4 shadow-card backdrop-blur lg:flex">
          <Link href="/" className="mb-6 flex items-center gap-2 px-2 text-emerald-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white shadow-lift">
              M
            </div>
            <div>
              <div className="text-sm font-bold leading-tight">Money Mentor</div>
              <div className="text-xs text-slate-500">Wealth OS</div>
            </div>
          </Link>
          <nav className="flex flex-1 flex-col gap-1">
            {nav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.span
                    whileHover={{ x: 4 }}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25" : "text-slate-600 hover:bg-emerald-50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </motion.span>
                </Link>
              );
            })}
          </nav>
          <Link
            href="/"
            className="mt-auto flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-500 hover:bg-emerald-50 hover:text-emerald-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
            <Link href="/" className="text-sm font-semibold text-emerald-800">
              ← Money Mentor
            </Link>
          </div>
          <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-2 lg:hidden">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold",
                    active ? "border-emerald-600 bg-emerald-600 text-white" : "border-emerald-100 bg-white text-slate-600"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          {children}
        </div>
      </div>
      <FloatingChat />
    </div>
  );
}
