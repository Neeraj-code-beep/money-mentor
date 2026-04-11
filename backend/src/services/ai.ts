import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

/*
|--------------------------------------------------------------------------
| Validate Environment Variables
|--------------------------------------------------------------------------
*/

const API_KEY = process.env.GROQ_API_KEY;

if (!API_KEY) {
  throw new Error('❌ GROQ_API_KEY is missing in .env file');
}

/*
|--------------------------------------------------------------------------
| Initialize Groq Client
|--------------------------------------------------------------------------
*/

const groq = new Groq({
  apiKey: API_KEY,
});

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type UserContext = {
  age?: number;
  income?: number;
  savings?: number;
  goals?: string[];
  riskLevel?: 'low' | 'medium' | 'high';
};

/*
|--------------------------------------------------------------------------
| Helper: Sleep (for retries)
|--------------------------------------------------------------------------
*/

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
|--------------------------------------------------------------------------
| Prompt Builder
|--------------------------------------------------------------------------
*/

function buildSystemPrompt(context: UserContext) {
  return `
You are **Money Mentor**, a smart and practical personal finance advisor for Indian users.

━━━━━━━━━━━━━━━━━━━━━━━
🎯 YOUR GOAL
━━━━━━━━━━━━━━━━━━━━━━━
Give clear, structured, actionable financial advice that is:
- Easy to read
- Short but valuable
- Practical (real-life use)
- India-focused (₹, SIP, FD, etc.)

━━━━━━━━━━━━━━━━━━━━━━━
⚠️ STRICT RULES (MUST FOLLOW)
━━━━━━━━━━━━━━━━━━━━━━━
- DO NOT write paragraphs
- DO NOT give long explanations
- ALWAYS follow structured format
- ALWAYS use bullet points (•)
- Keep sentences short (1 line max)
- No fluff, no theory
- No guaranteed returns claims

━━━━━━━━━━━━━━━━━━━━━━━
👤 USER CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━
• Age: ${context.age ?? 'Unknown'}
• Income: ₹${context.income ?? 'Unknown'}
• Savings: ₹${context.savings ?? 'Unknown'}
• Risk Level: ${context.riskLevel ?? 'Unknown'}
• Goals: ${context.goals?.join(', ') ?? 'Unknown'}

━━━━━━━━━━━━━━━━━━━━━━━
📊 RESPONSE FORMAT (STRICTLY FOLLOW)
━━━━━━━━━━━━━━━━━━━━━━━

💰 Summary:
• (1 short line only)

📊 Action Plan:
• Step 1:
• Step 2:
• Step 3:
• Step 4 (optional)

💡 Smart Tips:
• Tip 1
• Tip 2

⚠️ Avoid:
• Mistake 1
• Mistake 2

━━━━━━━━━━━━━━━━━━━━━━━
📌 EXAMPLE (FOLLOW THIS STYLE)
━━━━━━━━━━━━━━━━━━━━━━━

💰 Summary:
• Save and invest consistently to build wealth

📊 Action Plan:
• Track all expenses
• Follow 50-30-20 rule
• Start SIP in index fund
• Build emergency fund

💡 Smart Tips:
• Automate your savings
• Increase SIP yearly

⚠️ Avoid:
• Overspending on lifestyle
• Investing without research

━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT:
Always follow this exact format. No extra text outside sections.
`;
}
/*
|--------------------------------------------------------------------------
| Core AI Function
|--------------------------------------------------------------------------
*/

export async function generateFinancialAdvice(
  prompt: string,
  context: UserContext = {},
): Promise<string> {
  const systemPrompt = buildSystemPrompt(context);

  const MAX_RETRIES = 3;
  const TIMEOUT = 20000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const completion = (await Promise.race([
        groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          temperature: 0.7,
          max_tokens: 400,

          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),

        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI request timeout')), TIMEOUT),
        ),
      ])) as any;

      const reply = completion?.choices?.[0]?.message?.content?.trim();

      if (!reply) {
        throw new Error('Empty response from AI');
      }

      return reply;
    } catch (error: any) {
      console.error(`⚠️ AI attempt ${attempt} failed:`, error.message);

      if (attempt === MAX_RETRIES) {
        return fallbackResponse(prompt);
      }

      await sleep(1000 * attempt);
    }
  }

  return fallbackResponse(prompt);
}

/*
|--------------------------------------------------------------------------
| Fallback Response
|--------------------------------------------------------------------------
*/

function fallbackResponse(prompt: string): string {
  if (prompt.toLowerCase().includes('invest')) {
    return `
Here are some basic investment tips:

• Start with SIP in index mutual funds
• Build an emergency fund (3–6 months expenses)
• Avoid high-risk trading
• Diversify your investments
`;
  }

  if (prompt.toLowerCase().includes('save')) {
    return `
Tips to save money:

• Follow the 50-30-20 rule
• Track monthly expenses
• Automate savings
• Avoid unnecessary subscriptions
`;
  }

  return `
I'm temporarily unable to generate detailed advice.

Basic financial tips:

• Save at least 20% of your income
• Build an emergency fund
• Invest long-term in diversified assets
`;
}
