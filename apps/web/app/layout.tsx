import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mishmarot — Global Antisemitism Situational Awareness",
  description:
    "Open-source platform providing timely, verified, multi-source situational awareness of antisemitic incidents worldwide.",
  openGraph: {
    title: "Mishmarot",
    description:
      "Empowering those who protect Jewish communities with real-time, multi-source antisemitism data.",
    url: "https://mishmarot.org",
    siteName: "Mishmarot",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-neutral-950 text-neutral-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
