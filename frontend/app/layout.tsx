import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "ArchGen AI — AI-Powered Architecture Generator",
  description:
    "Transform your project ideas into complete system architectures instantly. ArchGen AI generates HLD, diagrams, tech stacks, and implementation plans powered by AI.",
  keywords: ["system design", "architecture", "AI", "software development", "HLD", "tech stack"],
  openGraph: {
    title: "ArchGen AI",
    description: "AI-Powered Architecture Generator for Developers",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#12121f",
              color: "#f0f0ff",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: "12px",
              fontSize: "13px",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
