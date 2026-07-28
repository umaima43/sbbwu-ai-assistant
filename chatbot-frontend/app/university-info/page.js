import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import {
  Building2,
  Target,
  GraduationCap,
  School,
  Landmark,
  Globe,
  BookOpen,
} from "lucide-react";

export default function UniversityInfoPage() {
  const sections = [
    {
      icon: <Building2 className="text-[#A10D5A]" size={26} />,
      title: "About SBBWU",
      description:
        "Learn about the university, its history, values, and commitment to women's education.",
    },
    {
      icon: <Target className="text-[#A10D5A]" size={26} />,
      title: "Vision & Mission",
      description:
        "Explore the university's vision, mission, and long-term goals.",
    },
    {
      icon: <GraduationCap className="text-[#A10D5A]" size={26} />,
      title: "Faculties & Departments",
      description:
        "View all faculties, departments, and academic programs offered.",
    },
    {
      icon: <School className="text-[#A10D5A]" size={26} />,
      title: "Campus Facilities",
      description:
        "Discover the library, hostels, laboratories, transport, sports, and other facilities.",
    },
    {
      icon: <Landmark className="text-[#A10D5A]" size={26} />,
      title: "Accreditation",
      description:
        "Information about HEC recognition and university accreditation.",
    },
    {
      icon: <BookOpen className="text-[#A10D5A]" size={26} />,
      title: "Vice Chancellor's Message",
      description:
        "Read the message from the Vice Chancellor of SBBWU.",
    },
    {
      icon: <Globe className="text-[#A10D5A]" size={26} />,
      title: "Official Website",
      description:
        "Visit the official Shaheed Benazir Bhutto Women University website.",
    },
  ];

  return (
    <div className="flex h-screen bg-[#F7F8FC] dark:bg-gray-950">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Header />

        <main className="flex-1 overflow-y-auto p-8">

          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
            University Information
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {sections.map((section, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-6 hover:shadow-lg transition cursor-pointer"
              >
                <div className="flex gap-4">

                  {section.icon}

                  <div>

                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                      {section.title}
                    </h2>

                    <p className="mt-2 text-gray-500 dark:text-gray-300 leading-7">
                      {section.description}
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