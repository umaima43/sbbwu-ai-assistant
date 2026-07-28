const HISTORY_KEY = "sbbwu_chat_history";
const MAX_ENTRIES = 10;

/** Return all saved history entries (newest first). */
export function loadHistory() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Save a single Q&A exchange as its own history entry.
 *  - id      : unique per exchange  (`${sessionId}-${timestamp}`)
 *  - title   : the user's question (auto-truncated to 50 chars)
 *  - messages: full conversation array up to this point
 *
 * Enforces a hard cap of MAX_ENTRIES (10). Oldest entry is dropped
 * automatically when the 11th is added.
 */
export function saveEntry(id, title, messages) {
  if (typeof window === "undefined") return;

  const trimmedTitle =
    title.length > 50 ? title.slice(0, 47) + "..." : title;

  const history = loadHistory();
  const existingIdx = history.findIndex((h) => h.id === id);

  const entry = {
    id,
    title: trimmedTitle,
    date: new Date().toISOString(),
    messages,
  };

  if (existingIdx >= 0) {
    // Update in-place (handles StrictMode double-invoke gracefully)
    history[existingIdx] = entry;
  } else {
    history.unshift(entry);
    // Enforce max-10 cap
    if (history.length > MAX_ENTRIES) {
      history.splice(MAX_ENTRIES);
    }
  }

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

/** Remove one entry by its ID. */
export function deleteConversation(id) {
  if (typeof window === "undefined") return;
  const updated = loadHistory().filter((h) => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

/** Fetch a single entry by ID, or null if not found. */
export function getConversation(id) {
  return loadHistory().find((h) => h.id === id) || null;
}
