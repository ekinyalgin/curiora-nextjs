import '@/styles/globals.css';
import { ReactNode } from 'react';
import Header from '@/components/Header';
import Providers from '@/components/Providers';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground font-sans">
        <Providers>
          <Header />
          <main className="container mx-auto p-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
