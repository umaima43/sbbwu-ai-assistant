
// export type ChatMessage = {
//   sender: "user" | "bot";
//   message: string;
//   time: string;
//   messageId?: number;

//   // The original user question associated with a bot answer.
//   // Used by the bookmark feature to save the correct Q&A pair.
//   question?: string;
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
//     // Existing conversation:
//     // Keep the original title and update messages/date.
//     const existing = history[existingIdx];

//     const updated: HistoryEntry = {
//       ...existing,
//       messages,
//       date: new Date().toISOString(),
//     };

//     history.splice(existingIdx, 1);
//     history.unshift(updated);
//   } else {
//     // Brand new conversation:
//     // Title is derived from the first user message.
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

//     if (history.length > MAX_ENTRIES) {
//       history.splice(MAX_ENTRIES);
//     }
//   }

//   localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
// }

// export function deleteConversation(id: string) {
//   if (typeof window === "undefined") return;

//   localStorage.setItem(
//     HISTORY_KEY,
//     JSON.stringify(
//       loadHistory().filter((h) => h.id !== id)
//     )
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
// // preserving the existing most-recent-first order within each bucket.
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

//     if (d === todayStr) {
//       today.push(entry);
//     } else if (d === yestStr) {
//       yesterday.push(entry);
//     } else {
//       older.push(entry);
//     }
//   }

//   return {
//     today,
//     yesterday,
//     older,
//   };
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

/**
 * Safely converts an old/invalid title into a string.
 *
 * This protects the UI from old localStorage data where
 * title may accidentally contain a ChatMessage object.
 */
function normalizeTitle(
  title: unknown,
  messages?: unknown
): string {
  // Normal valid title
  if (typeof title === "string") {
    return title;
  }

  // If title is accidentally a ChatMessage object
  if (
    title &&
    typeof title === "object" &&
    "message" in title
  ) {
    const obj = title as { message?: unknown };

    if (typeof obj.message === "string") {
      return obj.message.length > 50
        ? `${obj.message.slice(0, 47)}...`
        : obj.message;
    }
  }

  // Try to get title from first user message
  if (Array.isArray(messages)) {
    const firstUserMessage = messages.find(
      (msg) =>
        msg &&
        typeof msg === "object" &&
        "sender" in msg &&
        "message" in msg &&
        (msg as ChatMessage).sender === "user"
    ) as ChatMessage | undefined;

    if (
      firstUserMessage &&
      typeof firstUserMessage.message === "string"
    ) {
      const text = firstUserMessage.message.trim();

      if (text) {
        return text.length > 50
          ? `${text.slice(0, 47)}...`
          : text;
      }
    }
  }

  return "New Conversation";
}

/**
 * Safely loads chat history from localStorage.
 *
 * Older versions of the app may have stored slightly
 * different data structures, so we normalize everything here.
 */
export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(HISTORY_KEY);

    if (!stored) {
      return [];
    }

    const raw: unknown = JSON.parse(stored);

    if (!Array.isArray(raw)) {
      return [];
    }

    const normalized: HistoryEntry[] = raw
      .filter(
        (entry): entry is Record<string, unknown> =>
          entry !== null &&
          typeof entry === "object"
      )
      .map((entry) => {
        const messages = Array.isArray(entry.messages)
          ? (entry.messages as ChatMessage[])
          : [];

        const id =
          typeof entry.id === "string"
            ? entry.id
            : crypto.randomUUID();

        const sessionId =
          typeof entry.sessionId === "string"
            ? entry.sessionId
            : id;

        const date =
          typeof entry.date === "string"
            ? entry.date
            : new Date().toISOString();

        return {
          id,
          sessionId,
          title: normalizeTitle(
            entry.title,
            messages
          ),
          date,
          messages,
        };
      });

    return normalized;
  } catch (error) {
    console.error(
      "Failed to load chat history:",
      error
    );

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

  const existingIdx = history.findIndex(
    (h) => h.id === id
  );

  if (existingIdx >= 0) {
    // Existing conversation:
    // Keep the original title and update messages/date.
    const existing = history[existingIdx];

    const updated: HistoryEntry = {
      ...existing,
      messages,
      date: new Date().toISOString(),
      title: normalizeTitle(
        existing.title,
        messages
      ),
    };

    history.splice(existingIdx, 1);
    history.unshift(updated);
  } else {
    // Brand new conversation.
    const safeTitle = normalizeTitle(
      title,
      messages
    );

    const trimmedTitle =
      safeTitle.length > 50
        ? `${safeTitle.slice(0, 47)}...`
        : safeTitle;

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

  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(history)
  );
}

export function deleteConversation(id: string) {
  if (typeof window === "undefined") return;

  const updatedHistory = loadHistory().filter(
    (h) => h.id !== id
  );

  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(updatedHistory)
  );
}

export function clearAllHistory() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(HISTORY_KEY);
}

export function getConversation(id: string) {
  return (
    loadHistory().find((h) => h.id === id) ?? null
  );
}

// Groups history entries into Today / Yesterday / Older buckets,
// preserving the existing most-recent-first order within each bucket.
export function groupHistoryByDate(
  entries: HistoryEntry[]
) {
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
