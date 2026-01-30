import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { transcript, currentTaskInfo } = await request.json();

        if (!transcript) {
            return NextResponse.json(
                { error: "Transcript is required" },
                { status: 400 }
            );
        }

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an expert call analyst for Handl, an AI calling service.
Your job is to analyze the transcript of a phone call made by our AI assistant to a business and extract key insights.

# INPUT CONTEXT
The assistant was calling about: ${JSON.stringify(currentTaskInfo)}

# OBJECTIVES
1. **Summarize**: Provide a concise 2-3 sentence summary of the call outcome.
2. **Extract Price**: If any specific price, quote, or price range was mentioned, extract it. (Format: "number" or "min-max").
3. **Identify Missing Info**: Did the business ask for information we didn't have? Or did the call reveal that more details are needed from the user before we can proceed effectively with other businesses?
4. **Negotiation Context**: What information from this call could be useful for the NEXT call to a different business? (e.g., "They quoted $100 but said they can do it today").

# RESPONSE FORMAT (JSON)
{
  "summary": "Clear summary of the call",
  "price": "number or string or null",
  "hasNewQuestions": boolean,
  "newQuestions": [
    {
      "field": "internal_field_name",
      "reason": "why we need this info now",
      "question": "friendly question for the user",
      "type": "text | select | number | tel | date | textarea",
      "required": boolean,
      "options": ["optional", "for", "select"],
      "placeholder": "example input"
    }
  ],
  "insights": "Key findings for the next call"
}

# RULES FOR NEW QUESTIONS
- Only ask for information that is ABSOLUTELY necessary to improve the next call or that was explicitly requested by the business.
- Use natural, friendly language.
`,
                },
                {
                    role: "user",
                    content: `Here is the transcript to analyze:\n\n${transcript}`,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            response_format: { type: "json_object" },
        });

        const analysis = JSON.parse(completion.choices[0]?.message?.content || "{}");
        return NextResponse.json({ analysis });
    } catch (error) {
        console.error("Call analysis error:", error);
        return NextResponse.json(
            { error: "Failed to analyze call" },
            { status: 500 }
        );
    }
}
