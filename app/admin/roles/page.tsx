'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { AdminListLayout } from '@/components/ui/admin-list-layout';

interface Role {
      id: number;
      name: string;
      description: string;
}

export default function RoleManagement() {
      const [roles, setRoles] = useState<Role[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const { data: session, status } = useSession();
      const router = useRouter();

      useEffect(() => {
            if (status === 'authenticated') {
                  if (session?.user?.role !== 1) {
                        router.push('/');
                  } else {
                        fetchRoles();
                  }
            } else if (status === 'unauthenticated') {
                  router.push('/login');
            }
      }, [session, status, router]);

      const fetchRoles = async () => {
            try {
                  setLoading(true);
                  const response = await fetch('/api/roles');
                  if (!response.ok) throw new Error('Failed to fetch roles');
                  const data = await response.json();
                  setRoles(data);
            } catch (err) {
                  setError('Failed to load roles. Please try again later.');
                  console.error('Error fetching roles:', err);
            } finally {
                  setLoading(false);
            }
      };

      const handleEdit = (id: number) => {
            router.push(`/admin/roles/edit/${id}`);
      };

      const handleDelete = async (id: number) => {
            try {
                  const response = await fetch('/api/roles', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id }),
                  });
                  if (!response.ok) throw new Error('Failed to delete role');
                  await fetchRoles();
            } catch (err) {
                  console.error('Error deleting role:', err);
                  alert('Failed to delete role. Please try again.');
            }
      };

      const columns: ColumnDef<Role>[] = [
            {
                  accessorKey: 'id',
                  header: 'ID',
                  headerClassName: 'w-1/12 text-center',
                  cellClassName: 'font-medium text-center',
            },
            {
                  accessorKey: 'name',
                  header: 'Name',
                  headerClassName: 'w-2/12',
                  cellClassName: 'px-4 font-semibold',
            },
            {
                  accessorKey: 'description',
                  header: 'Description',
                  headerClassName: 'w-7/12',
                  cellClassName: 'px-4 text-gray-400',
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
                  title="Role Management"
                  addNewLink="/admin/roles/new"
                  addNewText="Add New Role"
                  columns={columns}
                  data={roles}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
            />
      );
}
