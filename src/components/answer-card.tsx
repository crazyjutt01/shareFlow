'use client';
import type { Answer, User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "./ui/separator";
import AnswerSummary from "./answer-summary";
import VoteControl from "./vote-control";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "./ui/skeleton";

type AnswerCardProps = {
  answer: Answer;
  questionTitle: string;
  isTopAnswer: boolean;
};

const AuthorInfo = ({ userId }: { userId: string }) => {
    const firestore = useFirestore();
    const userRef = useMemoFirebase(() => firestore ? doc(firestore, 'users', userId) : null, [firestore, userId]);
    const { data: user, isLoading } = useDoc<User>(userRef);

    if (isLoading) {
        return (
            <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-20" />
            </div>
        )
    }

    if (!user) {
        return <p className="text-xs text-muted-foreground">Anonymous</p>;
    }

    return (
        <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-6 w-6">
                {user.photoURL && <AvatarImage src={user.photoURL} alt={user.username} />}
                <AvatarFallback>{user.username?.charAt(0) ?? 'A'}</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-primary">{user.username}</span>
        </div>
    );
};

export default function AnswerCard({ answer, questionTitle, isTopAnswer }: AnswerCardProps) {
  return (
    <Card className="overflow-hidden" id={`answer-${answer.id}`}>
      <div className="flex">
        <div className="p-4 bg-muted/50 flex flex-col items-center space-y-2 w-20">
          <VoteControl answerId={answer.id} initialUpvotes={answer.upvotes} initialDownvotes={answer.downvotes} />
        </div>
        <div className="flex-1">
          <CardContent className="p-6 space-y-4">
            <div className="prose dark:prose-invert max-w-none text-foreground/90">
              <p>{answer.content}</p>
            </div>
            <div className="flex justify-end">
              <div className="text-sm p-2 rounded-md bg-muted/50">
                <AuthorInfo userId={answer.userId} />
                <p className="text-xs text-muted-foreground">
                  answered {answer.submissionDate ? new Date(answer.submissionDate.toDate()).toLocaleDateString() : '...'}
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
