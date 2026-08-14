import Image from "next/image";

type Props = {
  sender: "user" | "bot";
  message: string;
  time: string;
};

export default function ChatMessage({ sender, message, time }: Props) {
  const isUser = sender === "user";

  return (
    <div
      className={`mb-6 flex items-start gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
  <Image
    src="/pinko.jpg"
    alt="Bot"
    width={36}
    height={36}
    priority
    className="h-9 w-9 shrink-0 rounded-full object-cover"
  />
)}

      <div
  className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm ${
    isUser
      ? "bg-[#A10D5A] text-white"
      : "bg-[#E8E9ED] text-gray-900 dark:bg-gray-700 dark:text-gray-50"
  }`}
>
        <p
          className={`whitespace-pre-wrap ${
            isUser
              ? "text-base font-semibold leading-relaxed text-white"
              : "text-base font-bold leading-relaxed text-black dark:text-white"
          }`}
        >
          {message}
        </p>

        <p
          className={`mt-3 text-xs ${
            isUser
              ? "text-pink-200"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}


