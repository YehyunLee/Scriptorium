import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function Home() {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} 
      bg-navy min-h-screen grid grid-rows-[20px_1fr_20px] 
      items-center justify-items-center p-8 pb-20 gap-16 sm:p-20`}
    >
      <main className="flex flex-col gap-12 row-start-2 items-center">
        <h1 className="text-5xl font-bold text-gold tracking-wide">
          Scriptorium
        </h1>

        <p className="text-gold/80 text-xl text-center max-w-2xl">
          Your library of code templates and programming knowledge
        </p>

        <div className="flex gap-6 items-center flex-col sm:flex-row mt-8">
          <Link
            href="/blog/search"
            className="rounded-lg border-2 border-gold text-gold hover:bg-gold 
              hover:text-navy transition-colors px-8 py-4 text-lg font-semibold
              min-w-[200px] text-center"
          >
            Browse Blogs
          </Link>

          <Link
            href="/template/search"
            className="rounded-lg border-2 border-gold/50 text-gold/50 
              hover:border-gold hover:text-gold transition-colors 
              px-8 py-4 text-lg font-semibold min-w-[200px] text-center"
          >
            Browse Templates
          </Link>
        </div>
      </main>

      <footer className="row-start-3 flex gap-6 text-gold/50">
        <div className="hover:text-gold transition-colors">
          Copyright © 2024 Yehyun, Rosalie, and Sadra
        </div>
      </footer>
    </div>
  );
}
