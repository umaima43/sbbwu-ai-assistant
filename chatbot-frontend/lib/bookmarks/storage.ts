import type { Bookmark } from "./types";

const STORAGE_KEY = "sbbwu_chatbot_bookmarks";

const isBrowser = () => typeof window !== "undefined";

const readAll = (): Bookmark[] => {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Bookmark[]) : [];
  } catch {
    return [];
  }
};

const writeAll = (bookmarks: Bookmark[]) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
};

const generateId = () => `bm_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const suggestBookmarkName = (question: string): string => {
  const trimmed = question.trim().replace(/\s+/g, " ");
  if (trimmed.length === 0) return "Untitled bookmark";
  return trimmed.length <= 48 ? trimmed : `${trimmed.slice(0, 45)}...`;
};

export const getBookmarks = (): Bookmark[] =>
  readAll().sort((a, b) => b.createdAt - a.createdAt);

export const findBookmark = (question: string, answer: string): Bookmark | undefined =>
  readAll().find((b) => b.question === question && b.answer === answer);

export const isBookmarked = (question: string, answer: string): boolean =>
  Boolean(findBookmark(question, answer));

export const addBookmark = (name: string, question: string, answer: string): Bookmark => {
  const bookmark: Bookmark = {
    id: generateId(),
    name: name.trim().length > 0 ? name.trim() : suggestBookmarkName(question),
    question,
    answer,
    createdAt: Date.now(),
  };
  writeAll([bookmark, ...readAll()]);
  return bookmark;
};

export const removeBookmark = (id: string): void => {
  writeAll(readAll().filter((b) => b.id !== id));
};

export const STORAGE_KEY_NAME = STORAGE_KEY;