export default function TypingIndicator() {
  return (
    <div className="mb-6 flex justify-start">
      <div className="flex items-center gap-2 rounded-2xl bg-white px-5 py-4 shadow-sm dark:bg-gray-800">
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
      </div>
    </div>
  );
}
