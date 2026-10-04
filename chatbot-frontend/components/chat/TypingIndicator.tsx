export default function TypingIndicator() {
  return (
    <div className="mb-6 flex items-center justify-start gap-1.5">
      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#A10D5A] [animation-delay:-0.3s]" />
      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#A10D5A] [animation-delay:-0.15s]" />
      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#A10D5A]" />
    </div>
  );
}
