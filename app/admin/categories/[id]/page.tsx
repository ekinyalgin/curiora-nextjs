'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminFormLayout } from '@/components/ui/admin-form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LanguageSelect } from '@/components/ui/language-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import slugify from 'slugify';

export default function CategoryForm({ params }: { params: { id: string } }) {
      const [category, setCategory] = useState({
            name: '',
            slug: '',
            description: '',
            languageId: '',
            parentId: null as string | null,
            seoDescription: '',
            seoTitle: '',
      });
      const [parentCategories, setParentCategories] = useState([]);
      const router = useRouter();
      const id = params.id === 'new' ? null : parseInt(params.id);

      useEffect(() => {
            if (id) {
                  fetchCategory();
            }
            fetchParentCategories();
      }, [id]);

      async function fetchCategory() {
            const response = await fetch(`/api/categories/${id}`);
            const data = await response.json();
            setCategory({
                  ...data,
                  languageId: data.languageId ? data.languageId.toString() : '',
                  parentId: data.parentId ? data.parentId.toString() : null,
            });
      }

      async function fetchParentCategories() {
            const response = await fetch('/api/categories');
            const data = await response.json();
            setParentCategories(data.filter((c) => c.id !== id));
      }

      async function handleSubmit(e: React.FormEvent) {
            e.preventDefault();
            try {
                  const method = id ? 'PUT' : 'POST';
                  const url = id ? `/api/categories/${id}` : '/api/categories';
                  const response = await fetch(url, {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(category),
                  });
                  if (!response.ok) throw new Error('Failed to save category');
                  router.push('/admin/categories');
            } catch (err) {
                  console.error('Error saving category:', err);
                  alert('Failed to save category. Please try again.');
            }
      }

      return (
            <AdminFormLayout
                  title={id ? 'Edit Category' : 'Create Category'}
                  backLink="/admin/categories"
                  onSubmit={handleSubmit}
                  submitText={id ? 'Update Category' : 'Create Category'}>
                  <Input
                        name="name"
                        label="Name"
                        value={category.name}
                        onChange={(e) => setCategory({ ...category, name: e.target.value })}
                        placeholder="Enter category name"
                        required
                  />
                  <Input
                        name="slug"
                        label="Slug"
                        value={category.slug}
                        onChange={(e) => setCategory({ ...category, slug: e.target.value })}
                        placeholder="Enter slug or leave empty to generate from name"
                  />
                  <Textarea
                        name="description"
                        label="Description"
                        value={category.description}
                        onChange={(e) => setCategory({ ...category, description: e.target.value })}
                        placeholder="Enter category description (optional)"
                  />
                  <LanguageSelect
                        value={category.languageId}
                        onChange={(value) => setCategory({ ...category, languageId: value })}
                  />
                  <Select
                        value={category.parentId || undefined}
                        onValueChange={(value) => setCategory({ ...category, parentId: value })}>
                        <SelectTrigger>
                              <SelectValue placeholder="Select parent category" />
                        </SelectTrigger>
                        <SelectContent>
                              <SelectItem value="null">None</SelectItem>
                              {parentCategories.map((parentCategory) => (
                                    <SelectItem key={parentCategory.id} value={parentCategory.id.toString()}>
                                          {parentCategory.name}
                                    </SelectItem>
                              ))}
                        </SelectContent>
                  </Select>
                  <Input
                        name="seoTitle"
                        label="SEO Title"
                        value={category.seoTitle}
                        onChange={(e) => setCategory({ ...category, seoTitle: e.target.value })}
                        placeholder="Enter SEO title"
                  />
                  <Textarea
                        name="seoDescription"
                        label="SEO Description"
                        value={category.seoDescription}
                        onChange={(e) => setCategory({ ...category, seoDescription: e.target.value })}
                        placeholder="Enter SEO description"
                  />
            </AdminFormLayout>
      );
}
