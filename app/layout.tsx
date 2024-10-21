import { ReactNode } from 'react'
import { SessionProvider } from '@/components/SessionProvider'
import Header from '@/components/Header'
import SuspenseWrapper from '@/components/SuspenseWrapper'
import '../styles/globals.css'

export default function RootLayout({ children }: { children: ReactNode }) {
      return (
            <html lang="en">
                  <body>
                        <SessionProvider>
                              <Header />
                              <SuspenseWrapper>{children}</SuspenseWrapper>
                        </SessionProvider>
                  </body>
            </html>
      )
}
