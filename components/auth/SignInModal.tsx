"use client";
import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
        <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}>
          <X size={20} />
        </button>
        <div className="text-center">
        <h2 className="text-xl font-bold mb-4">Sign In</h2>
        <button
                onClick={() => signIn('google')}
                className="w-full bg-red-500 text-white py-2 px-4 text-sm rounded-md hover:bg-red-600 transition">
                Sign in with Google
            </button>
        <button onClick={onClose} className="w-full bg-gray-200 py-2 rounded-md mt-2 text-gray-500 hover:text-gray-700 transition text-sm font-semibold">
          Cancel
        </button>
      </div>
      </div>
    </div>
  );
}