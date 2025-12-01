
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, LogIn, UserPlus, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { Logo } from '../logo';
import { useUser, useAuth } from '@/firebase';
import { Skeleton } from '../ui/skeleton';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    auth.signOut();
    router.push('/');
  };

  const navigateToProfile = () => {
    if (user) {
      router.push(`/profile/${user.uid}`);
    }
  };

  const navigateToSettings = () => {
    router.push('/settings');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-auto flex items-center">
            <Link href="/" className="mr-6 flex items-center space-x-2">
                <Logo />
            </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/ask">
            <Button size="sm" className="hidden sm:flex">
              <Plus className="mr-2 h-4 w-4" />
              Ask Question
            </Button>
          </Link>
          <Link href="/ask">
            <Button size="icon" variant="outline" className="sm:hidden">
              <Plus className="h-4 w-4" />
              <span className="sr-only">Ask Question</span>
            </Button>
          </Link>

          {isUserLoading && (
            <Skeleton className="h-9 w-9 rounded-full" />
          )}

          {!isUserLoading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
                    <AvatarFallback>{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={navigateToProfile}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={navigateToSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : !isUserLoading && (
            <div className='flex items-center gap-2'>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  <LogIn className='mr-2 h-4 w-4' />
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">
                  <UserPlus className='mr-2 h-4 w-4' />
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
