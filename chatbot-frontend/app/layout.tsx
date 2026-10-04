
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/ThemeProvider";
import { ChatProvider } from "@/components/providers/ChatProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SBBWU AI Assistant",
  description: "Shaheed Benazir Bhutto Women University helpdesk chatbot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
  lang="en"
  suppressHydrationWarning
  className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-[#FBF8F9] dark:bg-gray-900`}
>
  <body className="min-h-full bg-[#FBF8F9] dark:bg-gray-900">
    <Providers>
      <ChatProvider>
        {children}
      </ChatProvider>
    </Providers>
  </body>
</html>
  );
}  
