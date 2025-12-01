'use client';
import { notFound, useParams } from 'next/navigation';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import type { User, Question, Answer } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, HelpCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';

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
    const registrationDate = user.registrationDate instanceof Date 
        ? user.registrationDate 
        : user.registrationDate?.toDate();

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
            <span>Joined on {registrationDate ? registrationDate.toLocaleDateString() : '...'}</span>
          </div>
        </div>
      </div>
    );
};

const QuestionItem = ({ question }: { question: Question }) => (
    <Link href={`/question/${question.id}`} className="block">
        <Card className="hover:border-primary/50 transition-colors">
            <CardHeader>
                <CardTitle className="text-lg font-semibold hover:text-primary">{question.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
                <p>Asked on {question.creationDate.toDate().toLocaleDateString()}</p>
            </CardContent>
        </Card>
    </Link>
);

const AnswerItem = ({ answer, questions }: { answer: Answer; questions: Question[] }) => {
    const relatedQuestion = questions.find(q => q.id === answer.questionId);
    return (
        <Link href={`/question/${answer.questionId}#answer-${answer.id}`} className="block">
            <Card className="hover:border-primary/50 transition-colors">
                <CardHeader>
                     <CardTitle className="text-lg font-semibold hover:text-primary">
                        Answer to: {relatedQuestion?.title ?? 'a question'}
                     </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="line-clamp-2 text-foreground/90">{answer.content}</p>
                    <p className="text-sm text-muted-foreground">
                        Answered on {answer.submissionDate.toDate().toLocaleDateString()}
                    </p>
                </CardContent>
            </Card>
        </Link>
    )
};


export default function ProfilePage() {
  const { id } = useParams();
  const firestore = useFirestore();

  const userRef = useMemoFirebase(() => firestore ? doc(firestore, 'users', id as string) : null, [firestore, id]);
  const { data: user, isLoading: isUserLoading } = useDoc<User>(userRef);

  const questionsQuery = useMemoFirebase(() => (firestore && id) ? query(collection(firestore, 'questions'), where('userId', '==', id), orderBy('creationDate', 'desc')) : null, [firestore, id]);
  const { data: questions, isLoading: areQuestionsLoading } = useCollection<Question>(questionsQuery);
  
  const answersQuery = useMemoFirebase(() => (firestore && id) ? query(collection(firestore, 'answers'), where('userId', '==', id), orderBy('submissionDate', 'desc')) : null, [firestore, id]);
  const { data: answers, isLoading: areAnswersLoading } = useCollection<Answer>(answersQuery);
  
  const allQuestionIds = useMemoFirebase(() => {
    if (!answers) return [];
    const ids = answers.map(a => a.questionId);
    return [...new Set(ids)];
  }, [answers]);

  const allQuestionsQuery = useMemoFirebase(() => {
    if (!firestore || allQuestionIds.length === 0) return null;
    return query(collection(firestore, 'questions'), where('__name__', 'in', allQuestionIds));
  }, [firestore, allQuestionIds]);
  const { data: allQuestions, isLoading: areAllQuestionsLoading } = useCollection<Question>(allQuestionsQuery);


  if (isUserLoading) {
    return <ProfileHeaderSkeleton />;
  }

  if (!user) {
    notFound();
  }

  const isLoading = areQuestionsLoading || areAnswersLoading || areAllQuestionsLoading;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <ProfileHeader user={user} />
      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="questions">
            <HelpCircle className="mr-2 h-4 w-4" />
            Questions ({questions?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="answers">
            <MessageCircle className="mr-2 h-4 w-4" />
            Answers ({answers?.length ?? 0})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="questions" className="mt-6">
            {isLoading ? (
                 <div className="space-y-4">
                    <ActivityCardSkeleton />
                    <ActivityCardSkeleton />
                </div>
            ) : questions && questions.length > 0 ? (
                <div className="space-y-4">
                    {questions.map((q) => <QuestionItem key={q.id} question={q} />)}
                </div>
            ) : (
                <p className="text-center text-muted-foreground py-8">This user hasn&apos;t asked any questions yet.</p>
            )}
        </TabsContent>
        <TabsContent value="answers" className="mt-6">
            {isLoading ? (
                <div className="space-y-4">
                    <ActivityCardSkeleton />
                    <ActivityCardSkeleton />
                </div>
            ) : answers && allQuestions && answers.length > 0 ? (
                <div className="space-y-4">
                    {answers.map((a) => <AnswerItem key={a.id} answer={a} questions={allQuestions} />)}
                </div>
            ) : (
                <p className="text-center text-muted-foreground py-8">This user hasn&apos;t answered any questions yet.</p>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
