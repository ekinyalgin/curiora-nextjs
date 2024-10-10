"use client";
import { ReactNode } from 'react';
import { signIn } from 'next-auth/react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function SignInModal({ isOpen, onClose }: ModalProps) {
  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl: '/' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Sign In</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Button onClick={handleGoogleSignIn} variant="destructive" className="w-full">
          <FaGoogle className='mr-2' />Sign in with Google
          </Button>
          <Button onClick={onClose} variant="secondary" className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}