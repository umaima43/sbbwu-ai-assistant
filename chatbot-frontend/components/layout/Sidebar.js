import Image from "next/image";
import {
  House,
  History,
  Zap,
  Building2,
  CircleHelp,
  Phone,
} from "lucide-react";

export default function Sidebar({ onNewConversation }) {
  return (
    <aside className="w-80 h-screen bg-[#A10D5A] text-white flex flex-col">

      {/* Logo */}
      <div className="flex flex-col items-center pt-8 pb-6">

        <Image
          src="/sbbwu-logo.webp"
          alt="University Logo"
          width={80}
          height={80}
        />

        <h1 className="mt-4 text-center font-bold text-lg leading-6">
          Shaheed Benazir Bhutto
          <br />
          Women University
          <br />
          Peshawar
        </h1>

      </div>

      {/* New Conversation */}
      <div className="px-6">

        <button
          onClick={onNewConversation}
          className="w-full py-3 rounded-2xl bg-white text-[#A10D5A] font-semibold text-[15px] shadow-md hover:scale-[1.02] transition-all duration-300"
        >
          + New Conversation
        </button>

      </div>

      {/* Navigation */}
      <nav className="mt-8 px-5 flex flex-col gap-2">

        <button className="flex items-center gap-4 w-full h-14 px-5 rounded-2xl bg-[#C33C78] shadow-md">
          <House size={22} />
          <span className="font-medium text-[16px]">
            Home
          </span>
        </button>

        <button className="flex items-center gap-4 w-full h-14 px-5 rounded-2xl hover:bg-[#C33C78] transition">
          <History size={22} />
          <span>Chat History</span>
        </button>

        <button className="flex items-center gap-4 w-full h-14 px-5 rounded-2xl hover:bg-[#C33C78] transition">
          <Zap size={22} />
          <span>Quick Help</span>
        </button>

        <button className="flex items-center gap-4 w-full h-14 px-5 rounded-2xl hover:bg-[#C33C78] transition">
          <Building2 size={22} />
          <span>University Info</span>
        </button>

        <button className="flex items-center gap-4 w-full h-14 px-5 rounded-2xl hover:bg-[#C33C78] transition">
          <CircleHelp size={22} />
          <span>FAQs</span>
        </button>

        <button className="flex items-center gap-4 w-full h-14 px-5 rounded-2xl hover:bg-[#C33C78] transition">
          <Phone size={22} />
          <span>Contact Us</span>
        </button>

      </nav>

      {/* Bottom Profile */}
      <div className="mt-auto p-5">

        <div className="rounded-2xl bg-[#B51E63] border border-pink-400 p-4">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-full bg-pink-300 flex items-center justify-center font-bold text-lg text-white">
              S
            </div>

            <div>

              <h3 className="font-semibold">
                Student
              </h3>

              <p className="text-sm text-pink-100">
                AI Assistant
              </p>

            </div>

          </div>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#C33C78] px-3 py-2">

            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>

            <span className="text-sm">
              Online
            </span>

          </div>

        </div>

      </div>

    </aside>
  );
}