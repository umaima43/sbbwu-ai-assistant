// "use client";

// import Sidebar from "@/components/layout/Sidebar";
// import Header from "@/components/layout/Header";

// export default function MainLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="flex h-screen overflow-hidden bg-[#F7F8FC] dark:bg-gray-950">
//       <Sidebar />

//       <div className="flex min-w-0 flex-1 flex-col">
//         <Header />

//         <main className="min-h-0 flex-1 overflow-y-auto">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }

"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F7F8FC] dark:bg-gray-950">
      <aside className="sticky top-0 h-screen shrink-0">
        <Sidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}