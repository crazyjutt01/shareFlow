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
import { Plus, LogIn, UserPlus } from 'lucide-react';
import { Logo } from '../logo';
import { PLACEHOLDER_IMAGES } from '@/lib/data';


export default function Header() {
  // Mock authentication status
  const isLoggedIn = true;
  const user = {
    name: 'Alex Starr',
    email: 'alex.starr@example.com',
    avatarUrl: PLACEHOLDER_IMAGES.user1.imageUrl
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

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
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
