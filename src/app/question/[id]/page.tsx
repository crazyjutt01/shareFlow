import { getQuestionById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AnswerCard from '@/components/answer-card';
import { Clock, MessageSquare, User } from 'lucide-react';
import type { Metadata } from 'next';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const question = await getQuestionById(params.id);

  if (!question) {
    return {
      title: 'Question Not Found',
    };
  }

  return {
    title: `${question.title} | ShareFlow`,
    description: question.description.substring(0, 150),
  };
}

export default async function QuestionPage({ params }: { params: { id: string } }) {
  const question = await getQuestionById(params.id);

  if (!question) {
    notFound();
  }

  const sortedAnswers = [...question.answers].sort((a, b) => b.votes - a.votes);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold font-headline text-foreground">{question.title}</h1>

        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={question.author.avatarUrl} alt={question.author.name} />
              <AvatarFallback>{question.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{question.author.name}</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>Asked {new Date(question.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {question.tags.map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      </div>

      <Separator className="my-8" />

      <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/90">
        <p>{question.description}</p>
      </div>

      <Separator className="my-8" />

      <div className="space-y-8">
        <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>

        <div className="space-y-6">
          {sortedAnswers.map((answer, index) => (
            <AnswerCard key={answer.id} answer={answer} questionTitle={question.title} isTopAnswer={index === 0} />
          ))}
        </div>
      </div>

      <Separator className="my-12" />
      
      <div className="space-y-6">
         <h3 className="text-2xl font-bold font-headline">Your Answer</h3>
        {/* In a real app, this form would be handled by a server action */}
        <form className="grid gap-4">
          <Textarea className="min-h-[150px]" placeholder="Write your answer here..." />
          <div className="flex justify-end">
            <Button>Post Your Answer</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
