import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

// Reusing some code from Yehyun's exercise 9
const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <nav className="bg-navy border-b border-gold/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-white text-xl font-bold">
              Scriptorium
            </Link>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/editor"
              className="text-white hover:text-gold transition"
            >
              Code Editor
            </Link>
            <Link
              href="/templates"
              className="text-white hover:text-gold transition"
            >
              Templates
            </Link>
            <Link
              href="/blog"
              className="text-white hover:text-gold transition"
            >
              Blog
            </Link>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-gold"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-navy border-b border-gold/30">
            <Link
              href="/editor"
              className="block px-3 py-2 text-white hover:text-gold"
            >
              Code Editor
            </Link>
            <Link
              href="/templates"
              className="block px-3 py-2 text-white hover:text-gold"
            >
              Templates
            </Link>
            <Link
              href="/blog"
              className="block px-3 py-2 text-white hover:text-gold"
            >
              Blog
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
