"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  FlaskConical,
  Users,
  ShieldCheck,
  Monitor,
  Search,
  X,
} from "lucide-react";

const contactSections = [
  {
    title: "University Administration",
    description: "Main university administration offices.",
    icon: Building2,
    contacts: [
      {
        department: "Vice Chancellor Office",
        email: "vc@sbbwu.edu.pk",
        phone: "+92-91-9224777",
      },
      {
        department: "Pro Vice Chancellor",
        email: "provc@sbbwu.edu.pk",
        phone: "+92-91-9224736",
      },
      {
        department: "Registrar Office",
        email: "registrar@sbbwu.edu.pk",
        phone: "+92-91-9224700, +92-91-9224799",
      },
      {
        department: "Deputy Registrar",
        email: "d.registrar@sbbwu.edu.pk",
        phone: "+92-91-9224791",
      },
      {
        department: "Provost Office",
        email: "provost@sbbwu.edu.pk",
        phone: "+92-91-9224705",
      },
      {
        department: "Dean Office",
        email: "dean@sbbwu.edu.pk",
        phone: "+92-91-9224777",
      },
    ],
  },

  {
    title: "Admissions & Academics",
    description: "Admissions, academic and affiliation offices.",
    icon: GraduationCap,
    contacts: [
      {
        department: "Admission Section",
        email: "admissions@sbbwu.edu.pk",
        phone: "+92-91-9224726",
      },
      {
        department: "Academics Section",
        email: "academics@sbbwu.edu.pk",
        phone: "+92-91-9224708",
      },
      {
        department: "Affiliation & Monitoring",
        email: "ar2.affiliations@sbbwu.edu.pk",
        phone: "+92-91-9224723",
      },
      {
        department: "Establishment Section",
        email: "establishment@sbbwu.edu.pk",
        phone: "+92-91-9224791",
      },
    ],
  },

  {
    title: "Examinations",
    description: "Examination, results and date sheet offices.",
    icon: BookOpen,
    contacts: [
      {
        department: "Examination Dealing Section",
        email: "assttcontroller2@sbbwu.edu.pk",
        phone: "+92-91-9224724",
      },
      {
        department: "Examination Section (Masters/ADE)",
        email: "controllerexams@sbbwu.edu.pk",
        phone: "+92-91-9224713",
      },
      {
        department: "Examination Section (BA/BSc)",
        email: "controllerexams@sbbwu.edu.pk",
        phone: "+92-91-9224799",
      },
      {
        department: "Examination Section (BS)",
        email: "controllerexams@sbbwu.edu.pk",
        phone: "+92-91-9224716",
      },
      {
        department: "Controller Exams",
        email: "controllerexams@sbbwu.edu.pk",
        phone: "+92-91-9224718",
      },
    ],
  },

  {
    title: "Research & Development",
    description: "Research, publications and university development.",
    icon: FlaskConical,
    contacts: [
      {
        department: "ORIC",
        email: "oric@sbbwu.edu.pk",
        phone: "+92-91-9224794",
      },
      {
        department: "Publication Office",
        email: "publications@sbbwu.edu.pk",
        phone: "+92-91-9224722",
      },
      {
        department: "University Advancement Office",
        email: "advancement@sbbwu.edu.pk",
        phone: "+92-91-9224795",
      },
      {
        department: "Quality Enhancement Cell",
        email: "qec@sbbwu.edu.pk",
        phone: "+92-91-9224704",
      },
    ],
  },

  {
    title: "Student Services",
    description: "Student support and campus services.",
    icon: Users,
    contacts: [
      {
        department: "Central Library",
        email: "librarian@sbbwu.edu.pk",
        phone: "+92-91-9224749",
      },
      {
        department: "Directorate of Sports",
        email: "sports@sbbwu.edu.pk",
        phone: "+92-91-9224701",
      },
      {
        department: "Women Development Center",
        email: "womendev@sbbwu.edu.pk",
        phone: "091-9224717",
      },
      {
        department: "Psychotherapeutic Centre",
        email: "psychologicalcentre@sbbwu.edu.pk",
        phone: "+92-91-9224759",
      },
    ],
  },

  {
    title: "Campus & IT Support",
    description: "Hostel, IT and campus support services.",
    icon: Monitor,
    contacts: [
      {
        department: "IT Centre",
        email: "itc@sbbwu.edu.pk",
        phone: "+92-91-9224770",
      },
      {
        department: "Hostel (Larama Campus)",
        email: "hostel@sbbwu.edu.pk",
        phone: "+92-91-9224800",
      },
      {
        department: "Main Gate (Larama Campus)",
        email: "",
        phone: "+92-91-9224755",
      },
      {
        department: "CCTV Control Room",
        email: "controlroom@sbbwu.edu.pk",
        phone: "+92-91-9224812",
      },
    ],
  },

  {
    title: "University Departments",
    description: "Contact information for academic departments.",
    icon: Building2,
    contacts: [
      {
        department: "Computer Science",
        email: "cs@sbbwu.edu.pk",
        phone: "+92-91-9224769",
      },
      {
        department: "English",
        email: "english@sbbwu.edu.pk",
        phone: "+92-91-9224725",
      },
      {
        department: "Mathematics",
        email: "maths@sbbwu.edu.pk",
        phone: "+92-91-9224712",
      },
      {
        department: "Physics",
        email: "physics@sbbwu.edu.pk",
        phone: "+92-91-9224703",
      },
      {
        department: "Chemistry",
        email: "chemistry@sbbwu.edu.pk",
        phone: "+92-91-9224706",
      },
      {
        department: "Microbiology",
        email: "microbiology@sbbwu.edu.pk",
        phone: "+92-91-9224814",
      },
      {
        department: "Psychology",
        email: "psychology@sbbwu.edu.pk",
        phone: "+92-91-9224759",
      },
      {
        department: "Statistics",
        email: "statistics@sbbwu.edu.pk",
        phone: "+92-91-9224720",
      },
      {
        department: "Urdu",
        email: "urdu@sbbwu.edu.pk",
        phone: "+92-91-9224810",
      },
      {
        department: "Zoology",
        email: "zoology@sbbwu.edu.pk",
        phone: "+92-91-9224787",
      },
    ],
  },
];

