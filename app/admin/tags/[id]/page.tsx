'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminFormLayout } from '@/components/ui/admin-form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LanguageSelect } from '@/components/ui/language-select';
import slugify from 'slugify';

export default function TagForm({ params }: { params: { id: string } }) {
      const [tag, setTag] = useState({ name: '', slug: '', description: '', language_id: '' });
      const router = useRouter();
      const id = params.id === 'new' ? null : parseInt(params.id);

      useEffect(() => {
            if (id) {
                  fetchTag();
            }
      }, [id]);

      async function fetchTag() {
            const response = await fetch(`/api/tags/${id}`);
            const data = await response.json();
            setTag({
                  ...data,
                  language_id: data.language_id ? data.language_id.toString() : '',
            });
      }

      async function handleSubmit(e: React.FormEvent) {
            e.preventDefault();
            try {
                  const method = id ? 'PUT' : 'POST';
                  const url = id ? `/api/tags/${id}` : '/api/tags';
                  const response = await fetch(url, {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(tag),
                  });
                  if (!response.ok) throw new Error('Failed to save tag');
                  router.push('/admin/tags');
            } catch (err) {
                  console.error('Error saving tag:', err);
                  alert('Failed to save tag. Please try again.');
            }
      }

      return (
            <AdminFormLayout
                  title={id ? 'Edit Tag' : 'Create Tag'}
                  backLink="/admin/tags"
                  onSubmit={handleSubmit}
                  submitText={id ? 'Update Tag' : 'Create Tag'}>
                  <Input
                        name="name"
                        label="Name"
                        value={tag.name}
                        onChange={(e) => setTag({ ...tag, name: e.target.value })}
                        placeholder="Enter tag name"
                        required
                  />
                  <Input
                        name="slug"
                        label="Slug"
                        value={tag.slug}
                        onChange={(e) => setTag({ ...tag, slug: e.target.value })}
                        placeholder="Enter slug or leave empty to generate from name"
                  />
                  <Textarea
                        name="description"
                        label="Description"
                        value={tag.description}
                        onChange={(e) => setTag({ ...tag, description: e.target.value })}
                        placeholder="Enter tag description (optional)"
                  />
                  <LanguageSelect
                        value={tag.language_id}
                        onChange={(value) => setTag({ ...tag, language_id: value })}
                  />
            </AdminFormLayout>
      );
}
