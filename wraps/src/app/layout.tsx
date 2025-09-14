import type { Metadata } from "next";
import { Noto_Sans, Spline_Sans } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const splineSans = Spline_Sans({
  variable: "--font-spline-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Knots",
  description: "Discover your spending habits - Powered by Knot API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --primary-color: #38e07b;
                --primary-50: #f0fdf4;
                --primary-100: #dcfce7;
                --primary-200: #bbf7d0;
                --primary-300: #86efac;
                --primary-400: #4ade80;
                --primary-500: #22c55e;
                --primary-600: #16a34a;
                --primary-700: #15803d;
                --primary-800: #166534;
                --primary-900: #14532d;
                --primary-950: #052e16;
              }
              @keyframes pulse {
                0%,
                100% {
                  opacity: 1;
                }
                50% {
                  opacity: 0.8;
                }
              }
              .animate-pulse-custom {
                animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
              }
              @keyframes slide {
                0% {
                  transform: translateX(-100%);
                }
                100% {
                  transform: translateX(100%);
                }
              }
              .animate-slide {
                animation: slide 1.5s linear infinite;
              }
              @keyframes shimmer {
                0% {
                  transform: translateX(-100%);
                }
                100% {
                  transform: translateX(100%);
                }
              }
              .animate-shimmer {
                animation: shimmer 2s ease-in-out infinite;
              }
              body {
                background-color: #122118;
              }
              .progress-bar-container {
                display: flex;
                gap: 4px;
                width: 100%;
                height: 4px;
                position: absolute;
                top: 1.25rem;
                left: 0;
                padding: 0 1rem;
                z-index: 20;
              }
              .progress-bar {
                flex: 1;
                height: 100%;
                background-color: rgba(255, 255, 255, 0.3);
                border-radius: 9999px;
                overflow: hidden;
              }
              .progress-bar-fill {
                height: 100%;
                background-color: white;
                width: 0%;
                transition: width 0.3s ease-in-out;
              }
              .progress-bar.active .progress-bar-fill {
                width: 100%;
              }
              .progress-bar.completed .progress-bar-fill {
                width: 100%;
              }
            `,
          }}
        />
      </head>
      <body
        className={`${notoSans.variable} ${splineSans.variable} antialiased bg-[#122118]`}
        style={{ fontFamily: '"Spline Sans", "Noto Sans", sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
