import { Timestamp } from "firebase/firestore";

export type User = {
  id: string;
  username: string;
  email: string;
  registrationDate: string | Timestamp;
  photoURL?: string;
  reputation?: number;
};

export type Answer = {
  id: string;
  questionId: string;
  userId: string;
  content: string;
  upvotes: number;
  downvotes: number;
  submissionDate: Timestamp;
};

export type Question = {
  id: string;
  userId: string;
  title: string;
  description: string;
  tags: string[];
  votes: number;
  creationDate: Timestamp;
};
