"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirestore, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc, increment } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface VoteControlProps {
    answerId: string;
    initialUpvotes: number;
    initialDownvotes: number;
}

export default function VoteControl({ answerId, initialUpvotes, initialDownvotes }: VoteControlProps) {
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const handleVote = (type: 'up' | 'down') => {
    if (!user) {
        toast({ variant: 'destructive', title: 'You must be logged in to vote.' });
        return;
    }
    if (!firestore) return;

    const answerRef = doc(firestore, 'answers', answerId);
    let voteUpdate = {};

    if (voted === type) { // Un-voting
        voteUpdate = type === 'up' ? { upvotes: increment(-1) } : { downvotes: increment(-1) };
        setVoted(null);
    } else if (voted) { // Changing vote
        if (type === 'up') {
            voteUpdate = { upvotes: increment(1), downvotes: increment(-1) };
        } else {
            voteUpdate = { upvotes: increment(-1), downvotes: increment(1) };
        }
        setVoted(type);
    } else { // New vote
        voteUpdate = type === 'up' ? { upvotes: increment(1) } : { downvotes: increment(1) };
        setVoted(type);
    }

    updateDocumentNonBlocking(answerRef, voteUpdate);
  };
  
  // This is an optimistic update. We're not reading the votes back from the DB.
  const optimisticVotes = initialUpvotes - initialDownvotes;

  return (
    <div className="flex flex-col items-center space-y-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleVote('up')}
        className={cn(
          "h-8 w-8 rounded-full transition-colors duration-200",
          voted === 'up' && 'bg-accent/20 text-accent'
        )}
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
      <span className="text-lg font-bold text-foreground tabular-nums">{optimisticVotes}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleVote('down')}
        className={cn(
          "h-8 w-8 rounded-full transition-colors duration-200",
          voted === 'down' && 'bg-destructive/20 text-destructive'
        )}
      >
        <ArrowDown className="h-5 w-5" />
      </Button>
    </div>
  );
}
