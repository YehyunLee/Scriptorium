import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "./contexts/auth_context";
import NavBar from "@/components/NavBar";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <NavBar />
      <Component {...pageProps} />
    </AuthProvider>
  );
}
