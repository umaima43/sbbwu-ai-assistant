export interface Bookmark {
  id: string;
  name: string;
  question: string;
  answer: string;
  createdAt: number; // Date.now() — used for sorting, newest first
}
