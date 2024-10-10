"use client";
import { useState, useEffect, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Modal from './auth/SignInModal'; 
import { LogIn } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Header() {
    const { data: session } = useSession();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
            <h1 className="text-black text-xl font-semibold">My App</h1>
            {session ? (
                <div className="relative" ref={dropdownRef}>
                    <img
                        src={session.user?.image || '/default-avatar.png'}
                        alt={session.user?.username || 'User'}
                        className="w-8 h-8 rounded-full cursor-pointer"
                        onClick={toggleDropdown}
                    />

                    <div className={`absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow transition-all duration-200 ease-in-out ${isDropdownOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <div className='text-black text-sm p-2'>
                            <div className='font-semibold'>
                                {session.user?.firstname} {session.user?.lastname}
                            </div>
                            <div className='text-gray-400'>{session.user?.email}</div>
                        </div>
                        <button
                            onClick={() => signOut()}
                            className="border-t border-gray-200 text-center text-xs font-semibold w-full px-4 py-2 bg-gray-50 text-black hover:bg-gray-100 transition"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            ) : (
                <>
                <Button onClick={openModal} className="flex text-white" ><LogIn strokeWidth={1.5} size={16} className='mr-2' /> Sign In</Button>
                </>
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <Modal />
            </Modal>
        </header>
    );
}
