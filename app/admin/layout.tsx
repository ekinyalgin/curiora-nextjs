"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 1) {
      router.push('/');
    } else {
      setIsLoading(false);
    }
  }, [session, status, router]);

  if (isLoading) {
    return null; // Return null instead of loading text
  }

  if (!session || session.user?.role !== 1) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-semibold text-gray-800">Admin Panel</h1>
        </div>
        <nav className="mt-4">
          <Link href="/admin" className="block py-2 px-4 text-gray-600 hover:bg-gray-200">
            Dashboard
          </Link>
          <Link href="/" className="block py-2 px-4 text-gray-600 hover:bg-gray-200">
            Back to Site
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}