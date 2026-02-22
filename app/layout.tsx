import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["100", "200", "300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Product Maker — Building Where Logic Meets Experience",
  description:
    "Lead Designer at Hear.ai. I architect and build end-to-end digital products that bridge complex logic with human experience.",
  keywords: ["Product Maker", "Design Engineer", "Hear.ai", "Three.js", "AI Products"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}>
      <body className="bg-void font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
