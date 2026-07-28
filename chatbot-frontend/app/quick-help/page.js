import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import {
  BookOpen,
  CircleHelp,
  Phone,
  MapPinned,
  Globe,
  Calendar,
  TriangleAlert,
} from "lucide-react";

export default function QuickHelpPage() {
  const helpItems = [
    {
      icon: <BookOpen className="text-[#A10D5A]" size={24} />,
      title: "User Guide",
      description: "Learn how to use the university chatbot.",
    },
    {
      icon: <CircleHelp className="text-[#A10D5A]" size={24} />,
      title: "Frequently Asked Questions",
      description: "Browse answers to common student questions.",
    },
    {
      icon: <Phone className="text-[#A10D5A]" size={24} />,
      title: "Important Contacts",
      description: "Admission Office, Exam Cell, Hostel Office, IT Support.",
    },
    {
      icon: <MapPinned className="text-[#A10D5A]" size={24} />,
      title: "Campus Map",
      description: "View the university campus location and buildings.",
    },
    {
      icon: <Globe className="text-[#A10D5A]" size={24} />,
      title: "Official Website",
      description: "Visit the official SBBWU website.",
    },
    {
      icon: <Calendar className="text-[#A10D5A]" size={24} />,
      title: "Academic Calendar",
      description: "View important academic dates and events.",
    },
    {
      icon: <TriangleAlert className="text-[#A10D5A]" size={24} />,
      title: "Report an Issue",
      description: "Report a technical problem or incorrect information.",
    },
  ];

  return (
    <div className="flex h-screen bg-[#F7F8FC] dark:bg-gray-950">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Header />

        <main className="flex-1 overflow-y-auto p-8">

          <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
            Quick Help
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {helpItems.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-lg transition cursor-pointer"
              >
                <div className="flex items-start gap-4">

                  {item.icon}

                  <div>

                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {item.title}
                    </h2>

                    <p className="mt-2 text-gray-500 dark:text-gray-300 leading-7">
                      {item.description}
                    </p>

                  </div>

                </div>
              </div>
            ))}

          </div>

        </main>

      </div>

    </div>
  );
}