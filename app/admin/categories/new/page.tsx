'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AdminFormLayout } from '@/components/ui/admin-form-layout';
import { LanguageSelect } from '@/components/ui/language-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SlugInput } from '@/components/ui/slug-input';

export default function NewCategory() {
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
                  const response = await fetch('/api/categories', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(category),
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

      const handleInputChange = (name: string, value: string) => {
            setCategory((prev) => ({ ...prev, [name]: value }));
      };

      return (
            <AdminFormLayout
                  title="Add New Category"
                  backLink="/admin/categories"
                  onSubmit={handleSubmit}
                  submitText="Add Category">
                  <Input
                        name="name"
                        label="Name"
                        value={category.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Category name"
                        required
                  />
                  <SlugInput
                        name="slug"
                        label="Slug"
                        value={category.slug}
                        onChange={handleInputChange}
                        sourceValue={category.name}
                  />
                  <Textarea
                        name="description"
                        label="Description"
                        value={category.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Category description"
                  />
                  <LanguageSelect
                        value={category.languageId}
                        onChange={(value) => handleInputChange('languageId', value)}
                  />
                  <Select
                        value={category.parentId || 'none'}
                        onValueChange={(value) => handleInputChange('parentId', value === 'none' ? null : value)}>
                        <SelectTrigger>
                              <SelectValue placeholder="Select parent category" />
                        </SelectTrigger>
                        <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {parentCategories.map((parentCategory: any) => (
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
                        onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                        placeholder="SEO Title"
                  />
                  <Textarea
                        name="seoDescription"
                        label="SEO Description"
                        value={category.seoDescription}
                        onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                        placeholder="SEO Description"
                  />
            </AdminFormLayout>
      );
}
