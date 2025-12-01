import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center -mt-8 min-h-[calc(100vh-10rem)]">
      <ShieldAlert className="w-24 h-24 text-destructive/70 mb-6" />
      <h1 className="text-5xl md:text-7xl font-bold font-headline">404 - Page Not Found</h1>
      <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
        Oops! The page you are looking for does not exist. It might have been moved or deleted.
      </p>
      <div className="mt-8">
        <Link href="/">
          <Button size="lg">
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
