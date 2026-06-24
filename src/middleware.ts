import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(request) {
    const role = request.nextauth.token?.role;
    const path = request.nextUrl.pathname;

    if (path.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/auth/sign-in",
    },
  },
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
