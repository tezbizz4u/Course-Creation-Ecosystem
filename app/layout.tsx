import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Forma · Course studio",
  description:
    "An original workspace for course planning and presentation design.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
