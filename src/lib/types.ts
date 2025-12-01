export type User = {
  id: string;
  username: string;
  email: string;
  registrationDate: string;
  photoURL?: string;
  reputation?: number;
};

export type Answer = {
  id: string;
  questionId: string;
  userId: string;
  author: {
    name: string;
    avatarUrl: string;
  };
  content: string;
  upvotes: number;
  downvotes: number;
  submissionDate: string;
  createdAt: string;
};

export type Question = {
  id: string;
  userId: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatarUrl: string;
  };
  tags: string[];
  answers: Answer[];
  votes: number;
  creationDate: string;
  createdAt: string;
};
