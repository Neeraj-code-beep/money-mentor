import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
export async function generateFinancialAdvice(prompt, contextJson) {
    const system = `You are Money Mentor, a concise, friendly personal finance coach for Indian users. 
Use short paragraphs and bullet points when helpful. Never promise guaranteed returns. 
Context about the user (JSON): ${contextJson}`;
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const tryModels = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-latest"];
        let lastErr;
        for (const name of tryModels) {
            try {
                const model = genAI.getGenerativeModel({ model: name });
                const r = await model.generateContent([{ text: system + "\n\nUser:\n" + prompt }]);
                const text = r.response.text();
                if (text)
                    return text;
            }
            catch (e) {
                lastErr = e;
            }
        }
        console.warn("[ai] Gemini failed:", lastErr);
    }
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
        const openai = new OpenAI({ apiKey: openaiKey });
        const chat = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: system },
                { role: "user", content: prompt },
            ],
            temperature: 0.6,
            max_tokens: 800,
        });
        return chat.choices[0]?.message?.content ?? "I could not generate a response.";
    }
    return `Money Mentor (offline mode): Based on your numbers, focus on emergency fund → high-interest debt → diversified SIPs. ${prompt.slice(0, 200)}`;
}
