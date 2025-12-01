"use client";

import React, { useTransition } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Sparkles, LoaderCircle } from "lucide-react";
import { getSummary } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

type AnswerSummaryProps = {
  questionTitle: string;
  answerText: string;
};

export default function AnswerSummary({ questionTitle, answerText }: AnswerSummaryProps) {
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleSummarize = () => {
    const formData = new FormData();
    formData.append("questionTitle", questionTitle);
    formData.append("answerText", answerText);
    
    startTransition(async () => {
      const result = await getSummary(formData);
      if (result.error) {
        setError(result.error);
        toast({
            variant: "destructive",
            title: "Summarization Failed",
            description: result.error,
        });
      } else {
        setSummary(result.summary);
      }
    });
  };

  if (summary) {
    return (
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="font-semibold text-primary hover:no-underline">
            <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                AI Generated Summary
            </div>
          </AccordionTrigger>
          <AccordionContent className="prose dark:prose-invert text-foreground/80 pt-2">
            {summary}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        onClick={handleSummarize}
        disabled={isPending}
        className="bg-transparent border-accent text-accent hover:bg-accent/10 hover:text-accent"
      >
        {isPending ? (
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        {isPending ? "Generating..." : "Summarize with AI"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
