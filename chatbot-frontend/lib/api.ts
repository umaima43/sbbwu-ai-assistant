export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

export type ChatResponse = {
  answer: string;
  message_id: number;
  sources: string[];
  confidence: number;
  intent: string;
};

export async function sendChatMessage(
  sessionId: string,
  message: string
): Promise<ChatResponse> {
  const res = await fetch(`${BACKEND_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message }),
  });

  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  return res.json();
}

export async function sendFeedback(messageId: number, positive: boolean) {
  const res = await fetch(`${BACKEND_URL}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message_id: messageId, positive }),
  });

  if (!res.ok) throw new Error(`Feedback failed: ${res.status}`);
  return res.json();
}
