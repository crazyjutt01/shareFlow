'use client';

import { Button } from '@/components/ui/button';
import { LoaderCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { QuestionList } from '@/components/question-list';
import SearchInput from '@/components/search-input';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Question } from '@/lib/types';
import { useSearchParams } from 'next/navigation';

export default function QuestionsPage() {
  const searchParams = useSearchParams();
  const firestore = useFirestore();

  const tag = searchParams.get('tag');
  const searchQuery = searchParams.get('query');

  const questionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    
    let q = query(collection(firestore, 'questions'), orderBy('creationDate', 'desc'));

    if (tag) {
      q = query(q, where('tags', 'array-contains', tag));
    }
    
    // Note: Firestore doesn't support full-text search natively on multiple fields like this.
    // This is a simplified client-side filter. For production, use a search service like Algolia.
    
    return q;
  }, [firestore, tag]);

  const { data: questions, isLoading } = useCollection<Question>(questionsQuery);
  
  const filteredQuestions = useMemoFirebase(() => {
    if (!questions) return [];
    if (!searchQuery) return questions;

    return questions.filter(question => 
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [questions, searchQuery]);


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-headline font-bold text-foreground">
          {tag ? `Questions tagged with "${tag}"` : 'All Questions'}
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
      
      {isLoading && <div className="flex justify-center py-16"><LoaderCircle className="h-8 w-8 animate-spin text-primary" /></div>}
      
      {!isLoading && filteredQuestions && <QuestionList questions={filteredQuestions} />}

      {!isLoading && filteredQuestions?.length === 0 && (
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
          <h2 className="text-xl font-semibold text-muted-foreground">No questions found</h2>
          <p className="text-muted-foreground mt-2">
            {tag || searchQuery ? "Try a different search or tag." : "Be the first to ask a question!"}
          </p>
        </div>
      )}
    </div>
  );
}
