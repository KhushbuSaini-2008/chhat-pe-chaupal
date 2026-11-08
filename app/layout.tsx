import type { Metadata } from "next";
import { Baloo_2 } from "next/font/google";
import "./globals.css";
import ChutkiOverlay from "@/components/Chutki/ChutkiOverlay";

const baloo = Baloo_2({
  subsets: ["latin", "devanagari"],
  variable: "--font-baloo",
});

export const metadata: Metadata = {
  title: "Chhat Pe Chaupal",
  description: "Jahan bachpan phir se zinda hota hai.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${baloo.variable} antialiased`}>
        {children}
        <ChutkiOverlay />
      </body>
    </html>
  );
}