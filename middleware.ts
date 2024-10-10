import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    // X-Forwarded-For başlığı üzerinden IP adresini almak
    const ipAddress =
        req.ip ||
        req.headers.get('x-forwarded-for')?.split(',')[0] ||
        '0.0.0.0'; // IP bulunamazsa varsayılan IP

    // IP adresini bir çerez (cookie) olarak saklayalım
    const response = NextResponse.next();
    response.cookies.set('ipAddress', ipAddress);

    return response;
}

export const config = {
    matcher: '/api/auth/:path*', // Sadece auth ile ilgili rotalara uygulanacak
};
