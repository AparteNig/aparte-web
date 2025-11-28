import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_AUTH_COOKIE, HOST_AUTH_COOKIE } from "./src/lib/auth";

const isAdminRoute = (pathname: string) => pathname.startsWith("/admin");
const isHostRoute = (pathname: string) => pathname.startsWith("/host");

const authPages = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAdminRoute(pathname)) {
    const token = request.cookies.get(ADMIN_AUTH_COOKIE)?.value;
    return handleRoute({
      request,
      token,
      loginPath: "/admin/login",
      dashboardPath: "/admin/dashboard"
    });
  }

  if (isHostRoute(pathname)) {
    const token = request.cookies.get(HOST_AUTH_COOKIE)?.value;
    return handleRoute({
      request,
      token,
      loginPath: "/host/login",
      dashboardPath: "/host/dashboard"
    });
  }

  return NextResponse.next();
}

type HandleRouteArgs = {
  request: NextRequest;
  token?: string;
  loginPath: string;
  dashboardPath: string;
};

const handleRoute = ({ request, token, loginPath, dashboardPath }: HandleRouteArgs) => {
  const { pathname } = request.nextUrl;
  const isAuthPage = authPages.some((page) => pathname.endsWith(page));
  const isDashboard = pathname.startsWith(dashboardPath);

  if (!token && !isAuthPage && pathname !== loginPath) {
    const url = request.nextUrl.clone();
    url.pathname = loginPath;
    return NextResponse.redirect(url);
  }

  if (token && (isAuthPage || pathname === loginPath)) {
    const url = request.nextUrl.clone();
    url.pathname = dashboardPath;
    return NextResponse.redirect(url);
  }

  if (token && !isAuthPage && !isDashboard && pathname.startsWith(loginPath.replace("/login", ""))) {
    // allow other protected admin/host routes in future
    return NextResponse.next();
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/admin/:path*", "/host/:path*"]
};
