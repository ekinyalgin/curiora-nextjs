'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminFormLayout } from '@/components/ui/admin-form-layout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EditUser({ params }: { params: { id: string } }) {
      const [user, setUser] = useState({
            name: '',
            email: '',
            username: '',
            roleId: '',
      });
      const [roles, setRoles] = useState([]);
      const router = useRouter();
      const { id } = params;

      useEffect(() => {
            fetchUser();
            fetchRoles();
      }, [id]);

      async function fetchUser() {
            const response = await fetch(`/api/users/${id}`);
            const data = await response.json();
            setUser(data);
      }

      async function fetchRoles() {
            const response = await fetch('/api/roles');
            const data = await response.json();
            setRoles(data);
      }

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            try {
                  const response = await fetch(`/api/users/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(user),
                  });

                  if (!response.ok) {
                        throw new Error('Failed to update user');
                  }

                  router.push('/admin/users');
            } catch (err) {
                  console.error('Error updating user:', err);
                  alert('Failed to update user. Please try again.');
            }
      };

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            setUser((prev) => ({ ...prev, [name]: value }));
      };

      return (
            <AdminFormLayout title="Edit User" backLink="/admin/users" onSubmit={handleSubmit} submitText="Update User">
                  <Input
                        name="name"
                        label="Name"
                        value={user.name}
                        onChange={handleInputChange}
                        placeholder="Enter user's name"
                        required
                  />
                  <Input
                        name="email"
                        label="Email"
                        type="email"
                        value={user.email}
                        onChange={handleInputChange}
                        placeholder="Enter user's email"
                        required
                  />
                  <Input
                        name="username"
                        label="Username"
                        value={user.username}
                        onChange={handleInputChange}
                        placeholder="Enter username"
                        required
                  />
                  <Select
                        value={user.roleId}
                        onValueChange={(value) => setUser((prev) => ({ ...prev, roleId: value }))}>
                        <SelectTrigger>
                              <SelectValue placeholder="Select user role" />
                        </SelectTrigger>
                        <SelectContent>
                              {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.id.toString()}>
                                          {role.name}
                                    </SelectItem>
                              ))}
                        </SelectContent>
                  </Select>
            </AdminFormLayout>
      );
}
