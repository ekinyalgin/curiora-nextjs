'use client';

import { signIn } from 'next-auth/react';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session) {
            router.push('/');
        }
    }, [session, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <h1 className="mb-4 text-2xl font-bold">Sign In</h1>
            <button
                onClick={() => signIn('google')}
                className="px-4 py-2 text-white bg-blue-500 rounded"
            >
                Sign in with Google
            </button>
        </div>
    );
}
