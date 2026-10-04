"use client";

import { useCallback, useEffect, useState } from "react";
import type { Bookmark } from "./types";
import * as store from "./storage";

interface UseBookmarksResult {
  bookmarks: Bookmark[];
  ready: boolean;
  addBookmark: (name: string, question: string, answer: string) => Bookmark;
  removeBookmark: (id: string) => void;
  isBookmarked: (question: string, answer: string) => boolean;
  findBookmark: (question: string, answer: string) => Bookmark | undefined;
}

export function useBookmarks(): UseBookmarksResult {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setBookmarks(store.getBookmarks());
    setReady(true);
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === store.STORAGE_KEY_NAME) {
        setBookmarks(store.getBookmarks());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addBookmark = useCallback((name: string, question: string, answer: string) => {
    const bookmark = store.addBookmark(name, question, answer);
    setBookmarks(store.getBookmarks());
    return bookmark;
  }, []);

  const removeBookmark = useCallback((id: string) => {
    store.removeBookmark(id);
    setBookmarks(store.getBookmarks());
  }, []);

  const isBookmarked = useCallback(
    (question: string, answer: string) =>
      bookmarks.some((b) => b.question === question && b.answer === answer),
    [bookmarks]
  );

  const findBookmark = useCallback(
    (question: string, answer: string) =>
      bookmarks.find((b) => b.question === question && b.answer === answer),
    [bookmarks]
  );

  return { bookmarks, ready, addBookmark, removeBookmark, isBookmarked, findBookmark };
}
