'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AdminFormLayout } from '@/components/ui/admin-form-layout'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LanguageSelect } from '@/components/ui/language-select'
import { ImageSelect } from '@/components/ui/imageSelect/image-select'
import { TagInput } from '@/components/ui/tag-input'
import { SlugInput, createSlug } from '@/components/ui/slug-input'
import { checkSlugUniqueness, generateUniqueSlug } from '@/lib/slugUtils'
import Editor from '@/components/Editor'
import { FeaturedImageSelect } from '@/components/FeaturedImageSelect'

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
            featuredImage: '', // Bunu ekleyin
            tags: [] as string[]
      })
      const [users, setUsers] = useState([])
      const [categories, setCategories] = useState([])
      const [isLoading, setIsLoading] = useState(true)
      const [showImageSelect, setShowImageSelect] = useState(false)
      const [showEditorImageSelect, setShowEditorImageSelect] = useState(false)
      const router = useRouter()
      const id = parseInt(params.id)

      const fetchPost = useCallback(async () => {
            setIsLoading(true)
            const response = await fetch(`/api/posts/${id}`)
            if (!response.ok) {
                  throw new Error('Failed to fetch post')
            }
            const data = await response.json()
            setPost({
                  ...data,
                  userId: data.user.id,
                  categoryId: data.category.id.toString(),
                  languageId: data.language.id.toString(),
                  featuredImageId: data.featuredImageId,
                  featuredImage: data.featuredImage,
                  tags: data.tags ? data.tags.map((tag: { name: string }) => tag.name) : []
            })
            setIsLoading(false)
      }, [id])

      const fetchUsers = useCallback(async () => {
            const response = await fetch('/api/users')
            const data = await response.json()
            setUsers(data)
      }, [])

      const fetchCategories = useCallback(async () => {
            const response = await fetch('/api/categories')
            const data = await response.json()
            setCategories(data)
      }, [])

      useEffect(() => {
            if (id) {
                  fetchPost()
            }
            fetchUsers()
            fetchCategories()
      }, [id, fetchPost, fetchUsers, fetchCategories])

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault()
            try {
                  const postToSubmit = { ...post }
                  if (!postToSubmit.slug) {
                        postToSubmit.slug = createSlug(postToSubmit.title)
                  }

                  const isUnique = await checkSlugUniqueness(postToSubmit.slug, 'post', id)
                  if (!isUnique) {
                        postToSubmit.slug = await generateUniqueSlug(postToSubmit.slug, 'post', id)
                  }

                  const response = await fetch(`/api/posts/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                              ...postToSubmit,
                              user: { id: postToSubmit.userId },
                              category: { id: postToSubmit.categoryId },
                              language: { id: postToSubmit.languageId },
                              featuredImage: { id: postToSubmit.featuredImageId }
                        })
                  })

                  if (!response.ok) {
                        throw new Error('Failed to update post')
                  }

                  router.push('/admin/posts')
            } catch (error) {
                  console.error('Error updating post:', error)
                  alert('Failed to update post. Please try again.')
            }
      }

      const handleInputChange = (name: string, value: string | undefined) => {
            setPost((prev) => ({ ...prev, [name]: value ?? '' }))
      }

      const handleFeaturedImageSelect = (image: { filePath: string; id: number }) => {
            setPost((prev) => ({
                  ...prev,
                  featuredImageId: image.id,
                  featuredImage: image.filePath // 'featured_image' yerine 'featuredImage' kullanın
            }))
            setShowImageSelect(false)
      }

      const handleTagsChange = (newTags: string[]) => {
            setPost((prev) => ({ ...prev, tags: newTags }))
      }

      const handleEditorImageSelect = (imageUrl: string) => {
            setPost((prev) => ({
                  ...prev,
                  content: prev.content + `\n![Alt text](${imageUrl})`
            }))
            setShowEditorImageSelect(false)
      }

      const handleRemoveFeaturedImage = () => {
            setPost((prev) => ({
                  ...prev,
                  featuredImageId: null,
                  featuredImage: '' // null yerine boş string kullanıyoruz
            }))
      }

      if (isLoading) {
            return <div>Loading...</div>
      }

      return (
            <AdminFormLayout title="Edit Post" backLink="/admin/posts" onSubmit={handleSubmit} submitText="Update Post">
                  <Input
                        name="title"
                        value={post.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter post title"
                        required
                  />
                  <SlugInput
                        name="slug"
                        value={post.slug}
                        onChange={handleInputChange}
                        sourceValue={post.title}
                        placeholder="Enter slug or leave empty to generate automatically"
                        autoGenerate={false}
                  />

                  <Editor content={post.content} onChange={(content) => setPost({ ...post, content })} />

                  <Select
                        value={post.status}
                        onValueChange={(value) => setPost((prev) => ({ ...prev, status: value }))}
                  >
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
                        onValueChange={(value) => setPost((prev) => ({ ...prev, userId: value }))}
                  >
                        <SelectTrigger>
                              <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                        <SelectContent>
                              {users.map((user: { id: string; name: string }) => (
                                    <SelectItem key={user.id} value={user.id}>
                                          {user.name}
                                    </SelectItem>
                              ))}
                        </SelectContent>
                  </Select>
                  <Select
                        value={post.categoryId}
                        onValueChange={(value) => setPost((prev) => ({ ...prev, categoryId: value }))}
                  >
                        <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                              {categories.map((category: { id: number; name: string }) => (
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
                  <FeaturedImageSelect
                        featuredImage={post.featuredImage}
                        featuredImageId={post.featuredImageId}
                        onSelectImage={() => setShowImageSelect(true)}
                        onRemoveImage={handleRemoveFeaturedImage}
                  />

                  <ImageSelect
                        value={post.featuredImageId}
                        onSelect={handleFeaturedImageSelect}
                        isOpen={showImageSelect}
                        onClose={() => setShowImageSelect(false)}
                  />

                  {showEditorImageSelect && (
                        <ImageSelect
                              onSelect={(image) => handleEditorImageSelect(image.filePath)}
                              onClose={() => setShowEditorImageSelect(false)}
                              isOpen={showEditorImageSelect}
                        />
                  )}
                  <TagInput tags={post.tags} setTags={handleTagsChange} />
                  <Input
                        name="seoTitle"
                        value={post.seoTitle}
                        onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                        placeholder="Enter SEO title"
                  />
                  <Input
                        name="seoDescription"
                        value={post.seoDescription}
                        onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                        placeholder="Enter SEO description"
                  />
            </AdminFormLayout>
      )
}
