'use client';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUp, MessageSquare } from 'lucide-react';
import type { Question, User } from '@/lib/types';
import { useDoc, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';


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

const AnswerCount = ({ questionId }: { questionId: string }) => {
    const firestore = useFirestore();
    const answersQuery = useMemoFirebase(() => (firestore && questionId) ? query(collection(firestore, 'answers'), where('questionId', '==', questionId)) : null, [firestore, questionId]);
    const { data: answers, isLoading } = useCollection(answersQuery);

    return (
        <div className="flex items-center" title="Answers">
            <MessageSquare className="mr-1 h-4 w-4" />
            {isLoading ? '...' : answers?.length || 0}
        </div>
    )
}


interface QuestionCardProps {
  question: Question;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader>
        <CardTitle className="font-headline text-xl">
          <Link href={`/question/${question.id}`} className="hover:text-primary transition-colors">
            {question.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <Link key={tag} href={`/questions?tag=${tag}`}>
                <Badge variant="secondary" className="hover:bg-primary/20 transition-colors">{tag}</Badge>
              </Link>
            ))}
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground w-full sm:w-auto justify-end">
            <div className="flex items-center" title="Votes">
              <ArrowUp className="mr-1 h-4 w-4" />
              {question.votes}
            </div>
            <AnswerCount questionId={question.id} />
            <AuthorInfo userId={question.userId} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
