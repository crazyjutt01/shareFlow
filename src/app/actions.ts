"use server";

import { summarizeTopAnswer } from "@/ai/flows/summarize-top-answer";
import { z } from "zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';


// Server-side Firebase initialization
let firebaseApp: FirebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}
const firestore: Firestore = getFirestore(firebaseApp);

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
