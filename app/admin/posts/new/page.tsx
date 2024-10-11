'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminFormLayout } from '@/components/ui/admin-form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LanguageSelect } from '@/components/ui/language-select';
import { ImageUpload } from '@/components/ui/image-upload';
import slugify from 'slugify';

export default function NewPost() {
      const [post, setPost] = useState({
            title: '',
            slug: '',
            content: '',
            status: 'draft',
            type: 'article',
            userId: '',
            categoryId: '',
            languageId: '',
            seoTitle: '',
            seoDescription: '',
            featuredImage: '',
      });
      const [users, setUsers] = useState([]);
      const [categories, setCategories] = useState([]);
      const router = useRouter();

      useEffect(() => {
            fetchUsers();
            fetchCategories();
      }, []);

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

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            try {
                  const response = await fetch('/api/posts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                              ...post,
                              user: { id: post.userId },
                              category: { id: post.categoryId },
                              language: { id: post.languageId },
                        }),
                  });

                  if (!response.ok) {
                        throw new Error('Failed to create post');
                  }

                  router.push('/admin/posts');
            } catch (err) {
                  console.error('Error creating post:', err);
                  alert('Failed to create post. Please try again.');
            }
      };

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setPost((prev) => ({ ...prev, [name]: value }));
            if (name === 'title' && !post.slug) {
                  setPost((prev) => ({ ...prev, slug: slugify(value, { lower: true, strict: true }) }));
            }
      };

      const handleImageUpload = (imageUrl: string) => {
            setPost((prev) => ({ ...prev, featuredImage: imageUrl }));
      };

      const handleImageDelete = async (imageUrl: string) => {
            try {
                  await fetch(`/api/upload?filePath=${encodeURIComponent(imageUrl)}`, { method: 'DELETE' });
                  setPost((prev) => ({ ...prev, featuredImage: '' }));
            } catch (error) {
                  console.error('Error deleting image:', error);
                  alert('Failed to delete image. Please try again.');
            }
      };

      return (
            <AdminFormLayout
                  title="Create New Post"
                  backLink="/admin/posts"
                  onSubmit={handleSubmit}
                  submitText="Create Post">
                  <Input
                        name="title"
                        label="Title"
                        value={post.title}
                        onChange={handleInputChange}
                        placeholder="Enter post title"
                        required
                  />
                  <Input
                        name="slug"
                        label="Slug"
                        value={post.slug}
                        onChange={handleInputChange}
                        placeholder="Enter post slug (or leave empty to generate from title)"
                        required
                  />
                  <Textarea
                        name="content"
                        label="Content"
                        value={post.content}
                        onChange={handleInputChange}
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
                              {users.map((user) => (
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
                              {categories.map((category) => (
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
                  <ImageUpload
                        onImageUpload={handleImageUpload}
                        onImageDelete={handleImageDelete}
                        initialImage={post.featuredImage}
                  />
                  <Input
                        name="seoTitle"
                        label="SEO Title"
                        value={post.seoTitle}
                        onChange={handleInputChange}
                        placeholder="Enter SEO title"
                  />
                  <Textarea
                        name="seoDescription"
                        label="SEO Description"
                        value={post.seoDescription}
                        onChange={handleInputChange}
                        placeholder="Enter SEO description"
                  />
            </AdminFormLayout>
      );
}
