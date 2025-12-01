"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirestore, useUser } from '@/firebase';
import { doc, increment, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface VoteControlProps {
    answerId: string;
    authorId: string; // The ID of the user who wrote the answer
    initialUpvotes: number;
    initialDownvotes: number;
}

export default function VoteControl({ answerId, authorId, initialUpvotes, initialDownvotes }: VoteControlProps) {
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

    // Again, not tracking who voted, so users can vote multiple times.
    const answerRef = doc(firestore, 'answers', answerId);
    const authorRef = doc(firestore, 'users', authorId);
    
    const batch = writeBatch(firestore);
    let voteUpdate = {};
    let reputationUpdate = {};

    if (type === 'up') {
        voteUpdate = { upvotes: increment(1) };
        reputationUpdate = { reputation: increment(10) }; // +10 for an upvote
    } else {
        voteUpdate = { downvotes: increment(1) };
        reputationUpdate = { reputation: increment(-2) }; // -2 for a downvote
    }

    batch.update(answerRef, voteUpdate);
    batch.update(authorRef, reputationUpdate);

    // Commit the batch non-blockingly
    batch.commit().catch(error => {
        console.error("Failed to apply vote and reputation update:", error);
        toast({ variant: 'destructive', title: 'Vote failed', description: 'Could not apply your vote.' });
    });

    setVoted(type); // Optimistically set the voted state
  };
  
  // This is an optimistic update. We're not reading the votes back from the DB.
  const optimisticVotes = initialUpvotes - initialDownvotes;

  return (
    <div className="flex flex-col items-center space-y-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleVote('up')}
        disabled={voted !== null}
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
        disabled={voted !== null}
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
