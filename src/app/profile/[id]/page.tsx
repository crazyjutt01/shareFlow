
'use client';
import { notFound, useParams } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import type { User, Question, Answer } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, HelpCircle, MessageCircle, LoaderCircle, Star } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { WithId, useCollection } from '@/firebase/firestore/use-collection';
import { useMemo } from 'react';

const ProfileHeader = ({ user }: { user: User }) => {
    const registrationDate = user.registrationDate
    ? new Date((user.registrationDate as any).toDate ? (user.registrationDate as any).toDate() : user.registrationDate).toLocaleDateString()
    : '...';

    return (
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <Avatar className="h-24 w-24 border-4 border-primary/50">
          {user.photoURL && <AvatarImage src={user.photoURL} alt={user.username} />}
          <AvatarFallback className="text-4xl">{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold font-headline">{user.username}</h1>
          <div className="flex items-center text-muted-foreground mt-1 space-x-4">
            <div className="flex items-center">
              <Star className="mr-1.5 h-4 w-4 text-accent" />
              <span>{user.reputation || 0} reputation</span>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-1.5 h-4 w-4" />
              <span>Joined on {registrationDate}</span>
            </div>
          </div>
        </div>
      </div>
    );
};

const QuestionItem = ({ question }: { question: WithId<Question> }) => (
    <Link href={`/question/${question.id}`} className="block">
        <Card className="hover:border-primary/50 transition-colors">
            <CardHeader>
                <CardTitle className="text-lg font-semibold hover:text-primary">{question.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
                 <p>Asked on {question.creationDate ? new Date((question.creationDate as any).toDate()).toLocaleDateString() : '...'}</p>
            </CardContent>
        </Card>
    </Link>
);

const AnswerItem = ({ answer, question }: { answer: WithId<Answer>; question: WithId<Question> | undefined }) => {
    if (!question) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </CardContent>
            </Card>
        );
    }
    return (
        <Link href={`/question/${answer.questionId}#answer-${answer.id}`} className="block">
            <Card className="hover:border-primary/50 transition-colors">
                <CardHeader>
                    <CardTitle className="text-base font-semibold hover:text-primary">
                        Answer to: {question.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                    <p className="line-clamp-2 text-muted-foreground">{answer.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                        Answered on {answer.submissionDate ? new Date((answer.submissionDate as any).toDate()).toLocaleDateString() : '...'}
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
};

const QuestionsTabContent = ({ userId, firestore }: { userId: string, firestore: any }) => {
    const userQuestionsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'questions'), where('userId', '==', userId), orderBy('creationDate', 'desc')) : null, [firestore, userId]);
    const { data: userQuestions, isLoading } = useCollection<WithId<Question>>(userQuestionsQuery);

    if (isLoading) {
        return <div className="space-y-4 mt-6"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
    }

    if (userQuestions && userQuestions.length > 0) {
        return (
            <div className="space-y-4">
                {userQuestions.map(q => <QuestionItem key={q.id} question={q} />)}
            </div>
        )
    }

    return <p className="text-center text-muted-foreground py-8">This user hasn't asked any questions yet.</p>;
}

const AnswersTabContent = ({ userId, firestore }: { userId: string, firestore: any }) => {
    const userAnswersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'answers'), where('userId', '==', userId), orderBy('submissionDate', 'desc')) : null, [firestore, userId]);
    const { data: userAnswers, isLoading: areAnswersLoading } = useCollection<WithId<Answer>>(userAnswersQuery);

    const questionIdsFromAnswers = useMemo(() => {
        if (!userAnswers) return [];
        return [...new Set(userAnswers.map(a => a.questionId))];
    }, [userAnswers]);

    const relatedQuestionsQuery = useMemoFirebase(() => {
        if (!firestore || questionIdsFromAnswers.length === 0) return null;
        // Firestore 'in' queries are limited to 30 items in the array.
        // For a production app with more answers, pagination would be needed here.
        return query(collection(firestore, 'questions'), where('__name__', 'in', questionIdsFromAnswers.slice(0, 30)));
    }, [firestore, questionIdsFromAnswers]);

    const { data: relatedQuestionsData, isLoading: areRelatedQuestionsLoading } = useCollection<WithId<Question>>(relatedQuestionsQuery);

    const relatedQuestionsMap = useMemo(() => {
        const map = new Map<string, WithId<Question>>();
        relatedQuestionsData?.forEach(q => map.set(q.id, q));
        return map;
    }, [relatedQuestionsData]);

    if (areAnswersLoading || areRelatedQuestionsLoading) {
        return <div className="space-y-4 mt-6"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
    }

    if (userAnswers && userAnswers.length > 0) {
        return (
            <div className="space-y-4">
                {userAnswers.map(a => {
                    const relatedQuestion = relatedQuestionsMap.get(a.questionId);
                    return <AnswerItem key={a.id} answer={a} question={relatedQuestion} />
                })}
            </div>
        )
    }
    
    return <p className="text-center text-muted-foreground py-8">This user hasn't answered any questions yet.</p>;
}


export default function ProfilePage() {
    const params = useParams();
    const id = params.id ? decodeURIComponent(params.id as string) : undefined;
    const firestore = useFirestore();

    const userProfileRef = useMemoFirebase(() => firestore && id ? doc(firestore, 'users', id) : null, [firestore, id]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userProfileRef);

    // FIRST: Handle the loading state for the profile itself.
    if (isProfileLoading) {
        return (
             <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }
    
    // SECOND: After loading is complete, check if the profile exists.
    if (!userProfile) {
        return notFound();
    }

    // THIRD: If the profile exists, render the page and let the tabs handle their own loading.
    return (
        <div className="space-y-8">
            <ProfileHeader user={userProfile} />
            <Separator />
            <Tabs defaultValue="questions" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                    <TabsTrigger value="questions">
                        <HelpCircle className="mr-2 h-4 w-4" /> Questions
                    </TabsTrigger>
                    <TabsTrigger value="answers">
                        <MessageCircle className="mr-2 h-4 w-4" /> Answers
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="questions" className="mt-6">
                   <QuestionsTabContent userId={id as string} firestore={firestore} />
                </TabsContent>
                <TabsContent value="answers" className="mt-6">
                    <AnswersTabContent userId={id as string} firestore={firestore} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
