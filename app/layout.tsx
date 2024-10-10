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
        <script src="https://cdn.tailwindcss.com"></script>
      <body className="bg-gray-100 text-gray-800">
        <Providers>
          <Header />
          <main className="container mx-auto p-4">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
