import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Paths accessible without logging in
  const publicPaths = ["/", "/login", "/register", "/pricing", "/about"];
  
  // Exclude static Next.js metadata, visual assets, APIs, and file extensions
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith("/verify-certificate/");

  if (!token && !isPublicPath) {
    // If not authenticated and trying to access protected features, redirect to Login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (token && (pathname === "/login" || pathname === "/register")) {
    // If already authenticated and trying to open login/register, redirect to Dashboard
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware/proxy on all routes except favicon, static images, and edge APIs
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
