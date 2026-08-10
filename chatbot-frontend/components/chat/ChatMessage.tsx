type Props = {
  sender: "user" | "bot";
  message: string;
  time: string;
};

export default function ChatMessage({ sender, message, time }: Props) {
  const isUser = sender === "user";

  return (
    <div className={`mb-6 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${
          isUser
            ? "bg-[#A10D5A] text-white"
            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
        }`}
      >
        {!isUser && (
          <p className="mb-1 text-xs font-semibold text-[#A10D5A] dark:text-pink-300">
            AI Assistant
          </p>
        )}
        <p className="whitespace-pre-wrap">{message}</p>
        <p
          className={`mt-3 text-xs ${
            isUser ? "text-pink-200" : "text-gray-400"
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
