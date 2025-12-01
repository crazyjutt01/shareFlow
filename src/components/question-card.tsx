import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUp, MessageSquare } from 'lucide-react';
import type { Question } from '@/lib/types';

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
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground w-full sm:w-auto justify-end">
            <div className="flex items-center" title="Votes">
              <ArrowUp className="mr-1 h-4 w-4" />
              {question.votes}
            </div>
            <div className="flex items-center" title="Answers">
              <MessageSquare className="mr-1 h-4 w-4" />
              {question.answers.length}
            </div>
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={question.author.avatarUrl} />
                <AvatarFallback>{question.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="truncate">{question.author.name}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
