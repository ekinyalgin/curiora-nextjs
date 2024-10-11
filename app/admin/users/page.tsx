'use client';

import { useEffect, useState } from 'react';
import { AdminListLayout } from '@/components/ui/admin-list-layout';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

interface User {
      id: string;
      name: string;
      email: string;
      username: string;
      role: { name: string };
}

export default function UsersPage() {
      const [users, setUsers] = useState<User[]>([]);
      const [searchTerm, setSearchTerm] = useState('');
      const router = useRouter();

      useEffect(() => {
            fetchUsers();
      }, []);

      async function fetchUsers(search: string = '') {
            const response = await fetch(`/api/users?search=${encodeURIComponent(search)}`);
            const data = await response.json();
            setUsers(data);
      }

      async function deleteUser(id: string) {
            await fetch(`/api/users/${id}`, { method: 'DELETE' });
            fetchUsers(searchTerm);
      }

      const handleEdit = (id: string) => {
            router.push(`/admin/users/${id}`);
      };

      const handleSearch = async (term: string) => {
            setSearchTerm(term);
            await fetchUsers(term);
      };

      const columns: ColumnDef<User>[] = [
            {
                  accessorKey: 'name',
                  header: 'Name',
            },
            {
                  accessorKey: 'email',
                  header: 'Email',
            },
            {
                  accessorKey: 'username',
                  header: 'Username',
            },
            {
                  accessorKey: 'role.name',
                  header: 'Role',
            },
      ];

      return (
            <AdminListLayout
                  title="Users"
                  addNewLink="/admin/users/new"
                  addNewText="Add New User"
                  columns={columns}
                  data={users}
                  onEdit={handleEdit}
                  onDelete={deleteUser}
                  searchColumn="name"
                  searchPlaceholder="Search Users..."
                  onSearch={handleSearch}
                  showCheckbox={true}
            />
      );
}
