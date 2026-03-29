/** Money Mentor — deterministic financial calculations (India-oriented demo). */
function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
}
function scoreFromSavingsRate(pct) {
    if (pct >= 35)
        return 100;
    if (pct >= 25)
        return 85;
    if (pct >= 15)
        return 65;
    if (pct >= 8)
        return 45;
    return clamp(20 + pct * 2, 15, 40);
}
function scoreFromDTI(pct) {
    if (pct <= 15)
        return 100;
    if (pct <= 30)
        return 75;
    if (pct <= 40)
        return 55;
    return clamp(100 - pct * 1.5, 20, 50);
}
function scoreFromEmergency(months) {
    if (months >= 9)
        return 100;
    if (months >= 6)
        return 85;
    if (months >= 3)
        return 60;
    return clamp(months * 18, 15, 55);
}
function scoreFromInvestmentRatio(pct) {
    if (pct >= 40)
        return 100;
    if (pct >= 25)
        return 80;
    if (pct >= 15)
        return 60;
    return clamp(pct * 3, 20, 55);
}
function scoreFromStability(score0to100) {
    return clamp(score0to100, 20, 100);
}
function scoreFromCredit(score0to100) {
    return clamp(score0to100, 25, 100);
}
export function computeMoneyHealth(input) {
    const income = Math.max(input.monthlyIncome, 1);
    const savings = Math.max(income - input.monthlyExpenses, 0);
    const savingsRate = (savings / income) * 100;
    const dti = (input.monthlyDebtPayment / income) * 100;
    const emergencyMonths = input.monthlyExpenses > 0 ? input.liquidSavings / input.monthlyExpenses : 12;
    const investmentRatio = (input.monthlyInvestments / income) * 100;
    const factors = {
        savingsRate: scoreFromSavingsRate(savingsRate),
        debtToIncome: scoreFromDTI(dti),
        emergencyMonths: scoreFromEmergency(emergencyMonths),
        investmentRatio: scoreFromInvestmentRatio(investmentRatio),
        expenseStability: scoreFromStability(input.expenseStabilityScore ?? 72),
        creditHealth: scoreFromCredit(input.creditHealthScore ?? 78),
    };
    const weights = [0.22, 0.18, 0.18, 0.15, 0.14, 0.13];
    const names = [
        "Savings rate",
        "Debt load",
        "Emergency buffer",
        "Investing discipline",
        "Expense stability",
        "Credit health",
    ];
    const vals = [
        factors.savingsRate,
        factors.debtToIncome,
        factors.emergencyMonths,
        factors.investmentRatio,
        factors.expenseStability,
        factors.creditHealth,
    ];
    let score = 0;
    const breakdown = names.map((name, i) => {
        const w = weights[i];
        const v = vals[i];
        score += v * w;
        return { name, value: Math.round(v), weight: Math.round(w * 100) };
    });
    score = Math.round(clamp(score, 0, 100));
    let label = "Needs attention";
    let color = "red";
    if (score >= 75) {
        label = "Excellent";
        color = "green";
    }
    else if (score >= 55) {
        label = "Good";
        color = "yellow";
    }
    return { score, label, color, factors, breakdown };
}
export function projectSipGrowth(params) {
    const r = params.annualReturnPct / 100 / 12;
    const n = params.years * 12;
    const pmt = params.monthlySip;
    const out = [];
    for (let y = 1; y <= params.years; y++) {
        const months = y * 12;
        let fv = 0;
        if (r === 0)
            fv = pmt * months;
        else
            fv = pmt * ((Math.pow(1 + r, months) - 1) / r);
        out.push({ year: y, value: Math.round(fv) });
    }
    return out;
}
export function fireMonthlySip(params) {
    const years = Math.max(params.retirementAge - params.currentAge, 1);
    const months = years * 12;
    const r = params.annualReturnPct / 100 / 12;
    const fvExisting = params.currentSavings * Math.pow(1 + params.annualReturnPct / 100, years);
    const gap = Math.max(params.goalAmount - fvExisting, 0);
    let monthly = 0;
    if (r === 0)
        monthly = gap / months;
    else
        monthly = (gap * r) / (Math.pow(1 + r, months) - 1);
    return {
        monthlySip: Math.round(monthly),
        monthsToGoal: months,
        yearsToRetirement: years,
    };
}
/** Simplified Indian tax illustration — not legal advice. */
export function computeTaxIndia(params) {
    const std = params.standardDeduction ?? 50000;
    const oldTaxable = Math.max(params.grossSalary - std - Math.min(params.deductions80C, 150000) - params.deductionsOther, 0);
    const newTaxable = Math.max(params.grossSalary - std, 0);
    const slabOld = (ti) => {
        let t = 0;
        let rem = ti;
        const brackets = [
            { limit: 250000, rate: 0 },
            { limit: 500000, rate: 0.05 },
            { limit: 1000000, rate: 0.2 },
            { limit: Infinity, rate: 0.3 },
        ];
        let prev = 0;
        for (const b of brackets) {
            const slice = Math.min(Math.max(rem, 0), b.limit - prev);
            t += slice * b.rate;
            rem -= slice;
            prev = b.limit;
            if (rem <= 0)
                break;
        }
        return t;
    };
    const slabNew = (ti) => {
        let t = 0;
        let rem = ti;
        const brackets = [
            { limit: 300000, rate: 0 },
            { limit: 700000, rate: 0.05 },
            { limit: 1000000, rate: 0.1 },
            { limit: 1200000, rate: 0.15 },
            { limit: 1500000, rate: 0.2 },
            { limit: Infinity, rate: 0.3 },
        ];
        let prev = 0;
        for (const b of brackets) {
            const slice = Math.min(Math.max(rem, 0), b.limit - prev);
            t += slice * b.rate;
            rem -= slice;
            prev = b.limit;
            if (rem <= 0)
                break;
        }
        return t;
    };
    const old = slabOld(oldTaxable);
    const neu = slabNew(newTaxable);
    const better = old <= neu ? "old" : "new";
    const savingsIfSwitch = Math.abs(old - neu);
    return {
        oldRegime: Math.round(old),
        newRegime: Math.round(neu),
        better,
        savingsIfSwitch: Math.round(savingsIfSwitch),
        effectiveOldPct: params.grossSalary ? Math.round((old / params.grossSalary) * 1000) / 10 : 0,
        effectiveNewPct: params.grossSalary ? Math.round((neu / params.grossSalary) * 1000) / 10 : 0,
    };
}
export const LIFE_EVENT_PRESETS = {
    bonus: {
        label: "Bonus",
        emoji: "💰",
        allocation: { invest: 45, save: 25, spend: 22, insurance: 8 },
    },
    marriage: {
        label: "Marriage",
        emoji: "💍",
        allocation: { invest: 20, save: 35, spend: 35, insurance: 10 },
    },
    baby: {
        label: "Baby",
        emoji: "👶",
        allocation: { invest: 15, save: 40, spend: 30, insurance: 15 },
    },
    inheritance: {
        label: "Inheritance",
        emoji: "🏠",
        allocation: { invest: 55, save: 25, spend: 12, insurance: 8 },
    },
};
