import { Suspense, ReactNode } from 'react'
import Loading from './Loading'

interface SuspenseWrapperProps {
      children: ReactNode
}

export default function SuspenseWrapper({ children }: SuspenseWrapperProps) {
      return <Suspense fallback={<Loading />}>{children}</Suspense>
}
