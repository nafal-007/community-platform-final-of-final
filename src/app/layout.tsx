import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { TimeTrackerProvider } from "@/components/providers/TimeTrackerProvider";
import { QuickNoteWidget } from "@/components/widgets/QuickNoteWidget";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CommuniNet | Structured Community Networking",
  description: "A responsible, structured community-based social networking platform.",
};

import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { MobileNav } from "@/components/layout/MobileNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-surface-50 text-surface-900 antialiased h-screen overflow-hidden flex flex-col transition-colors duration-300`}>
        <AuthProvider>
          <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem>
            <Toaster position="top-center" />
            <TimeTrackerProvider>
              <Topbar />
              <div className="flex flex-1 overflow-hidden max-w-[1600px] mx-auto w-full pb-16 md:pb-0">
                <Sidebar />
                <main className="flex-1 overflow-y-auto border-x border-surface-100 bg-surface-50">
                  {children}
                </main>
                <aside className="hidden xl:block w-80 p-6 overflow-y-auto">
                  <QuickNoteWidget />
                </aside>
              </div>
              <MobileNav />
            </TimeTrackerProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

