'use server';
/**
 * @fileOverview An AI agent that summarizes the top-voted answer to a question.
 *
 * - summarizeTopAnswer - A function that summarizes the top-voted answer.
 * - SummarizeTopAnswerInput - The input type for the summarizeTopAnswer function.
 * - SummarizeTopAnswerOutput - The return type for the summarizeTopAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTopAnswerInputSchema = z.object({
  answerText: z
    .string()
    .describe('The text of the top-voted answer to be summarized.'),
  questionTitle: z.string().describe('The title of the question.'),
});
export type SummarizeTopAnswerInput = z.infer<typeof SummarizeTopAnswerInputSchema>;

const SummarizeTopAnswerOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the top-voted answer.'),
});
export type SummarizeTopAnswerOutput = z.infer<typeof SummarizeTopAnswerOutputSchema>;

export async function summarizeTopAnswer(
  input: SummarizeTopAnswerInput
): Promise<SummarizeTopAnswerOutput> {
  return summarizeTopAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTopAnswerPrompt',
  input: {schema: SummarizeTopAnswerInputSchema},
  output: {schema: SummarizeTopAnswerOutputSchema},
  prompt: `Summarize the following top-voted answer to the question "{{{questionTitle}}}".\n\nAnswer: {{{answerText}}}`,
});

const summarizeTopAnswerFlow = ai.defineFlow(
  {
    name: 'summarizeTopAnswerFlow',
    inputSchema: SummarizeTopAnswerInputSchema,
    outputSchema: SummarizeTopAnswerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
