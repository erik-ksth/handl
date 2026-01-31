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
1. **Summarize**: Provide an extremely concise summary of the call outcome in 15 words or less. No conversational filler or narrative. Just the facts (e.g., "Confirmed booking for Tuesday 2 PM at $85.").
2. **Extract Price**: If any specific price, quote, or price range was mentioned, extract it. (Format: "number" or "min-max").
3. **Identify Missing Info**: Did the business ask for information we didn't have? Or did the call reveal that more details are needed from the user before we can proceed effectively with other businesses?
4. **Strategic Leverage**: What information from this call can be used as leverage in the NEXT call? (e.g., "Business A quoted $100; ask Business B to beat it").

# RESPONSE FORMAT (JSON)
{
  "summary": "Clear, factual summary of the call outcome (15 words max)",
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
  "insights": "Strategic leverage gained from this call to use in future calls (e.g., 'Use $85 price to negotiate with Business B')"
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
