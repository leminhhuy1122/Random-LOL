import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Random Rift",
  description: "A cinematic League of Legends random champion companion.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
