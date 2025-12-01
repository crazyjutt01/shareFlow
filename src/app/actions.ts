"use server";

import { summarizeTopAnswer } from "@/ai/flows/summarize-top-answer";
import { z } from "zod";

const summarySchema = z.object({
  questionTitle: z.string(),
  answerText: z.string(),
});

export async function getSummary(formData: FormData) {
  try {
    const { questionTitle, answerText } = summarySchema.parse({
      questionTitle: formData.get("questionTitle"),
      answerText: formData.get("answerText"),
    });

    const result = await summarizeTopAnswer({
      questionTitle,
      answerText,
    });
    
    return { summary: result.summary, error: null };
  } catch (e: any) {
    console.error(e);
    return { summary: null, error: e.message || "Failed to generate summary." };
  }
}
