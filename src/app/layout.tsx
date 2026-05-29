import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Random LOL",
  description: "A cinematic League of Legends random champion companion for Random LOL.",
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
