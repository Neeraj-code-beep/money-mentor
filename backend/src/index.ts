import 'dotenv/config';
import cors from 'cors';
import express from 'express';

import {
  getDemoUserId,
  getPool,
  initDb,
  loadProfile,
  saveProfile,
} from './db.js';

import {
  computeMoneyHealth,
  computeTaxIndia,
  fireMonthlySip,
  LIFE_EVENT_PRESETS,
  projectSipGrowth,
} from './services/finance.js';

import { generateFinancialAdvice } from './services/ai.js';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// ✅ Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true }));
app.use(express.json({ limit: '1mb' }));

// ✅ Fallback memory store (if DB not connected)
const memoryProfile: Record<string, unknown> = {};

// ✅ Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true, db: !!getPool() });
});

// ✅ Get profile
app.get('/api/profile', async (_req, res) => {
  try {
    const id = await getDemoUserId();

    if (!id) {
      return res.json({ userId: 'local-demo', profile: memoryProfile });
    }

    const profile = await loadProfile(id);
    return res.json({ userId: id, profile });
  } catch (e) {
    console.error('[profile GET error]', e);
    return res.json({ userId: 'local-demo', profile: memoryProfile });
  }
});

// ✅ Save profile
app.put('/api/profile', async (req, res) => {
  try {
    const profile = req.body?.profile ?? {};
    const id = await getDemoUserId();

    if (!id) {
      Object.assign(memoryProfile, profile);
      return res.json({ ok: true });
    }

    const existing = await loadProfile(id);
    await saveProfile(id, { ...existing, ...profile });

    return res.json({ ok: true });
  } catch (e) {
    console.error('[profile PUT error]', e);
    Object.assign(memoryProfile, req.body?.profile ?? {});
    return res.json({ ok: true });
  }
});

// ✅ Money Health
app.post('/api/finance/money-health', (req, res) => {
  const b = req.body;

  const result = computeMoneyHealth({
    monthlyIncome: Number(b.monthlyIncome) || 0,
    monthlyExpenses: Number(b.monthlyExpenses) || 0,
    monthlyDebtPayment: Number(b.monthlyDebtPayment) || 0,
    liquidSavings: Number(b.liquidSavings) || 0,
    monthlyInvestments: Number(b.monthlyInvestments) || 0,
    expenseStabilityScore: Number(b.expenseStabilityScore) || 72,
    creditHealthScore: Number(b.creditHealthScore) || 78,
  });

  res.json(result);
});

// ✅ SIP Projection
app.post('/api/finance/sip-projection', (req, res) => {
  const b = req.body;

  const series = projectSipGrowth({
    monthlySip: Number(b.monthlySip) || 10000,
    annualReturnPct: Number(b.annualReturnPct) ?? 12,
    years: Math.min(Number(b.years) || 15, 40),
  });

  res.json({ series });
});

// ✅ FIRE calculation
app.post('/api/finance/fire', (req, res) => {
  const b = req.body;

  const sip = fireMonthlySip({
    currentAge: Number(b.currentAge) || 28,
    retirementAge: Number(b.retirementAge) || 50,
    goalAmount: Number(b.goalAmount) || 2_00_00_000,
    currentSavings: Number(b.currentSavings) || 5_00_000,
    annualReturnPct: Number(b.annualReturnPct) ?? 12,
  });

  const growth = projectSipGrowth({
    monthlySip: sip.monthlySip,
    annualReturnPct: Number(b.annualReturnPct) ?? 12,
    years: sip.yearsToRetirement,
  });

  res.json({ ...sip, growth });
});

// ✅ Tax
app.post('/api/finance/tax', (req, res) => {
  const b = req.body;

  const result = computeTaxIndia({
    grossSalary: Number(b.grossSalary) || 0,
    deductions80C: Number(b.deductions80C) || 0,
    deductionsOther: Number(b.deductionsOther) || 0,
  });

  res.json(result);
});

// ✅ Life events
app.get('/api/finance/life-events', (_req, res) => {
  res.json({ events: LIFE_EVENT_PRESETS });
});

app.post('/api/finance/life-event', (req, res) => {
  const key = String(req.body?.eventKey ?? 'bonus');
  const amount = Number(req.body?.amount) || 100000;

  const preset = LIFE_EVENT_PRESETS[key] ?? LIFE_EVENT_PRESETS.bonus;

  const parts = ['invest', 'save', 'spend', 'insurance'] as const;

  const breakdown = parts.map((p) => ({
    key: p,
    label: p.charAt(0).toUpperCase() + p.slice(1),
    pct: preset.allocation[p],
    amount: Math.round((amount * preset.allocation[p]) / 100),
  }));

  res.json({ preset, amount, breakdown });
});

// ✅ AI Chat
app.post('/api/ai/chat', async (req, res) => {
  try {
    const message = String(req.body?.message ?? '');

    let profile: Record<string, unknown> = {};

    try {
      const id = await getDemoUserId();
      profile = id ? await loadProfile(id) : memoryProfile;
    } catch {
      profile = memoryProfile;
    }

    const reply = await generateFinancialAdvice(
      message,
      JSON.stringify(profile),
    );

    res.json({ reply });
  } catch (e) {
    console.error('[AI error]', e);
    res.status(500).json({
      error: 'AI unavailable',
      reply: 'Please try again in a moment.',
    });
  }
});

// ✅ Explain life event (AI)
app.post('/api/ai/explain-life-event', async (req, res) => {
  try {
    const eventKey = String(req.body?.eventKey ?? 'bonus');
    const amount = Number(req.body?.amount) || 0;

    const preset = LIFE_EVENT_PRESETS[eventKey] ?? LIFE_EVENT_PRESETS.bonus;

    const prompt = `Explain in 4-5 sentences why this allocation makes sense for "${preset.label}" with amount ₹${amount}. Allocation: ${JSON.stringify(
      preset.allocation,
    )}`;

    const reply = await generateFinancialAdvice(prompt, '{}');

    res.json({ reply });
  } catch (e) {
    console.error('[AI explain error]', e);
    res.json({
      reply: 'A balanced split helps you grow wealth while keeping liquidity.',
    });
  }
});

// ✅ Start server
async function main() {
  try {
    await initDb();

    app.listen(PORT, () => {
      console.log(`🚀 Money Mentor API running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[startup error]', err);
    process.exit(1);
  }
}

main();
