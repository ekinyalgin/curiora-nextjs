'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AdminFormLayout } from '@/components/ui/admin-form-layout';
import { LanguageSelect } from '@/components/ui/language-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import slugify from 'slugify';

export default function NewCategory() {
      const [categoryName, setCategoryName] = useState('');
      const [categorySlug, setCategorySlug] = useState('');
      const [categoryDescription, setCategoryDescription] = useState('');
      const [categoryLanguageId, setCategoryLanguageId] = useState('');
      const [categoryParentId, setCategoryParentId] = useState<string | null>(null);
      const [categorySeoDescription, setCategorySeoDescription] = useState('');
      const [categorySeoTitle, setCategorySeoTitle] = useState('');
      const [parentCategories, setParentCategories] = useState([]);
      const router = useRouter();

      useEffect(() => {
            fetchParentCategories();
      }, []);

      async function fetchParentCategories() {
            const response = await fetch('/api/categories');
            const data = await response.json();
            setParentCategories(data);
      }

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            try {
                  const slug = categorySlug || slugify(categoryName, { lower: true, strict: true });
                  const response = await fetch('/api/categories', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                              name: categoryName,
                              slug,
                              description: categoryDescription,
                              languageId: categoryLanguageId,
                              parentId: categoryParentId,
                              seoDescription: categorySeoDescription,
                              seoTitle: categorySeoTitle,
                        }),
                  });

                  if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`Failed to add category: ${errorData.error}, ${errorData.details}`);
                  }

                  router.push('/admin/categories');
            } catch (err) {
                  console.error('Error adding category:', err);
                  alert(`Failed to add category. Please try again. Error: ${err.message}`);
            }
      };

      return (
            <AdminFormLayout
                  title="Add New Category"
                  backLink="/admin/categories"
                  onSubmit={handleSubmit}
                  submitText="Add Category">
                  <Input
                        type="text"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="Category name"
                        required
                  />
                  <Input
                        type="text"
                        value={categorySlug}
                        onChange={(e) => setCategorySlug(e.target.value)}
                        placeholder="Slug (optional, will be generated from name if empty)"
                  />
                  <Textarea
                        value={categoryDescription}
                        onChange={(e) => setCategoryDescription(e.target.value)}
                        placeholder="Category description"
                  />
                  <LanguageSelect value={categoryLanguageId} onChange={setCategoryLanguageId} />
                  <Select value={categoryParentId || undefined} onValueChange={setCategoryParentId}>
                        <SelectTrigger>
                              <SelectValue placeholder="Select parent category" />
                        </SelectTrigger>
                        <SelectContent>
                              <SelectItem value="null">None</SelectItem>
                              {parentCategories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                          {category.name}
                                    </SelectItem>
                              ))}
                        </SelectContent>
                  </Select>
                  <Input
                        type="text"
                        value={categorySeoTitle}
                        onChange={(e) => setCategorySeoTitle(e.target.value)}
                        placeholder="SEO Title"
                  />
                  <Textarea
                        value={categorySeoDescription}
                        onChange={(e) => setCategorySeoDescription(e.target.value)}
                        placeholder="SEO Description"
                  />
            </AdminFormLayout>
      );
}
