"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { isValidToken, setSessionJWT } from "@/auth/jwt";
import ThemeProvider from "./ThemeProvider";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setSessionJWT(token);
      router.replace("/");
      return;
    }

    const savedToken =
      typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const valid = savedToken && isValidToken(savedToken);

    if (!valid && pathname !== "/login") {
      router.replace("/login");
    }

    if (valid && pathname === "/login") {
      router.replace("/");
    }
  }, [searchParams, router, pathname]);

  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
