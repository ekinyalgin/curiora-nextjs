import { ReactNode } from 'react';
import { SessionProvider } from '@/components/SessionProvider';
import Header from '@/components/Header';
import '../styles/globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
      return (
            <html lang="en">
                  <body>
                        <SessionProvider>
                              <Header />
                              {children}
                        </SessionProvider>
                  </body>
            </html>
      );
}