export default function ImportantContactsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  /*
   * Filter contacts based on:
   * - Department name
   * - Email
   * - Phone
   * - Section title
   * - Section description
   */
  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return contactSections;
    }

    return contactSections
      .map((section) => {
        const sectionMatches =
          section.title.toLowerCase().includes(query) ||
          section.description.toLowerCase().includes(query);

        const matchingContacts = section.contacts.filter((contact) => {
          return (
            contact.department.toLowerCase().includes(query) ||
            contact.email.toLowerCase().includes(query) ||
            contact.phone.toLowerCase().includes(query)
          );
        });

        /*
         * If the section itself matches, show all its contacts.
         * Otherwise, show only matching contacts.
         */
        return {
          ...section,
          contacts: sectionMatches
            ? section.contacts
            : matchingContacts,
        };
      })
      .filter((section) => section.contacts.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-gray-950">

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">

        {/* Back Button */}
        <Link
          href="/quick-help"
          className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-[#A10D5A] transition-all hover:gap-3 dark:text-pink-400"
        >
          <ArrowLeft size={18} />
          Back to Quick Help
        </Link>

        {/* Page Header */}
        <div className="mb-8 flex items-center gap-5">

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#A10D5A] text-white shadow-lg shadow-pink-200 dark:shadow-none">
            <Phone size={30} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
              Important Contacts
            </h1>

            <p className="mt-1 text-gray-500 dark:text-gray-400">
              SBBWU offices, departments and student support contacts
            </p>
          </div>

        </div>

        {/* Search Bar */}
        <div className="mb-10">

          <div className="relative">

            {/* Search Icon */}
            <Search
              size={21}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A10D5A] dark:text-pink-400"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search department, office, email or phone..."
              className="
                w-full
                rounded-2xl
                border-2
                border-pink-200
                bg-white
                py-4
                pl-12
                pr-12
                text-gray-900
                shadow-sm
                outline-none
                transition-all
                placeholder:text-gray-400
                focus:border-[#A10D5A]
                focus:ring-4
                focus:ring-pink-100
                dark:border-pink-900
                dark:bg-gray-900
                dark:text-white
                dark:placeholder:text-gray-500
                dark:focus:border-pink-500
                dark:focus:ring-pink-950
              "
            />

            {/* Clear Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  rounded-full
                  p-1
                  text-gray-400
                  transition
                  hover:bg-pink-50
                  hover:text-[#A10D5A]
                  dark:hover:bg-[#351126]
                  dark:hover:text-pink-400
                "
                aria-label="Clear search"
              >
                <X size={19} />
              </button>
            )}

          </div>

          {/* Search Result Count */}
          {searchQuery && (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              {filteredSections.reduce(
                (total, section) => total + section.contacts.length,
                0
              )}{" "}
              contact
              {filteredSections.reduce(
                (total, section) => total + section.contacts.length,
                0
              ) === 1
                ? ""
                : "s"}{" "}
              found
            </p>
          )}

        </div>

        {/* Contact Sections */}
        <div className="space-y-12">

          {filteredSections.map((section) => {
            const SectionIcon = section.icon;

            return (
              <section key={section.title}>

                {/* Section Heading */}
                <div className="mb-5 flex items-center justify-between rounded-2xl bg-[#A10D5A] px-5 py-4 shadow-md shadow-pink-100 dark:shadow-none">

                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white">
                      <SectionIcon size={23} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-white md:text-xl">
                        {section.title}
                      </h2>

                      <p className="mt-0.5 text-sm text-pink-100">
                        {section.description}
                      </p>
                    </div>

                  </div>

                  <span className="hidden rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white sm:block">
                    {section.contacts.length}{" "}
                    {section.contacts.length === 1
                      ? "Contact"
                      : "Contacts"}
                  </span>

                </div>

                {/* Contact Cards */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {section.contacts.map((contact) => (

                    <div
                      key={contact.department}
                      className="
                        group
                        rounded-2xl
                        border-2
                        border-pink-300
                        bg-white
                        p-5
                        shadow-sm
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:border-[#A10D5A]
                        hover:shadow-lg
                        dark:border-pink-800
                        dark:bg-gray-900
                        dark:hover:border-pink-500
                      "
                    >

                      {/* Department */}
                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDF0F7] text-[#A10D5A] dark:bg-[#3A1029] dark:text-pink-400">
                          <Building2 size={19} />
                        </div>

                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {contact.department}
                        </h3>

                      </div>

                      {/* Divider */}
                      <div className="my-4 h-px bg-pink-100 dark:bg-gray-800" />

                      {/* Email */}
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="
                            flex
                            items-center
                            gap-3
                            rounded-lg
                            px-2
                            py-2
                            text-sm
                            text-gray-600
                            transition
                            hover:bg-[#FDF0F7]
                            hover:text-[#A10D5A]
                            dark:text-gray-300
                            dark:hover:bg-[#3A1029]
                            dark:hover:text-pink-400
                          "
                        >
                          <Mail
                            size={17}
                            className="shrink-0 text-[#A10D5A] dark:text-pink-400"
                          />

                          <span className="truncate">
                            {contact.email}
                          </span>
                        </a>
                      )}

                      {/* Phone */}
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone.replace(
                            /[^+\d]/g,
                            ""
                          )}`}
                          className="
                            flex
                            items-center
                            gap-3
                            rounded-lg
                            px-2
                            py-2
                            text-sm
                            text-gray-600
                            transition
                            hover:bg-[#FDF0F7]
                            hover:text-[#A10D5A]
                            dark:text-gray-300
                            dark:hover:bg-[#3A1029]
                            dark:hover:text-pink-400
                          "
                        >
                          <Phone
                            size={17}
                            className="shrink-0 text-[#A10D5A] dark:text-pink-400"
                          />

                          <span>{contact.phone}</span>
                        </a>
                      )}

                    </div>

                  ))}

                </div>

              </section>
            );
          })}

        </div>

        {/* No Results */}
        {searchQuery && filteredSections.length === 0 && (
          <div className="rounded-3xl border-2 border-pink-200 bg-white px-6 py-14 text-center shadow-sm dark:border-pink-900 dark:bg-gray-900">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FDF0F7] text-[#A10D5A] dark:bg-[#351126] dark:text-pink-400">
              <Search size={28} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">
              No contacts found
            </h2>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
              We couldn't find a contact matching "{searchQuery}".
            </p>

            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-5 rounded-xl bg-[#A10D5A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8B0B4D]"
            >
              Clear Search
            </button>

          </div>
        )}

        {/* Bottom Note */}
        <div className="mt-12 rounded-2xl border-2 border-pink-300 bg-[#FDF0F7] p-5 dark:border-pink-800 dark:bg-[#240D1C]">

          <div className="flex items-start gap-3">

            <ShieldCheck
              size={21}
              className="mt-0.5 shrink-0 text-[#A10D5A] dark:text-pink-400"
            />

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Need more help?
              </h3>

              <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                If you are not sure which office to contact, ask the
                SBBWU AI Assistant and it can help you find the relevant
                department.
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}