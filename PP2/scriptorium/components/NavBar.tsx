import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAuth } from "../pages/contexts/auth_context";

// Reusing some code from Yehyun's exercise 9
const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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

            {/* Auth Buttons */}
            {!isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link href="/login" 
                      className="text-white hover:text-gold transition">
                  Login
                </Link>
                <Link href="/signup"
                      className="bg-gold text-navy px-4 py-2 rounded-md hover:bg-gold/90 transition">
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-white hover:text-gold transition"
                >
                  <span>{user?.firstName || 'Profile'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-navy border border-gold/30 rounded-md shadow-lg">
                    <Link href="/profile"
                          className="block px-4 py-2 text-white hover:bg-gold/10 transition">
                      My Profile
                    </Link>
                    <Link href="/my-templates"
                          className="block px-4 py-2 text-white hover:bg-gold/10 transition">
                      My Templates
                    </Link>
                    <Link href="/my-posts"
                          className="block px-4 py-2 text-white hover:bg-gold/10 transition">
                      My Posts
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-white hover:bg-gold/10 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
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
            {!isAuthenticated ? (
              <>
                <Link href="/login" className="block px-3 py-2 text-white hover:text-gold">
                  Login
                </Link>
                <Link href="/signup" className="block px-3 py-2 text-white hover:text-gold">
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link href="/profile" className="block px-3 py-2 text-white hover:text-gold">
                  My Profile
                </Link>
                <Link href="/my-templates" className="block px-3 py-2 text-white hover:text-gold">
                  My Templates
                </Link>
                <Link href="/my-posts" className="block px-3 py-2 text-white hover:text-gold">
                  My Posts
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-white hover:text-gold"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
