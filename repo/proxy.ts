import {
  convexAuthNextjsProxy,
  nextjsProxyRedirect,
} from "@/lib/convexAuth";

const protectedPaths = ["/dashboard", "/onboarding", "/brand", "/creator", "/admin"];
const authPaths = ["/signin", "/signup"];

function matchesPath(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export default convexAuthNextjsProxy(async (request, ctx) => {
  const isAuthenticated = await ctx.isAuthenticated();
  const pathname = request.nextUrl.pathname;

  if (!isAuthenticated && protectedPaths.some((path) => matchesPath(pathname, path))) {
    return nextjsProxyRedirect(request, "/signin");
  }

  if (isAuthenticated && authPaths.includes(pathname)) {
    return nextjsProxyRedirect(request, "/dashboard");
  }
});

export const config = {
  matcher: ["/((?!auth(?:/|$)|_next/static|_next/image|favicon.ico).*)"],
};
