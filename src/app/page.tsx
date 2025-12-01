import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center -mt-8 min-h-[calc(100vh-10rem)]">
      <div className="max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-bold font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Discover, Share, and Grow with ShareFlow
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Join a vibrant community of developers and experts. Ask questions, provide answers, and collaborate to solve problems and build amazing things together.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/ask">
            <Button size="lg">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/questions">
            <Button size="lg" variant="outline">
              Browse Questions
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-24 w-full">
        <h2 className="text-3xl font-headline font-bold">How It Works</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-2">1. Ask Anything</h3>
            <p className="text-muted-foreground">Post your programming questions and get help from a global community of experts.</p>
          </div>
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-2">2. Share Your Knowledge</h3>
            <p className="text-muted-foreground">Answer questions and share your expertise to build your reputation and help others.</p>
          </div>
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-2">3. Grow Together</h3>
            <p className="text-muted-foreground">Learn from the best, improve your skills, and connect with fellow developers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
