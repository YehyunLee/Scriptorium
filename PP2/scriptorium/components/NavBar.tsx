import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useAuth } from "../utils/contexts/auth_context";
import ThemeToggle from "./ThemeToggle";


// Reusing some code from Yehyun's exercise 9
// UPDATE: I then asked Github Copilot to improve the UI for the NavBar component
// Whole part of code below is generated by Github Copilot with some minor modifications

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false); // Track if user is an admin

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}` + "/api/auth/logout", { method: "POST" });
      logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_API_ENDPOINT}` + "/api/admin/isAdmin", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        console.log(data)
        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error("Error fetching admin status:", error);
      }
    };

    if (isAuthenticated) {
      fetchAdminStatus();
    }
  }, [isAuthenticated]);

  const isActive = (path: string) => router.pathname === path;

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-navy/95 backdrop-blur-sm shadow-lg" : "bg-navy"
      } border-b border-gold/30`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-16">
          {" "}
          {/* Adjust mobile height */}
          {/* Logo section - make smaller on mobile */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-2">
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gold to-yellow-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-200">
                Scriptorium
              </span>
            </Link>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {[
              { href: "/template/create", label: "Create Template" },
              { href: "/blog/create", label: "Create Blog" },
              { href: "/template/search", label: "Templates" },
              { href: "/blog/search", label: "Blogs" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200
                  ${
                    isActive(item.href)
                      ? "text-gold"
                      : "text-white/80 hover:text-gold"
                  }
                  after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full 
                  after:origin-left after:scale-x-0 after:bg-gold 
                  after:transition-transform hover:after:scale-x-100`}
              >
                {item.label}
              </Link>
            ))}
            <ThemeToggle />

            {/* Auth Section */}
            {!isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-white/80 hover:text-gold transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-gold to-yellow-400 text-navy px-4 py-2 rounded-md 
                    hover:shadow-lg hover:shadow-gold/20 transition-all duration-200 
                    active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="relative group">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 px-3 py-2 text-white/80 
                    hover:text-gold transition-colors duration-200"
                >
                  <span>{user?.firstName || "Profile"}</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 
                      ${isProfileOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-navy/95 backdrop-blur-sm 
                    border border-gold/30 rounded-lg shadow-xl 
                    transform opacity-100 scale-100 transition-all duration-200 
                    origin-top-right divide-y divide-gold/10"
                  >
                    {[
                      { href: "/profile", label: "My Profile" },
                      { href: "/template/profile", label: "My Templates" },
                      { href: "/blog/profile", label: "My Blogs" },
                      ...(isAdmin // Optional role check
                          ? [{ href: "/admin", label: "Admin" }]
                          : []),
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-white/80 hover:text-gold 
                          hover:bg-white/5 transition-colors duration-200"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-white/80 
                        hover:text-gold hover:bg-white/5 transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white/80 hover:text-gold transition-colors duration-200 p-1.5" // Reduced padding
            >
              <svg
                className="h-5 w-5" // Smaller icon
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

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden
          ${isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div
          className="px-2 py-1 space-y-0.5 bg-navy/95 backdrop-blur-sm 
          border-b border-gold/30 shadow-lg"
        >
          {[
            { href: "/template/create", label: "Create Template" },
            { href: "/blog/create", label: "Create Blog" },
            { href: "/template/search", label: "Templates" },
            { href: "/blog/search", label: "Blogs" },
            ...(isAuthenticated
              ? [
                  { href: "/profile", label: "My Profile" },
                  { href: "/template/profile", label: "My Templates" },
                  { href: "/blog/profile", label: "My Blogs" },
                  ...(isAdmin // Optional role check
                      ? [{ href: "/admin", label: "Admin" }]
                      : []),
                ]
              : [
                  { href: "/login", label: "Login" },
                  { href: "/signup", label: "Sign Up" },
                ]),
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-1.5 text-sm font-medium rounded-md
                ${
                  isActive(item.href)
                    ? "text-gold bg-white/5"
                    : "text-white/80 hover:text-gold hover:bg-white/5"
                } transition-colors duration-200`}
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-base font-medium text-white/80 
                hover:text-gold hover:bg-white/5 rounded-md transition-colors duration-200"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
