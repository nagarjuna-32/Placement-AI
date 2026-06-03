"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const publicPaths = ["/", "/login", "/register", "/pricing", "/about"];
    const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith("/verify-certificate/");

    if (!token && !isPublicPath) {
      // Force redirect to login page for all protected routes
      window.location.href = "/login";
    } else {
      setLoading(false);
    }
  }, [pathname]);

  const publicPaths = ["/", "/login", "/register", "/pricing", "/about"];
  const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith("/verify-certificate/");

  // If loading and trying to view protected pages, show clean loader
  if (loading && !isPublicPath) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider animate-pulse">
          Authenticating access...
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
