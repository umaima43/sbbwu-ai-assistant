import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import { MapPin, Phone, Mail, ExternalLink } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="flex h-screen bg-[#F7F8FC] dark:bg-gray-950">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">

          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
            Contact Us
          </h1>

          {/* Address & Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* Address Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">

              <div className="flex items-center gap-3 mb-5">
                <MapPin className="text-[#A10D5A]" size={24} />

                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                  University Address
                </h2>
              </div>

              <p className="text-gray-600 dark:text-gray-300 leading-8">
                Shaheed Benazir Bhutto Women University
                <br />
                LARAMA, Charsadda Road
                <br />
                Peshawar, Khyber Pakhtunkhwa
                <br />
                Pakistan
              </p>

              <a
                href="https://maps.app.goo.gl/kHmcfUFgJFU69uaK6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-8 px-5 py-3 rounded-xl bg-[#A10D5A] text-white hover:bg-[#850B4B] transition"
              >
                <ExternalLink size={18} />
                Open in Google Maps
              </a>

            </div>

            {/* Google Map */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">

              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d423107.6078970789!2d71.567203!3d34.055972!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d91603774ee399%3A0xc26a04d64ff68cd9!2sShaheed%20Benazir%20Bhutto%20Women%20University!5e0!3m2!1sen!2sus!4v1785178807042!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{
                  border: 0,
                  minHeight: "350px",
                }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />

            </div>

          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Admissions */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">

              <h2 className="text-2xl font-semibold text-[#A10D5A] mb-6">
                Admissions & Merit Lists
              </h2>

              <div className="flex items-center gap-3 mb-4">

                <Phone className="text-[#A10D5A]" />

                <a
                  href="tel:+92919224726"
                  className="text-gray-700 dark:text-gray-300 hover:text-[#A10D5A]"
                >
                  +92-91-9224726
                </a>

              </div>

              <div className="flex items-center gap-3">

                <Mail className="text-[#A10D5A]" />

                <a
                  href="mailto:admissions@sbbwu.edu.pk"
                  className="text-gray-700 dark:text-gray-300 hover:text-[#A10D5A]"
                >
                  admissions@sbbwu.edu.pk
                </a>

              </div>

            </div>

            {/* Examination */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">

              <h2 className="text-2xl font-semibold text-[#A10D5A] mb-6">
                Examinations, Results & Date Sheets
              </h2>

              <div className="flex items-center gap-3 mb-4">

                <Phone className="text-[#A10D5A]" />

                <a
                  href="tel:+92919224724"
                  className="text-gray-700 dark:text-gray-300 hover:text-[#A10D5A]"
                >
                  +92-91-9224724
                </a>

              </div>

              <div className="flex items-center gap-3">

                <Mail className="text-[#A10D5A]" />

                <a
                  href="mailto:assttcontroller2@sbbwu.edu.pk"
                  className="text-gray-700 dark:text-gray-300 hover:text-[#A10D5A]"
                >
                  assttcontroller2@sbbwu.edu.pk
                </a>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}