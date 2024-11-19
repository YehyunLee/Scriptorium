import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../pages/contexts/auth_context";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission
    setError(""); // Clear any previous errors

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      login(data.accessToken);
      router.push("/");
    } catch (error: any) {
      setError(error.message);
    }
  };

  // in tailwind, bg-navy/50 is a shorthand for bg-navy with 50% opacity
  return (
    <div className="min-h-screren flex items-center justify-center bg-navy">
      <div className="max-w-md w-full space-y-8 p-8 bg-navy/50 rounded-lg border border-gold/30">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gold">
            Sign in to Scriptorium
          </h2>
        </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {/* && is a short-circuit operator that only renders the right side if the left side is true */}
        {error && <div className="text-red-500 text-center">{error}</div>}
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gold/30 bg-navy text-white rounded-t-md focus:outline-none focus:ring-gold focus:border-gold focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gold/30 bg-navy text-white rounded-b-md focus:outline-none focus:ring-gold focus:border-gold focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-navy bg-gold hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold"
          >
            Sign in
          </button>
        </div>

        <div className="text-center">
          <Link href="/signup" className="text-gold hover:text-gold/80">
            Don't have an account? Sign up
          </Link>
        </div>
      </form>
      </div>
    </div> 
);
}
