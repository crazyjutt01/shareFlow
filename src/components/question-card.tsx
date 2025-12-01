'use client';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUp, MessageSquare } from 'lucide-react';
import type { Question, User } from '@/lib/types';
import { useDoc, useFirestore, useCollection, useMemoFirebase, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, where, increment } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';


const AuthorInfo = ({ userId }: { userId: string }) => {
    const firestore = useFirestore();
    const userRef = useMemoFirebase(() => firestore ? doc(firestore, 'users', userId) : null, [firestore, userId]);
    const { data: user, isLoading } = useDoc<User>(userRef);

    if (isLoading) {
        return (
             <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-20" />
            </div>
        )
    }

    if (!user) {
        return <div className="text-xs text-muted-foreground">Anonymous</div>
    }
    
    return (
        <Link href={`/profile/${user.id}`} className="flex items-center space-x-2 hover:text-primary transition-colors">
            <Avatar className="h-6 w-6">
                {user.photoURL && <AvatarImage src={user.photoURL} alt={user.username}/>}
                <AvatarFallback>{user.username?.charAt(0).toUpperCase() ?? 'A'}</AvatarFallback>
            </Avatar>
            <span className="truncate">{user.username}</span>
        </Link>
    )
}

interface QuestionCardProps {
  question: Question;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isVoting, setIsVoting] = useState(false);
  
  // NOTE: This does not track who voted, so a user can vote multiple times.
  // A production app would store voter IDs in a subcollection to prevent this.
  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to question page
    e.stopPropagation(); // Stop event bubbling
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in to vote.' });
      return;
    }
    if (!firestore) return;
    
    setIsVoting(true);
    const questionRef = doc(firestore, 'questions', question.id);
    
    // For simplicity, we just increment. A real app would track who voted.
    updateDocumentNonBlocking(questionRef, { votes: increment(1) });
    
    // We don't need to set isVoting to false, as the component will re-render
    // with the optimistic update and the button will be gone.
    // For this simple implementation, we're not handling un-voting.
  }

  return (
    <Card className="hover:border-primary/50 transition-colors">
       <div className="flex">
        <div className="p-4 flex flex-col items-center justify-start space-y-2 bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVote}
            disabled={isVoting || !user}
            aria-label="Upvote question"
            className="h-8 w-8 rounded-full transition-colors duration-200 hover:bg-accent/20 hover:text-accent"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
          <span className="text-lg font-bold text-foreground tabular-nums" title={`${question.votes} votes`}>{question.votes}</span>
        </div>

        <div className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="font-headline text-xl">
              <Link href={`/question/${question.id}`} className="hover:text-primary transition-colors">
                {question.title}
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-muted-foreground line-clamp-2 text-sm mb-4">{question.description}</p>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag) => (
                  <Link key={tag} href={`/questions?tag=${tag}`}>
                    <Badge variant="secondary" className="hover:bg-primary/20 transition-colors">{tag}</Badge>
                  </Link>
                ))}
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground w-full sm:w-auto justify-end">
                <AuthorInfo userId={question.userId} />
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
