import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],
    adapter: PrismaAdapter(prisma),
    callbacks: {
        async signIn({ user, account, profile }) {
            const ipAddress = cookies().get('ipAddress')?.value || '0.0.0.0';
            const username = user.email?.split('@')[0];

            await prisma.user.update({
                where: { email: user.email },
                data: {
                    firstname: profile?.given_name || null,
                    lastname: profile?.family_name || null,
                    username: username,
                    lastLogin: new Date(),
                    ipAddress: ipAddress,
                },
            });

            return true;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.username = token.username as string;
                session.user.firstname = token.firstname as string;
                session.user.lastname = token.lastname as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            // Eğer `user` varsa, kullanıcı giriş yapıyor demektir, verileri token'a ekle
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.firstname = user.firstname;
                token.lastname = user.lastname;
            } else if (token.id) {
                // Eğer `user` yoksa ve `token` id içeriyorsa, kullanıcıyı veritabanından al
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                });
                if (dbUser) {
                    token.username = dbUser.username;
                    token.firstname = dbUser.firstname;
                    token.lastname = dbUser.lastname;
                }
            }
            return token;
        },
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
