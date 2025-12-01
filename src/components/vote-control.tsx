"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function VoteControl({ votes }: { votes: number }) {
  const [currentVotes, setCurrentVotes] = useState(votes);
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);

  const handleVote = (type: 'up' | 'down') => {
    if (voted === type) {
      // Unvote
      setCurrentVotes(votes);
      setVoted(null);
    } else {
      // New vote or change vote
      const newVotes = votes + (type === 'up' ? 1 : -1) - (voted ? (voted === 'up' ? 1 : -1) : 0);
      setCurrentVotes(newVotes);
      setVoted(type);
    }
  };

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
      <span className="text-lg font-bold text-foreground tabular-nums">{currentVotes}</span>
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
