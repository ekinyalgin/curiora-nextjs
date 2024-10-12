'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AdminFormLayout } from '@/components/ui/admin-form-layout';
import { LanguageSelect } from '@/components/ui/language-select';
import { SlugInput, createSlug } from '@/components/ui/slug-input';

export default function NewTag() {
      const [tag, setTag] = useState({ name: '', slug: '', description: '', language_id: '' });
      const router = useRouter();

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            try {
                  let tagToSubmit = { ...tag };
                  if (!tagToSubmit.slug) {
                        tagToSubmit.slug = createSlug(tagToSubmit.name);
                  }

                  // Slug benzersizliğini kontrol et
                  const isUnique = await checkSlugUniqueness(tagToSubmit.slug);
                  if (!isUnique) {
                        tagToSubmit.slug = await generateUniqueSlug(tagToSubmit.slug, checkSlugUniqueness);
                  }

                  const response = await fetch('/api/tags', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(tagToSubmit),
                  });

                  if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`Failed to add tag: ${errorData.error}, ${errorData.details}`);
                  }

                  router.push('/admin/tags');
            } catch (err) {
                  console.error('Error adding tag:', err);
                  alert(`Failed to add tag. Please try again. Error: ${err.message}`);
            }
      };

      const handleInputChange = (name: string, value: string) => {
            setTag((prev) => ({ ...prev, [name]: value }));
      };

      const checkSlugUniqueness = async (slug: string): Promise<boolean> => {
            const response = await fetch(`/api/check-slug?slug=${encodeURIComponent(slug)}&type=tag`);
            if (!response.ok) {
                  throw new Error('Failed to check slug uniqueness');
            }
            const data = await response.json();
            return data.isUnique;
      };

      async function generateUniqueSlug(
            baseSlug: string,
            checkUniqueness: (slug: string) => Promise<boolean>
      ): Promise<string> {
            let slug = baseSlug;
            let counter = 1;
            let isUnique = await checkUniqueness(slug);

            while (!isUnique) {
                  slug = `${baseSlug}-${counter}`;
                  isUnique = await checkUniqueness(slug);
                  counter++;
            }

            return slug;
      }

      return (
            <AdminFormLayout title="Add New Tag" backLink="/admin/tags" onSubmit={handleSubmit} submitText="Add Tag">
                  <Input
                        name="name"
                        label="Name"
                        value={tag.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Tag name"
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
                        placeholder="Tag description"
                  />
                  <LanguageSelect
                        value={tag.language_id}
                        onChange={(value) => handleInputChange('language_id', value)}
                  />
            </AdminFormLayout>
      );
}
