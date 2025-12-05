
import { Suspense } from 'react';
import { LoaderCircle } from 'lucide-react';
import QuestionsPageContent from './content';

// This is a Server Component that wraps the main content in a Suspense boundary.
// This is necessary because the QuestionsPageContent component uses `useSearchParams`.
export default function QuestionsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><LoaderCircle className="h-8 w-8 animate-spin text-primary" /></div>}>
      <QuestionsPageContent />
    </Suspense>
  );
}
