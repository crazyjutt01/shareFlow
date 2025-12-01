
'use client';

import { notFound, useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AnswerCard from '@/components/answer-card';
import { Clock, LoaderCircle, MessageSquare } from 'lucide-react';
import { useFirestore, useDoc, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import type { Question, Answer, User } from '@/lib/types';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { postAnswer } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const answerFormSchema = z.object({
  content: z.string().min(10, 'Your answer must be at least 10 characters long.'),
});


const QuestionDetails = ({ question, author }: { question: Question, author: User | null }) => {
    const creationDate = question.creationDate ? new Date((question.creationDate as any).toDate()).toLocaleDateString() : '...';
    return (
        <div className="space-y-4">
            <h1 className="text-4xl font-bold font-headline text-foreground">{question.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <Link href={`/profile/${author?.id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                    <Avatar className="h-8 w-8">
                        {author?.photoURL && <AvatarImage src={author.photoURL} alt={author.username} />}
                        <AvatarFallback>{author?.username?.charAt(0).toUpperCase() ?? 'U'}</AvatarFallback>
                    </Avatar>
                    <span>{author?.username ?? 'Anonymous'}</span>
                </Link>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>Asked {creationDate}</span>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                {question.tags.map((tag) => (
                    <Link key={tag} href={`/questions?tag=${tag}`}>
                        <Badge variant="secondary" className="hover:bg-primary/20">{tag}</Badge>
                    </Link>
                ))}
            </div>
        </div>
    );
};

const QuestionSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
        </div>
    </div>
)


export default function QuestionPage() {
  const { id } = useParams();
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const { toast } = useToast();

  const questionRef = useMemoFirebase(() => firestore ? doc(firestore, 'questions', id as string) : null, [firestore, id]);
  const { data: question, isLoading: isQuestionLoading } = useDoc<Question>(questionRef);

  const authorRef = useMemoFirebase(() => (firestore && question?.userId) ? doc(firestore, 'users', question.userId) : null, [firestore, question?.userId]);
  const { data: author, isLoading: isAuthorLoading } = useDoc<User>(authorRef);

  const answersQuery = useMemoFirebase(() => (firestore && id) ? query(collection(firestore, 'answers'), where('questionId', '==', id)) : null, [firestore, id]);
  const { data: answers, isLoading: areAnswersLoading } = useCollection<Answer>(answersQuery);

  const form = useForm<z.infer<typeof answerFormSchema>>({
    resolver: zodResolver(answerFormSchema),
    defaultValues: {
      content: '',
    },
  });

  async function onSubmit(values: z.infer<typeof answerFormSchema>) {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in to post an answer.' });
      return;
    }
    const formData = new FormData();
    formData.append('content', values.content);
    formData.append('questionId', id as string);
    formData.append('userId', user.uid);

    const result = await postAnswer(formData);

    if (result.success) {
      toast({ title: 'Answer posted!' });
      form.reset();
    } else {
      toast({ variant: 'destructive', title: 'Failed to post answer.', description: result.error });
    }
  }
  
  const isLoading = isQuestionLoading || isAuthorLoading || isAuthLoading;

  if (isLoading) {
    return <QuestionSkeleton />;
  }

  if (!isQuestionLoading && !question) {
    notFound();
  }

  // We check for question again to satisfy TypeScript after the notFound() call
  if (!question) {
    return <QuestionSkeleton />;
  }

  const sortedAnswers = answers ? [...answers].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)) : [];

  return (
    <div className="max-w-5xl mx-auto">
      <QuestionDetails question={question} author={author} />
      
      <Separator className="my-8" />

      <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/90">
        <p>{question.description}</p>
      </div>

      <Separator className="my-8" />

      <div className="space-y-8">
        <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          {answers?.length || 0} {answers?.length === 1 ? 'Answer' : 'Answers'}
        </h2>
        {areAnswersLoading && (
            <div className="space-y-6">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        )}
        <div className="space-y-6">
          {sortedAnswers.map((answer, index) => (
            <AnswerCard key={answer.id} answer={answer} questionTitle={question.title} isTopAnswer={index === 0} />
          ))}
        </div>
      </div>

      <Separator className="my-12" />
      
      <div className="space-y-6">
         <h3 className="text-2xl font-bold font-headline">Your Answer</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Textarea
                                className="min-h-[150px]"
                                placeholder={user ? "Write your answer here..." : "You must be logged in to post an answer."}
                                disabled={!user || form.formState.isSubmitting}
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!user || form.formState.isSubmitting}>
                {form.formState.isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                Post Your Answer
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
