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
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface Post {
      id: number
      title: string
      slug: string
      content: string
      status: string
      type: string
      userId: string
      categoryId: string
      languageId: string
      seoTitle: string
      seoDescription: string
      imageId: number | null
      image: { id: number; filePath: string } | null
      tags: string[]
}

interface User {
      id: string
      name: string
}

interface Category {
      id: number
      name: string
}

export default function EditPost({ params }: { params: { id: string } }) {
      const [post, setPost] = useState<Post>({
            id: 0,
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
            imageId: null,
            image: null,
            tags: []
      })
      const [users, setUsers] = useState<User[]>([])
      const [categories, setCategories] = useState<Category[]>([])
      const [isLoading, setIsLoading] = useState(true)
      const [showImageSelect, setShowImageSelect] = useState(false)
      const [showEditorImageSelect, setShowEditorImageSelect] = useState(false)
      const router = useRouter()
      const id = parseInt(params.id)
      const [error, setError] = useState<string | null>(null)

      const fetchPost = useCallback(async () => {
            setIsLoading(true)
            try {
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
                        imageId: data.imageId,
                        image: data.image,
                        tags: data.tags ? data.tags.map((tag: { name: string }) => tag.name) : []
                  })
            } catch (error) {
                  console.error('Error fetching post:', error)
                  setError('Failed to load post. Please try again later.')
            } finally {
                  setIsLoading(false)
            }
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

                  // Explicitly define the fields we want to send
                  const postDataToSend = {
                        title: postToSubmit.title,
                        slug: postToSubmit.slug,
                        content: postToSubmit.content,
                        status: postToSubmit.status,
                        type: postToSubmit.type,
                        userId: postToSubmit.userId,
                        categoryId: postToSubmit.categoryId.toString(), // Ensure it's a string
                        languageId: postToSubmit.languageId.toString(), // Ensure it's a string
                        seoTitle: postToSubmit.seoTitle,
                        seoDescription: postToSubmit.seoDescription,
                        imageId: postToSubmit.imageId ? postToSubmit.imageId.toString() : null, // Ensure it's a string or null
                        tags: postToSubmit.tags
                  }

                  const response = await fetch(`/api/posts/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(postDataToSend)
                  })

                  if (!response.ok) {
                        const errorData = await response.json()
                        throw new Error(errorData.error || 'Failed to update post')
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

      const handleImageSelect = (image: { filePath: string; id: number }) => {
            setPost((prev) => ({
                  ...prev,
                  imageId: image.id,
                  image: { id: image.id, filePath: image.filePath }
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

      const handleRemoveImage = () => {
            setPost((prev) => ({
                  ...prev,
                  imageId: null,
                  image: null
            }))
      }

      const handleImageButtonClick = (e: React.MouseEvent) => {
            e.preventDefault() // Prevent form submission
            setShowImageSelect(true)
      }

      if (isLoading) {
            return <div>Loading...</div>
      }

      if (error) {
            return <div>Error: {error}</div>
      }

      return (
            <AdminFormLayout title="Edit Post" backLink="/admin/posts" onSubmit={handleSubmit} submitText="Update Post">
                  <div className="flex space-x-4 justify-between">
                        <div className="w-9/12">
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
                        </div>
                        <div className="w-3/12 space-y-4">
                              <div className="mb-4">
                                    {post.image ? (
                                          <div className="border w-full p-4 bg-white">
                                                <div className="relative block">
                                                      <Image
                                                            src={post.image.filePath}
                                                            alt="Featured Image"
                                                            width={200}
                                                            height={200}
                                                            className=" object-cover rounded-lg mx-auto"
                                                            unoptimized
                                                      />
                                                      <button
                                                            onClick={handleRemoveImage}
                                                            className="absolute -top-2 right-2 bg-red-500 text-white rounded-full hover:bg-red-600 p-2"
                                                      >
                                                            <X strokeWidth="4" size={12} />
                                                      </button>
                                                </div>
                                          </div>
                                    ) : (
                                          <Button onClick={handleImageButtonClick} type="button">
                                                Select Image
                                          </Button>
                                    )}

                                    <ImageSelect
                                          isOpen={showImageSelect}
                                          onClose={() => setShowImageSelect(false)}
                                          onSelect={handleImageSelect}
                                          value={post.imageId}
                                    />

                                    {showEditorImageSelect && (
                                          <ImageSelect
                                                onSelect={(image) => handleEditorImageSelect(image.filePath)}
                                                onClose={() => setShowEditorImageSelect(false)}
                                                isOpen={showEditorImageSelect}
                                          />
                                    )}
                              </div>

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

                              <Select
                                    value={post.type}
                                    onValueChange={(value) => setPost((prev) => ({ ...prev, type: value }))}
                              >
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
                        </div>
                  </div>

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
