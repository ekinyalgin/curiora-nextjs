"use client";
import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import SignInModal from './auth/SignInModal';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // If the current path starts with '/admin', don't render the header
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold mr-6">
              Your Logo
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              About
            </Link>
          </div>
          <div className="flex items-center">
            {status === "loading" ? (
              <div>Loading...</div>
            ) : session ? (
              <>
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt="User"
                    width={32}
                    height={32}
                    className="rounded-full mr-2"
                  />
                )}
                {session.user?.role === 1 && (
                  <Link href="/admin" className="mr-4 text-blue-600 hover:text-blue-800">
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </header>
  );
}