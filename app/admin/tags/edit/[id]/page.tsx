'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminFormLayout } from '@/components/ui/admin-form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LanguageSelect } from '@/components/ui/language-select';
import { SlugInput, createSlug } from '@/components/ui/slug-input';
import { checkSlugUniqueness, generateUniqueSlug } from '@/lib/slugUtils';

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
            if (!id) {
                  console.error('No ID provided for fetching tag');
                  return;
            }
            try {
                  const response = await fetch(`/api/tags/${id}`);
                  if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                  }
                  const data = await response.json();
                  setTag({
                        ...data,
                        language_id: data.language_id ? data.language_id.toString() : '',
                  });
            } catch (error) {
                  console.error('Error fetching tag:', error);
                  alert('Failed to fetch tag. Please try again.');
            }
      }

      async function handleSubmit(e: React.FormEvent) {
            e.preventDefault();
            try {
                  let tagToSubmit = { ...tag };
                  if (!tagToSubmit.slug) {
                        tagToSubmit.slug = createSlug(tagToSubmit.name);
                  }

                  // Slug benzersizliğini kontrol et
                  const isUnique = await checkSlugUniqueness(tagToSubmit.slug, 'tag', id);
                  if (!isUnique) {
                        tagToSubmit.slug = await generateUniqueSlug(tagToSubmit.slug, 'tag', id);
                  }

                  const method = id ? 'PUT' : 'POST';
                  const url = id ? `/api/tags/${id}` : '/api/tags';
                  const response = await fetch(url, {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(tagToSubmit),
                  });
                  if (!response.ok) throw new Error('Failed to save tag');
                  router.push('/admin/tags');
            } catch (err) {
                  console.error('Error saving tag:', err);
                  alert('Failed to save tag. Please try again.');
            }
      }

      const handleInputChange = (name: string, value: string) => {
            setTag((prev) => ({ ...prev, [name]: value }));
      };

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
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter tag name"
                        required
                  />
                  <SlugInput
                        name="slug"
                        label="Slug"
                        value={tag.slug}
                        onChange={handleInputChange}
                        sourceValue={tag.name}
                        placeholder="Enter slug or leave empty to generate automatically"
                        autoGenerate={false}
                  />
                  <Textarea
                        name="description"
                        label="Description"
                        value={tag.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter tag description (optional)"
                  />
                  <LanguageSelect
                        value={tag.language_id}
                        onChange={(value) => handleInputChange('language_id', value)}
                  />
            </AdminFormLayout>
      );
}
