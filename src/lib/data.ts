import type { Question, User } from './types';

export const PLACEHOLDER_IMAGES = {
    user1: { imageUrl: 'https://picsum.photos/seed/1/100/100', imageHint: 'person portrait' },
    user2: { imageUrl: 'https://picsum.photos/seed/2/100/100', imageHint: 'person portrait' },
    user3: { imageUrl: 'https://picsum.photos/seed/3/100/100', imageHint: 'person portrait' },
    user4: { imageUrl: 'https://picsum.photos/seed/4/100/100', imageHint: 'person portrait' },
};

const users: Record<string, User> = {
  user1: {
    id: 'user1',
    name: 'Alex Starr',
    avatarUrl: PLACEHOLDER_IMAGES.user1.imageUrl,
    reputation: 1520,
  },
  user2: {
    id: 'user2',
    name: 'Bella Thorne',
    avatarUrl: PLACEHOLDER_IMAGES.user2.imageUrl,
    reputation: 980,
  },
  user3: {
    id: 'user3',
    name: 'Chris Vogt',
    avatarUrl: PLACEHOLDER_IMAGES.user3.imageUrl,
    reputation: 2400,
  },
  user4: {
    id: 'user4',
    name: 'Diana Prince',
    avatarUrl: PLACEHOLDER_IMAGES.user4.imageUrl,
    reputation: 750,
  },
};

const questions: Question[] = [
  {
    id: 'q1',
    title: 'How to effectively use Server Actions in Next.js 14 for form submissions?',
    description: 'I\'m building a new application with Next.js 14 and trying to understand the best practices for using Server Actions. My main concern is handling form state, validation, and error feedback to the user. Should I use `useFormState` or is there a better way? What about progressive enhancement?',
    author: users.user1,
    tags: ['nextjs', 'react', 'server-actions', 'typescript'],
    votes: 128,
    createdAt: '2023-10-26T10:00:00Z',
    answers: [
      {
        id: 'a1-1',
        questionId: 'q1',
        author: users.user3,
        content: 'Server Actions are great for this. For validation, combining them with a library like Zod on the server is very powerful. You can create a server action that takes form data, validates it, and then returns a structured response with either success data or validation errors. On the client, you can use `useFormStatus` to show a pending state on the submit button, which greatly improves UX.',
        votes: 42,
        createdAt: '2023-10-26T10:15:00Z',
      },
      {
        id: 'a1-2',
        questionId: 'q1',
        author: users.user2,
        content: 'I agree with Chris. I\'d also recommend using `react-hook-form` on the client. You can trigger the server action inside the `onSubmit` handler. This gives you the best of both worlds: client-side validation for instant feedback and server-side validation as your source of truth.',
        votes: 15,
        createdAt: '2023-10-26T11:00:00Z',
      },
    ],
  },
  {
    id: 'q2',
    title: 'What are the key differences between `useEffect` and `useLayoutEffect` in React?',
    description: 'I\'ve read the React docs but I\'m still a bit confused about when to use `useLayoutEffect` over `useEffect`. Can someone provide a practical example where `useLayoutEffect` is necessary to prevent visual glitches like flickering?',
    author: users.user4,
    tags: ['react', 'hooks', 'frontend'],
    votes: 256,
    createdAt: '2023-11-05T14:30:00Z',
    answers: [
      {
        id: 'a2-1',
        questionId: 'q2',
        author: users.user3,
        content: 'The main difference is timing. `useEffect` runs asynchronously after React has rendered the component and painted to the screen. `useLayoutEffect`, on the other hand, runs synchronously after all DOM mutations but before the browser has painted. This is useful for reading layout from the DOM and synchronously re-rendering. A classic example is measuring an element\'s size or position (e.g., for a tooltip) right after it\'s rendered to position it correctly before the user sees it.',
        votes: 98,
        createdAt: '2023-11-05T14:45:00Z',
      },
      {
        id: 'a2-2',
        questionId: 'q2',
        author: users.user1,
        content: 'To add to Chris\'s great explanation: you should default to `useEffect`. Only use `useLayoutEffect` when you have a specific problem that it solves. Using it unnecessarily can block visual updates and make your app feel slower. A good rule of thumb is: if your effect is interacting with the DOM to read layout or perform measurements that need to be applied before the next paint, `useLayoutEffect` is your tool.',
        votes: 35,
        createdAt: '2023-11-05T15:00:00Z',
      },
    ],
  },
  {
    id: 'q3',
    title: 'Best way to manage global state in a modern Next.js app?',
    description: 'With the new App Router, what is the recommended way to handle global state? Should I still use Redux or Zustand, or is React Context with Server Components sufficient? I need to share user authentication status and shopping cart data across my app.',
    author: users.user2,
    tags: ['nextjs', 'react', 'state-management'],
    votes: 95,
    createdAt: '2023-12-01T09:00:00Z',
    answers: [
      {
        id: 'a3-1',
        questionId: 'q3',
        author: users.user1,
        content: 'For client-side global state, Zustand is an excellent, lightweight choice that works seamlessly with the App Router. You create a store and wrap your root layout with a provider. For auth status, it\'s often best to manage that in a session provider that uses React Context, as it\'s read frequently. For something like a shopping cart, Zustand is perfect.',
        votes: 25,
        createdAt: '2023-12-01T09:20:00Z',
      },
    ],
  },
];

// Simulate API calls
export const getQuestions = async (filters?: { query?: string, tag?: string }): Promise<Question[]> => {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
  let filteredQuestions = questions;

  if (filters?.query) {
    const query = filters.query.toLowerCase();
    filteredQuestions = filteredQuestions.filter(q => 
      q.title.toLowerCase().includes(query) ||
      q.description.toLowerCase().includes(query)
    );
  }

  if (filters?.tag) {
    filteredQuestions = filteredQuestions.filter(q => q.tags.includes(filters.tag!));
  }

  return filteredQuestions;
};

export const getQuestionById = async (id: string): Promise<Question | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return questions.find(q => q.id === id);
};
