'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AdminFormLayout } from '@/components/ui/admin-form-layout';

export default function NewRole() {
      const [roleName, setRoleName] = useState('');
      const [roleDescription, setRoleDescription] = useState('');
      const { data: session, status } = useSession();
      const router = useRouter();

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            try {
                  const response = await fetch('/api/roles', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: roleName, description: roleDescription }),
                  });
                  if (!response.ok) throw new Error('Failed to add role');
                  router.push('/admin/roles');
            } catch (err) {
                  console.error('Error adding role:', err);
                  alert('Failed to add role. Please try again.');
            }
      };

      if (status === 'loading') {
            return <div>Loading...</div>;
      }

      if (status === 'authenticated' && session.user.role !== 1) {
            return <div>Unauthorized</div>;
      }

      return (
            <AdminFormLayout title="Add New Role" backLink="/admin/roles" onSubmit={handleSubmit} submitText="Add Role">
                  <Input
                        type="text"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        placeholder="Role name"
                        required
                  />
                  <Textarea
                        value={roleDescription}
                        onChange={(e) => setRoleDescription(e.target.value)}
                        placeholder="Role description"
                  />
            </AdminFormLayout>
      );
}
