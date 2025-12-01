import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { getQuestions } from '@/lib/data';
import { QuestionList } from '@/components/question-list';
import SearchInput from '@/components/search-input';

export default async function Home({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    tag?: string;
  };
}) {
  const query = searchParams?.query || '';
  const tag = searchParams?.tag || '';
  const questions = await getQuestions({ query, tag });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-headline font-bold text-foreground">
          All Questions
        </h1>
        <Link href="/ask">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ask Question
          </Button>
        </Link>
      </div>

      <div className="flex justify-center w-full">
        <div className="w-full max-w-2xl">
          <SearchInput />
        </div>
      </div>
      
      <QuestionList questions={questions} />

      {questions.length === 0 && (
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
          <h2 className="text-xl font-semibold text-muted-foreground">No questions found</h2>
          <p className="text-muted-foreground mt-2">
            Be the first to ask a question!
          </p>
        </div>
      )}
    </div>
  );
}
