import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מפרשים של תקווה",
  description: "סדנאות חוסן למחנכים",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
