const faqs = [
{
q: "How do I apply for admission?",
a: "Placeholder — add official admission steps here.",
},
{
q: "Where can I check fee structure?",
a: "Placeholder — link or summary from your knowledge base.",
},
{
q: "Does SBBWU offer scholarships?",
a: "Placeholder — list scholarship types.",
},
];

export default function FAQPage() {
return ( <main className="flex-1 overflow-y-auto p-8"> <div className="mx-auto max-w-3xl"> <h1 className="mb-8 text-3xl font-bold text-gray-800 dark:text-white">
FAQs </h1>


    <div className="space-y-4">
      {faqs.map((item) => (
        <div
          key={item.q}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900"
        >
          <h3 className="font-semibold text-[#A10D5A]">
            {item.q}
          </h3>

          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {item.a}
          </p>
        </div>
      ))}
    </div>
  </div>
</main>


);
}
