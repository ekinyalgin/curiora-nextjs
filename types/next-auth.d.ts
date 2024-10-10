import 'next-auth';
import { DefaultSession } from 'next-auth';
import NextAuth from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: number;
            accessToken: string;
        } & DefaultSession['user'];
    }
}
