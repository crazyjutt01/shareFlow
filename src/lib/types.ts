export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  reputation: number;
};

export type Answer = {
  id: string;
  questionId: string;
  author: User;
  content: string;
  votes: number;
  createdAt: string;
};

export type Question = {
  id: string;
  title: string;
  description: string;
  author: User;
  tags: string[];
  answers: Answer[];
  votes: number;
  createdAt: string;
};
