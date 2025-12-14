import "./globals.css";
import type { Metadata } from "next";
import ClientShell from "@/components/ClientShell";

export const metadata: Metadata = {
  title: "Gantt World",
  description: "Beautiful, practical Gantt + daily execution dashboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
