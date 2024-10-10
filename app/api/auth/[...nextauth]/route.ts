import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // JWT oluşturulurken kullanıcı bilgilerini token'a ekler
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.role = user.roleId;
        token.id = user.id;
      }
      if (account && profile) {
        token.username = profile.email?.split('@')[0];
      }
      return token;
    },
    // Session oluşturulurken token'daki bilgileri session'a ekler
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
    // Kullanıcı oturum açtığında kullanıcı kaydını günceller veya oluşturur
    async signIn({ user, account, profile }) {
      if (user && profile && account) {
        // Kullanıcıya ait mevcut hesabı kontrol et
        const existingAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
        });
    
        // Eğer mevcut bir hesap yoksa, kullanıcı kaydını oluştur veya güncelle
        if (!existingAccount) {
          await prisma.user.upsert({
            where: { email: user.email },
            update: {
              lastLogin: new Date(),
              username: profile.email?.split('@')[0],
            },
            create: {
              id: user.id,
              name: profile.name,
              email: user.email,
              image: user.image,
              lastLogin: new Date(),
              username: profile.email?.split('@')[0],
            },
          });
    
          // Yeni bir hesap kaydı oluştur, type alanını eklemeyi unutmayın
          await prisma.account.create({
            data: {
              userId: user.id,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              type: account.type || "oauth", // Genellikle "oauth" veya "oauth2"
            },
          });
        }
      }
      return true;
    }
    
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
