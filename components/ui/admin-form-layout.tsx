import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface AdminFormLayoutProps {
      title: string;
      backLink: string;
      children: ReactNode;
      onSubmit: (e: React.FormEvent) => void;
      submitText: string;
}

export function AdminFormLayout({ title, backLink, children, onSubmit, submitText }: AdminFormLayoutProps) {
      return (
            <div className="container mx-auto p-4">
                  <div className="flex items-center mb-4">
                        <Link href={backLink}>
                              <Button variant="ghost" className="mr-2">
                                    <ArrowLeft className="h-4 w-4" />
                              </Button>
                        </Link>
                        <h1 className="text-2xl font-bold">{title}</h1>
                  </div>
                  <form onSubmit={onSubmit} className="space-y-4">
                        {children}
                        <Button type="submit">{submitText}</Button>
                  </form>
            </div>
      );
}
