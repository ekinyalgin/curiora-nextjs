'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminFormLayout } from '@/components/ui/admin-form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LanguageSelect } from '@/components/ui/language-select';
import { FeaturedImageSelect } from '@/components/ui/featured-image-select';
import { TagInput } from '@/components/ui/tag-input';
import { SlugInput, createSlug } from '@/components/ui/slug-input';

export default function EditPost({ params }: { params: { id: string } }) {
      const [post, setPost] = useState({
            title: '',
            slug: '',
            content: '',
            status: '',
            type: '',
            userId: '',
            categoryId: '',
            languageId: '',
            seoTitle: '',
            seoDescription: '',
            featuredImageId: null as number | null,
            tags: [] as string[],
      });
      const [users, setUsers] = useState([]);
      const [categories, setCategories] = useState([]);
      const router = useRouter();
      const id = parseInt(params.id);

      useEffect(() => {
            fetchPost();
            fetchUsers();
            fetchCategories();
      }, [id]);

      async function fetchPost() {
            const response = await fetch(`/api/posts/${id}`);
            if (!response.ok) {
                  console.error('Failed to fetch post');
                  return;
            }
            const data = await response.json();
            setPost({
                  ...data,
                  userId: data.user.id,
                  categoryId: data.category.id.toString(),
                  languageId: data.language.id.toString(),
                  featuredImageId: data.featuredImageId,
                  tags: data.tags ? data.tags.map((tag: { name: string }) => tag.name) : [],
            });
      }

      async function fetchUsers() {
            const response = await fetch('/api/users');
            const data = await response.json();
            setUsers(data);
      }

      async function fetchCategories() {
            const response = await fetch('/api/categories');
            const data = await response.json();
            setCategories(data);
      }

      const checkSlugUniqueness = async (slug: string): Promise<boolean> => {
            const response = await fetch(`/api/check-slug?slug=${encodeURIComponent(slug)}&type=post&id=${id}`);
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

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            try {
                  let postToSubmit = { ...post };
                  if (!postToSubmit.slug) {
                        postToSubmit.slug = createSlug(postToSubmit.title);
                  }

                  // Slug benzersizliğini kontrol et
                  const isUnique = await checkSlugUniqueness(postToSubmit.slug);
                  if (!isUnique) {
                        postToSubmit.slug = await generateUniqueSlug(postToSubmit.slug, checkSlugUniqueness);
                  }

                  const response = await fetch(`/api/posts/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                              ...postToSubmit,
                              user: { id: postToSubmit.userId },
                              category: { id: postToSubmit.categoryId },
                              language: { id: postToSubmit.languageId },
                        }),
                  });

                  if (!response.ok) {
                        throw new Error('Failed to update post');
                  }

                  router.push('/admin/posts');
            } catch (err) {
                  console.error('Error updating post:', err);
                  alert('Failed to update post. Please try again.');
            }
      };

      const handleInputChange = (name: string, value: string) => {
            setPost((prev) => ({ ...prev, [name]: value }));
      };

      const handleFeaturedImageSelect = (imageId: number | null) => {
            setPost((prev) => ({ ...prev, featuredImageId: imageId }));
      };

      const handleTagsChange = (newTags: string[]) => {
            setPost((prev) => ({ ...prev, tags: newTags }));
      };

      return (
            <AdminFormLayout title="Edit Post" backLink="/admin/posts" onSubmit={handleSubmit} submitText="Update Post">
                  <Input
                        name="title"
                        label="Title"
                        value={post.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter post title"
                        required
                  />
                  <SlugInput
                        name="slug"
                        label="Slug"
                        value={post.slug}
                        onChange={handleInputChange}
                        sourceValue={post.title}
                        placeholder="Enter slug or leave empty to generate automatically"
                        autoGenerate={false}
                  />
                  <Textarea
                        name="content"
                        label="Content"
                        value={post.content}
                        onChange={(e) => handleInputChange('content', e.target.value)}
                        placeholder="Enter post content"
                        required
                  />
                  <Select
                        value={post.status}
                        onValueChange={(value) => setPost((prev) => ({ ...prev, status: value }))}>
                        <SelectTrigger>
                              <SelectValue placeholder="Select post status" />
                        </SelectTrigger>
                        <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                  </Select>
                  <Select value={post.type} onValueChange={(value) => setPost((prev) => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                              <SelectValue placeholder="Select post type" />
                        </SelectTrigger>
                        <SelectContent>
                              <SelectItem value="article">Article</SelectItem>
                              <SelectItem value="question">Question</SelectItem>
                        </SelectContent>
                  </Select>
                  <Select
                        value={post.userId}
                        onValueChange={(value) => setPost((prev) => ({ ...prev, userId: value }))}>
                        <SelectTrigger>
                              <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                        <SelectContent>
                              {users.map((user: any) => (
                                    <SelectItem key={user.id} value={user.id}>
                                          {user.name}
                                    </SelectItem>
                              ))}
                        </SelectContent>
                  </Select>
                  <Select
                        value={post.categoryId}
                        onValueChange={(value) => setPost((prev) => ({ ...prev, categoryId: value }))}>
                        <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                              {categories.map((category: any) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                          {category.name}
                                    </SelectItem>
                              ))}
                        </SelectContent>
                  </Select>
                  <LanguageSelect
                        value={post.languageId}
                        onChange={(value) => setPost((prev) => ({ ...prev, languageId: value }))}
                  />
                  <FeaturedImageSelect value={post.featuredImageId} onChange={handleFeaturedImageSelect} />
                  <TagInput tags={post.tags} setTags={handleTagsChange} />
                  <Input
                        name="seoTitle"
                        label="SEO Title"
                        value={post.seoTitle}
                        onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                        placeholder="Enter SEO title"
                  />
                  <Textarea
                        name="seoDescription"
                        label="SEO Description"
                        value={post.seoDescription}
                        onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                        placeholder="Enter SEO description"
                  />
            </AdminFormLayout>
      );
}
