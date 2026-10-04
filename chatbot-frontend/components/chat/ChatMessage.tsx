import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
            : "bg-[#E8E9ED] text-gray-950 dark:bg-gray-700 dark:text-white"
        }`}
      >
        <div
          className={`${
            isUser
              ? "text-[17px] font-semibold leading-relaxed text-white"
              : "text-[17px] font-semibold leading-relaxed text-gray-950 dark:text-white"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="mb-3 last:mb-0 leading-relaxed">
                    {children}
                  </p>
                ),

                strong: ({ children }) => (
                  <strong className="font-bold">
                    {children}
                  </strong>
                ),

                ul: ({ children }) => (
                  <ul className="mb-3 ml-5 list-disc space-y-1">
                    {children}
                  </ul>
                ),

                ol: ({ children }) => (
                  <ol className="mb-3 ml-5 list-decimal space-y-1">
                    {children}
                  </ol>
                ),

                li: ({ children }) => (
                  <li className="leading-relaxed">
                    {children}
                  </li>
                ),

                h1: ({ children }) => (
                  <h1 className="mb-3 text-lg font-bold">
                    {children}
                  </h1>
                ),

                h2: ({ children }) => (
                  <h2 className="mb-3 text-lg font-bold">
                    {children}
                  </h2>
                ),

                h3: ({ children }) => (
                  <h3 className="mb-2 text-base font-bold">
                    {children}
                  </h3>
                ),
              }}
            >
              {message}
            </ReactMarkdown>
          )}
        </div>

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
