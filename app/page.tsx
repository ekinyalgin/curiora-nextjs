'use client';

import { signOut, useSession } from 'next-auth/react';
import '@/styles/globals.css';
import { useEffect } from 'react';

export default function Home() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return <p className="text-center text-primary">Loading...</p>;
    }

    return (
        <div className="flex flex-col items-center justify-center py-6">
            {session ? (
               <div>Logged In</div>
            ) : (
              <div>Not Logged In</div>
            )}
        </div>
    );
}
