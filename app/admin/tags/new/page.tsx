'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AdminFormLayout } from '@/components/ui/admin-form-layout';
import { LanguageSelect } from '@/components/ui/language-select';
import slugify from 'slugify';

export default function NewTag() {
      const [tagName, setTagName] = useState('');
      const [tagSlug, setTagSlug] = useState('');
      const [tagDescription, setTagDescription] = useState('');
      const [tagLanguageId, setTagLanguageId] = useState('');
      const router = useRouter();

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            try {
                  const slug = tagSlug || slugify(tagName, { lower: true, strict: true });
                  const response = await fetch('/api/tags', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                              name: tagName,
                              slug,
                              description: tagDescription,
                              language_id: tagLanguageId,
                        }),
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

      return (
            <AdminFormLayout title="Add New Tag" backLink="/admin/tags" onSubmit={handleSubmit} submitText="Add Tag">
                  <Input
                        type="text"
                        value={tagName}
                        onChange={(e) => setTagName(e.target.value)}
                        placeholder="Tag name"
                        required
                  />
                  <Input
                        type="text"
                        value={tagSlug}
                        onChange={(e) => setTagSlug(e.target.value)}
                        placeholder="Slug (optional, will be generated from name if empty)"
                  />
                  <Textarea
                        value={tagDescription}
                        onChange={(e) => setTagDescription(e.target.value)}
                        placeholder="Tag description"
                  />
                  <LanguageSelect value={tagLanguageId} onChange={setTagLanguageId} />
            </AdminFormLayout>
      );
}
