'use client';
import { useState } from 'react';
import type { Answer, User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "./ui/separator";
import AnswerSummary from "./answer-summary";
import VoteControl from "./vote-control";
import { useDoc, useFirestore, useMemoFirebase, useUser, updateDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";
import { Button } from "./ui/button";
import { Edit, LoaderCircle } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";

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
        <Link href={`/profile/${user.id}`} className="flex items-center gap-2 mb-2 hover:text-primary transition-colors group">
            <Avatar className="h-6 w-6">
                {user.photoURL && <AvatarImage src={user.photoURL} alt={user.username} />}
                <AvatarFallback>{user.username?.charAt(0).toUpperCase() ?? 'A'}</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-primary group-hover:underline">{user.username}</span>
        </Link>
    );
};

export default function AnswerCard({ answer, questionTitle, isTopAnswer }: AnswerCardProps) {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(answer.content);
  const [isSaving, setIsSaving] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSave = () => {
    if (!firestore || !user) return;
    setIsSaving(true);
    const answerRef = doc(firestore, 'answers', answer.id);
    updateDocumentNonBlocking(answerRef, { content: editedContent });
    setIsSaving(false);
    setIsEditing(false);
    toast({ title: "Answer updated successfully!" });
  };

  const isAuthor = user?.uid === answer.userId;

  return (
    <Card className="overflow-hidden" id={`answer-${answer.id}`}>
      <div className="flex">
        <div className="p-4 bg-muted/50 flex flex-col items-center space-y-2 w-20">
          <VoteControl answerId={answer.id} initialUpvotes={answer.upvotes} initialDownvotes={answer.downvotes} />
        </div>
        <div className="flex-1">
          <CardContent className="p-6 space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <Textarea 
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[150px]"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="prose dark:prose-invert max-w-none text-foreground/90">
                  <p>{answer.content}</p>
                </div>
                <div className="flex justify-between items-end">
                  {isAuthor && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                  )}
                  <div className="text-sm p-2 rounded-md bg-muted/50 ml-auto">
                    <AuthorInfo userId={answer.userId} />
                    <p className="text-xs text-muted-foreground">
                      answered {answer.submissionDate ? new Date(answer.submissionDate.toDate()).toLocaleDateString() : '...'}
                    </p>
                  </div>
                </div>
              </>
            )}
             {isTopAnswer && !isEditing && (
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
