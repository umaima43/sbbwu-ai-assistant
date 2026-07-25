import Image from "next/image";

export default function Header() {
  return (
    <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between">

      {/* Left Side */}
      <div className="flex items-center gap-4">

        <Image
          src="/sbbwu-logo.webp"
          alt="Logo"
          width={45}
          height={45}
        />

        <div>
          <h2 className="text-lg font-bold text-gray-800">
            SBBWU AI Assistant
          </h2>

          <p className="text-sm text-gray-500">
            Shaheed Benazir Bhutto Women University
          </p>
        </div>

      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">

        <div className="w-3 h-3 rounded-full bg-green-500"></div>

        <span className="text-sm font-medium text-gray-600">
          Online
        </span>

      </div>

    </header>
  );
}