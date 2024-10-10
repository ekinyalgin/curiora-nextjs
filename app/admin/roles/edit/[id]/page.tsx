'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AdminFormLayout } from '@/components/ui/admin-form-layout';

export default function EditRole({ params }: { params: { id: string } }) {
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 1) {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchRole();
    }
  }, [status, session, router]);

  const fetchRole = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/roles/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch role');
      const data = await response.json();
      setRoleName(data.name);
      setRoleDescription(data.description);
    } catch (err) {
      console.error('Error fetching role:', err);
      setError('Failed to load role data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/roles/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roleName, description: roleDescription }),
      });
      if (!response.ok) throw new Error('Failed to update role');
      router.push('/admin/roles');
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Failed to update role. Please try again.');
    }
  };

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
    <AdminFormLayout
      title="Edit Role"
      backLink="/admin/roles"
      onSubmit={handleSubmit}
      submitText="Update Role"
    >
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