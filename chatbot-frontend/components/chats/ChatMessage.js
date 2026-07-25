export default function ChatMessage({ sender, message, time }) {
  const isUser = sender === "user";

  return (
    <div className={`flex mb-6 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className="max-w-[70%] rounded-2xl px-5 py-4 shadow-sm"
        style={
          isUser
            ? {
                backgroundColor: "#A10D5A",
                color: "#ffffff",
              }
            : {
                backgroundColor: "#f3f4f6",
                color: "#1f2937",
              }
        }
      >
        <p>{message}</p>

        <p
          className="text-xs mt-3"
          style={{ color: isUser ? "#fbcfe8" : "#9ca3af" }}
        >
          {time}
        </p>
      </div>
    </div>
  );
}