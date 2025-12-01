import type { Answer } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "./ui/separator";
import AnswerSummary from "./answer-summary";
import VoteControl from "./vote-control";

type AnswerCardProps = {
  answer: Answer;
  questionTitle: string;
  isTopAnswer: boolean;
};

export default function AnswerCard({ answer, questionTitle, isTopAnswer }: AnswerCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div className="p-4 bg-muted/50 flex flex-col items-center space-y-2 w-20">
          <VoteControl votes={answer.votes} />
        </div>
        <div className="flex-1">
          <CardContent className="p-6 space-y-4">
            <div className="prose dark:prose-invert max-w-none text-foreground/90">
              <p>{answer.content}</p>
            </div>
            <div className="flex justify-end">
              <div className="text-sm p-2 rounded-md bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={answer.author.avatarUrl} alt={answer.author.name} />
                    <AvatarFallback>{answer.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-primary">{answer.author.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  answered {new Date(answer.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
             {isTopAnswer && (
               <>
                <Separator className="my-4"/>
                <AnswerSummary questionTitle={questionTitle} answerText={answer.content} />
               </>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
