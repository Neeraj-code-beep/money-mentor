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
You are **Money Mentor**, a smart personal finance assistant for Indian users.

Rules:
• Give practical financial advice
• Use simple language
• Use bullet points
• Never promise guaranteed returns
• Focus on saving, budgeting, investing safely

User Information:
Age: ${context.age ?? 'Unknown'}
Monthly Income: ₹${context.income ?? 'Unknown'}
Savings: ₹${context.savings ?? 'Unknown'}
Risk Level: ${context.riskLevel ?? 'Unknown'}
Financial Goals: ${context.goals?.join(', ') ?? 'Unknown'}

Your job is to help the user make better financial decisions.
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
          model: 'llama3-8b-8192',
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
