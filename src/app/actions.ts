"use server";

import { summarizeTopAnswer } from "@/ai/flows/summarize-top-answer";
import { z } from "zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getSdks } from "@/firebase";

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

const questionSchema = z.object({
    title: z.string().min(10).max(150),
    description: z.string().min(20),
    tags: z.string(),
    userId: z.string(),
});

export async function postQuestion(formData: FormData) {
    try {
        const { title, description, tags, userId } = questionSchema.parse({
            title: formData.get('title'),
            description: formData.get('description'),
            tags: formData.get('tags'),
            userId: formData.get('userId'),
        });

        const { firestore } = getSdks();
        
        await addDoc(collection(firestore, 'questions'), {
            userId,
            title,
            description,
            tags: tags.split(',').map(tag => tag.trim()),
            creationDate: serverTimestamp(),
            // a new question has no answers and 0 votes
            answers: [],
            votes: 0,
        });

        return { success: true, error: null };
    } catch (e: any) {
        console.error(e);
        return { success: false, error: e.message || 'Failed to post question.' };
    }
}

const answerSchema = z.object({
    content: z.string().min(1),
    questionId: z.string(),
    userId: z.string(),
});

export async function postAnswer(formData: FormData) {
    try {
        const { content, questionId, userId } = answerSchema.parse({
            content: formData.get('content'),
            questionId: formData.get('questionId'),
            userId: formData.get('userId'),
        });

        const { firestore } = getSdks();

        await addDoc(collection(firestore, 'answers'), {
            questionId,
            userId,
            content,
            submissionDate: serverTimestamp(),
            upvotes: 0,
            downvotes: 0,
        });

        return { success: true, error: null };
    } catch (e: any) {
        console.error(e);
        return { success: false, error: e.message || 'Failed to post answer.' };
    }
}
