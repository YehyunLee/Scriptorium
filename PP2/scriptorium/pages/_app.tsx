import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "../utils/contexts/auth_context";
import NavBar from "@/components/NavBar";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <NavBar />
      <main className="pt-16">
        <Component {...pageProps} />
      </main>
    </AuthProvider>
  );
}
