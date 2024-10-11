'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { AdminListLayout } from '@/components/ui/admin-list-layout';

interface Language {
      id: number;
      code: string;
      name: string;
      isDefault: boolean;
}

export default function LanguageManagement() {
      const [languages, setLanguages] = useState<Language[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const { data: session, status } = useSession();
      const router = useRouter();

      useEffect(() => {
            if (status === 'authenticated') {
                  if (session?.user?.role !== 1) {
                        router.push('/');
                  } else {
                        fetchLanguages();
                  }
            } else if (status === 'unauthenticated') {
                  router.push('/login');
            }
      }, [session, status, router]);

      const fetchLanguages = async () => {
            try {
                  setLoading(true);
                  const response = await fetch('/api/languages');
                  if (!response.ok) throw new Error('Failed to fetch languages');
                  const data = await response.json();
                  setLanguages(data);
            } catch (err) {
                  setError('Failed to load languages. Please try again later.');
                  console.error('Error fetching languages:', err);
            } finally {
                  setLoading(false);
            }
      };

      const handleEdit = (id: number) => {
            router.push(`/admin/languages/edit/${id}`);
      };

      const handleDelete = async (id: number) => {
            try {
                  const response = await fetch(`/api/languages/${id}`, {
                        method: 'DELETE',
                  });
                  if (!response.ok) throw new Error('Failed to delete language');
                  await fetchLanguages();
            } catch (err) {
                  console.error('Error deleting language:', err);
                  alert('Failed to delete language. Please try again.');
            }
      };

      const columns: ColumnDef<Language>[] = [
            {
                  accessorKey: 'id',
                  header: 'ID',
                  headerClassName: 'w-1/12 text-center',
                  cellClassName: 'font-medium text-center',
            },
            {
                  accessorKey: 'code',
                  header: 'Code',
                  headerClassName: 'w-2/12',
                  cellClassName: 'px-4 font-semibold',
            },
            {
                  accessorKey: 'name',
                  header: 'Name',
                  headerClassName: 'w-4/12',
                  cellClassName: 'px-4',
            },
            {
                  accessorKey: 'isDefault',
                  header: 'Default',
                  headerClassName: 'w-2/12 text-center',
                  cellClassName: 'text-center',
                  cell: ({ row }) => (row.original.isDefault ? 'Yes' : 'No'),
            },
      ];

      if (status === 'loading' || loading) {
            return <div>Loading...</div>;
      }

      if (error) {
            return <div>Error: {error}</div>;
      }

      if (status === 'authenticated' && session.user.role !== 1) {
            return <div>Unauthorized</div>;
      }

      return (
            <AdminListLayout
                  title="Language Management"
                  addNewLink="/admin/languages/new"
                  addNewText="Add New Language"
                  columns={columns}
                  data={languages}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
            />
      );
}
