
'use client';
import { notFound, useParams } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, getDocs, documentId, orderBy, Query, DocumentData } from 'firebase/firestore';
import type { User, Question, Answer } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, HelpCircle, MessageCircle, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useMemo, useEffect, useState } from 'react';
import { WithId, useCollection } from '@/firebase/firestore/use-collection';

const ProfileHeaderSkeleton = () => (
  <div className="flex items-center space-x-6">
    <Skeleton className="h-24 w-24 rounded-full" />
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-5 w-64" />
    </div>
  </div>
);

const ActivityCardSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-4 w-full" />
        </CardContent>
    </Card>
)

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
          <div className="flex items-center text-muted-foreground mt-1">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Joined on {registrationDate}</span>
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

const AnswerItem = ({ answer, question }: { answer: WithId<Answer>; question: Question | undefined }) => {
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

type AnswersState = {
    isLoading: boolean;
    answers: WithId<Answer>[];
    questions: Map<string, Question>;
}

export default function ProfilePage() {
    const { id } = useParams();
    const firestore = useFirestore();

    const userProfileRef = useMemoFirebase(() => firestore && id ? doc(firestore, 'users', id as string) : null, [firestore, id]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userProfileRef);

    const userQuestionsQuery = useMemoFirebase(() => firestore && id ? query(collection(firestore, 'questions'), where('userId', '==', id), orderBy('creationDate', 'desc')) : null, [firestore, id]);
    const { data: userQuestions, isLoading: areQuestionsLoading } = useCollection<Question>(userQuestionsQuery);
    
    const [answersState, setAnswersState] = useState<AnswersState>({
        isLoading: true,
        answers: [],
        questions: new Map(),
    });

    useEffect(() => {
        if (!firestore || !id) return;

        const fetchAnswersAndQuestions = async () => {
            setAnswersState(s => ({ ...s, isLoading: true }));

            try {
                const answersQuery = query(collection(firestore, 'answers'), where('userId', '==', id), orderBy('submissionDate', 'desc'));
                const answersSnapshot = await getDocs(answersQuery);
                const userAnswers = answersSnapshot.docs.map(d => ({ ...d.data(), id: d.id })) as WithId<Answer>[];

                if (userAnswers.length === 0) {
                     setAnswersState({ isLoading: false, answers: [], questions: new Map() });
                     return;
                }

                const questionIds = [...new Set(userAnswers.map(a => a.questionId))];
                const questionsMap = new Map<string, Question>();

                // Firestore 'in' query limit is 30. We need to batch.
                const questionPromises = [];
                for (let i = 0; i < questionIds.length; i += 30) {
                    const chunk = questionIds.slice(i, i + 30);
                    questionPromises.push(
                        getDocs(query(collection(firestore, 'questions'), where(documentId(), 'in', chunk)))
                    );
                }
                
                const questionSnapshots = await Promise.all(questionPromises);
                questionSnapshots.forEach(snap => {
                    snap.forEach(doc => {
                        questionsMap.set(doc.id, { id: doc.id, ...doc.data() } as Question);
                    });
                });
                
                setAnswersState({ isLoading: false, answers: userAnswers, questions: questionsMap });

            } catch (error) {
                console.error("Error fetching user answers and questions:", error);
                setAnswersState(s => ({ ...s, isLoading: false }));
            }
        };

        fetchAnswersAndQuestions();

    }, [firestore, id]);

    if (isProfileLoading) {
        return (
            <div className="space-y-8">
                <ProfileHeaderSkeleton />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ActivityCardSkeleton />
                    <ActivityCardSkeleton />
                </div>
            </div>
        )
    }

    if (!isProfileLoading && !userProfile) {
        notFound();
    }
    
    if (!userProfile) return null; // Should be handled by notFound, but satisfies TS

    return (
        <div className="space-y-8">
            <ProfileHeader user={userProfile} />
            <Separator />
            <Tabs defaultValue="questions" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                    <TabsTrigger value="questions">
                        <HelpCircle className="mr-2 h-4 w-4" /> Questions ({userQuestions?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="answers">
                        <MessageCircle className="mr-2 h-4 w-4" /> Answers ({answersState.answers.length || 0})
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="questions" className="mt-6">
                     {areQuestionsLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : userQuestions && userQuestions.length > 0 ? (
                        <div className="space-y-4">
                            {userQuestions.map(q => <QuestionItem key={q.id} question={q} />)}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">This user hasn't asked any questions yet.</p>
                    )}
                </TabsContent>
                <TabsContent value="answers" className="mt-6">
                    {answersState.isLoading ? (
                         <div className="flex justify-center items-center h-40">
                            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : answersState.answers.length > 0 ? (
                        <div className="space-y-4">
                            {answersState.answers.map(a => {
                                const relatedQuestion = answersState.questions.get(a.questionId);
                                return <AnswerItem key={a.id} answer={a} question={relatedQuestion} />
                            })}
                        </div>
                    ) : (
                         <p className="text-center text-muted-foreground py-8">This user hasn't answered any questions yet.</p>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
