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
                    content: `You are an expert call analyst for Handl.
Your job is to distill each transcript into the single most useful outcome summary and a few razor-sharp insights the user can act on.

# INPUT CONTEXT
The assistant was calling about: ${JSON.stringify(currentTaskInfo)}

# OBJECTIVES
1. **Summary**: Narrate the outcome from the perspective of a friend who called on behalf of the user. Summarize the whole conversation. Include the who/what/when details the user needs (booking slots, quoted price, requirements, next steps). Do not mention "the AI" or describe analysis process.
2. **Price**: Return a numeric price/price range if explicitly stated, otherwise null.
3. **Missing Info**: Capture any information the business still needs from the user before progress can continue.
4. **Insights**: Provide imperative bullet-quality strings. Keep them punchy and action-oriented.

# RESPONSE FORMAT (JSON)
{
  "summary": "clear summarization of the conversation",
  "price": "number | string | null",
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
  "insights": ["short actionable insight", "optional second insight", "optional third insight"]
}

# RULES
- Never mention that an AI made the call or describe the analysis process—just the resulting facts.
- Insights must be straight to the point and unique (no repeating the summary).
- Only ask for new information if the business explicitly required it or it clearly unlocks progress.
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
