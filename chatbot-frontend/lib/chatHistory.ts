// export type ChatMessage = {
//   sender: "user" | "bot";
//   message: string;
//   time: string;
//   messageId?: number;
// };

// export type HistoryEntry = {
//   id: string;
//   sessionId: string;
//   title: string;
//   date: string;
//   messages: ChatMessage[];
// };

// const HISTORY_KEY = "sbbwu_chat_history";
// const MAX_ENTRIES = 20;

// export function loadHistory(): HistoryEntry[] {
//   if (typeof window === "undefined") return [];

//   try {
//     const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
//     return raw.map((entry: HistoryEntry) => ({
//       ...entry,
//       sessionId: entry.sessionId ?? entry.id,
//     }));
//   } catch {
//     return [];
//   }
// }

// export function saveEntry(
//   id: string,
//   sessionId: string,
//   title: string,
//   messages: ChatMessage[]
// ) {
//   if (typeof window === "undefined") return;

//   const history = loadHistory();
//   const existingIdx = history.findIndex((h) => h.id === id);

//   if (existingIdx >= 0) {
//     // Existing conversation: keep the original title (set once, from the
//     // first message), just refresh messages/date and bump it to the top.
//     const existing = history[existingIdx];
//     const updated: HistoryEntry = {
//       ...existing,
//       messages,
//       date: new Date().toISOString(),
//     };
//     history.splice(existingIdx, 1);
//     history.unshift(updated);
//   } else {
//     // Brand new conversation: title is derived from the first message only.
//     const trimmedTitle =
//       title.length > 50 ? `${title.slice(0, 47)}...` : title;

//     const entry: HistoryEntry = {
//       id,
//       sessionId,
//       title: trimmedTitle,
//       date: new Date().toISOString(),
//       messages,
//     };

//     history.unshift(entry);
//     if (history.length > MAX_ENTRIES) history.splice(MAX_ENTRIES);
//   }

//   localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
// }

// export function deleteConversation(id: string) {
//   if (typeof window === "undefined") return;
//   localStorage.setItem(
//     HISTORY_KEY,
//     JSON.stringify(loadHistory().filter((h) => h.id !== id))
//   );
// }

// export function clearAllHistory() {
//   if (typeof window === "undefined") return;
//   localStorage.removeItem(HISTORY_KEY);
// }

// export function getConversation(id: string) {
//   return loadHistory().find((h) => h.id === id) ?? null;
// }

// // Groups history entries into Today / Yesterday / Older buckets,
// // preserving the existing (most-recent-first) order within each bucket.
// export function groupHistoryByDate(entries: HistoryEntry[]) {
//   const today: HistoryEntry[] = [];
//   const yesterday: HistoryEntry[] = [];
//   const older: HistoryEntry[] = [];

//   const now = new Date();
//   const todayStr = now.toDateString();

//   const y = new Date(now);
//   y.setDate(now.getDate() - 1);
//   const yestStr = y.toDateString();

//   for (const entry of entries) {
//     const d = new Date(entry.date).toDateString();
//     if (d === todayStr) today.push(entry);
//     else if (d === yestStr) yesterday.push(entry);
//     else older.push(entry);
//   }

//   return { today, yesterday, older };
// }


export type ChatMessage = {
  sender: "user" | "bot";
  message: string;
  time: string;
  messageId?: number;

  // The original user question associated with a bot answer.
  // Used by the bookmark feature to save the correct Q&A pair.
  question?: string;
};

export type HistoryEntry = {
  id: string;
  sessionId: string;
  title: string;
  date: string;
  messages: ChatMessage[];
};

const HISTORY_KEY = "sbbwu_chat_history";
const MAX_ENTRIES = 20;

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");

    return raw.map((entry: HistoryEntry) => ({
      ...entry,
      sessionId: entry.sessionId ?? entry.id,
    }));
  } catch {
    return [];
  }
}

export function saveEntry(
  id: string,
  sessionId: string,
  title: string,
  messages: ChatMessage[]
) {
  if (typeof window === "undefined") return;

  const history = loadHistory();
  const existingIdx = history.findIndex((h) => h.id === id);

  if (existingIdx >= 0) {
    // Existing conversation:
    // Keep the original title and update messages/date.
    const existing = history[existingIdx];

    const updated: HistoryEntry = {
      ...existing,
      messages,
      date: new Date().toISOString(),
    };

    history.splice(existingIdx, 1);
    history.unshift(updated);
  } else {
    // Brand new conversation:
    // Title is derived from the first user message.
    const trimmedTitle =
      title.length > 50 ? `${title.slice(0, 47)}...` : title;

    const entry: HistoryEntry = {
      id,
      sessionId,
      title: trimmedTitle,
      date: new Date().toISOString(),
      messages,
    };

    history.unshift(entry);

    if (history.length > MAX_ENTRIES) {
      history.splice(MAX_ENTRIES);
    }
  }

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function deleteConversation(id: string) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(
      loadHistory().filter((h) => h.id !== id)
    )
  );
}

export function clearAllHistory() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(HISTORY_KEY);
}

export function getConversation(id: string) {
  return loadHistory().find((h) => h.id === id) ?? null;
}

// Groups history entries into Today / Yesterday / Older buckets,
// preserving the existing most-recent-first order within each bucket.
export function groupHistoryByDate(entries: HistoryEntry[]) {
  const today: HistoryEntry[] = [];
  const yesterday: HistoryEntry[] = [];
  const older: HistoryEntry[] = [];

  const now = new Date();
  const todayStr = now.toDateString();

  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  const yestStr = y.toDateString();

  for (const entry of entries) {
    const d = new Date(entry.date).toDateString();

    if (d === todayStr) {
      today.push(entry);
    } else if (d === yestStr) {
      yesterday.push(entry);
    } else {
      older.push(entry);
    }
  }

  return {
    today,
    yesterday,
    older,
  };
}
