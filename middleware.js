import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  if (pathname !== "/") return NextResponse.next();

  const username = request.cookies.get("fc_user")?.value;
  if (username) {
    return NextResponse.redirect(new URL(`/${username}/workout`, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
