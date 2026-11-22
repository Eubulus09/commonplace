import type { Metadata } from "next";
import { RouteProgress } from "@/components/route-progress";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Commonplace — a ledger for work that refuses one label",
    template: "%s · Commonplace",
  },
  description:
    "A social ledger for independent creators, artists, professionals, and researchers. Keep the draft, the finding, and the finished thing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="paper-noise min-h-screen bg-paper text-ink">
        <RouteProgress />
        {children}
      </body>
    </html>
  );
}
