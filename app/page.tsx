'use client';

import { signOut, useSession } from 'next-auth/react';
import '@/styles/globals.css';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        // Eğer kullanıcı giriş yapmamışsa, giriş sayfasına yönlendir.
        if (!session && status !== 'loading') {
            router.push('/auth/signin');
        }
    }, [session, status, router]);

    // Giriş kontrolü yapılırken "loading" durumu göstermek için.
    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            

            {session ? (
                <>
                    <h1 className="mb-4 text-2xl font-bold">
                        Welcome, {session.user.username}!{' '}
                        {session.user?.firstname}
                    </h1>
                    <p className="mb-4">Email: {session.user?.email}</p>
                    <img
                        src={session.user?.image || '/default-avatar.png'}
                        alt="User Avatar"
                        className="w-16 h-16 rounded-full"
                    />
                    <button
                        onClick={() => signOut()}
                        className="px-4 py-2 mt-4 text-white bg-red-500 rounded"
                    >
                        Sign Out
                    </button>
                </>
            ) : (
                <p className="text-lg">You are not logged in.</p>
            )}
        </div>
    );
}
