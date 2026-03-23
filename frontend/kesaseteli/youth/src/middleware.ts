import { NextRequest, NextResponse } from 'next/server';

const locales = ['fi', 'en', 'sv'];
const defaultLocale = 'fi';

function getLocale(request: NextRequest): string {
  if (request.cookies.has('NEXT_LOCALE')) {
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
    if (cookieLocale && locales.includes(cookieLocale)) {
      return cookieLocale;
    }
  }

  const acceptLanguage = request.headers.get('accept-language');
  if (!acceptLanguage) return defaultLocale;

  const preferredLocale = acceptLanguage
    .split(',')
    .map((lang: string) => lang.split(';')[0].trim().slice(0, 2))
    .find((lang: string) => locales.includes(lang));

  return preferredLocale || defaultLocale;
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Skip public files, api routes, Next.js internal paths
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  const locale = getLocale(request);
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
