import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import SessionNotice from "@/components/SessionNotice";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kelana AI | Go Away",
  description: "Panduan berkelana kemana saja bersama Kelana AI",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <SessionNotice />
      </body>
    </html>
  );
}
