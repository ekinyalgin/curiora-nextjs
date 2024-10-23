'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TableComponent } from '@/components/TableComponent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LanguageSelect } from '@/components/ui/language-select';
import Notification from '@/components/Notification';
import Link from 'next/link';

interface AutoLink {
  id: number;
  keyword: string;
  url: string;
  languageId: number;
  language: {
    name: string;
  };
  posts?: Array<{
    id: number;
    title: string;
    slug: string;
  }>;
}

export default function AutoLinksPage() {
  const [autoLinks, setAutoLinks] = useState<AutoLink[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { register, handleSubmit, reset, control, setValue } = useForm();
  const [loadingPosts, setLoadingPosts] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchAutoLinks();
  }, []);

  const fetchAutoLinks = async () => {
    const response = await fetch('/api/auto-links');
    const data = await response.json();
    setAutoLinks(data);
  };

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/auto-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create auto link');
      reset({ 
        keyword: '', 
        url: '', 
        languageId: data.languageId // Dil seçimini koruyoruz
      });
      fetchAutoLinks();
      setNotification({ message: "Auto link created successfully", type: "success" });
    } catch (error) {
      setNotification({ message: "Failed to create auto link", type: "error" });
    }
  };

  const deleteAutoLink = async (id: number) => {
    try {
      const response = await fetch(`/api/auto-links/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete auto link');
      fetchAutoLinks();
      setNotification({ message: "Auto link deleted successfully", type: "success" });
    } catch (error) {
      setNotification({ message: "Failed to delete auto link", type: "error" });
    }
  };

  const removeLinkFromPost = async (autoLinkId: number, postId: number) => {
    try {
      const response = await fetch(`/api/auto-links/${autoLinkId}/posts/${postId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to remove link from post');
      fetchAutoLinks();
      setNotification({ message: "Link removed from post successfully", type: "success" });
    } catch (error) {
      setNotification({ message: "Failed to remove link from post", type: "error" });
    }
  };

  const loadLinkedPosts = async (autoLinkId: number) => {
    setLoadingPosts(prev => ({ ...prev, [autoLinkId]: true }));
    try {
      const response = await fetch(`/api/auto-links/${autoLinkId}`);
      const data = await response.json();
      setAutoLinks(prev => prev.map(link => link.id === autoLinkId ? { ...link, posts: data.posts } : link));
    } catch (error) {
      console.error('Failed to load linked posts:', error);
    } finally {
      setLoadingPosts(prev => ({ ...prev, [autoLinkId]: false }));
    }
  };

  const columns = [
    {
      accessorKey: 'keyword',
      header: 'Keyword',
    },
    {
      accessorKey: 'url',
      header: 'URL',
    },
    {
      accessorKey: 'language.name',
      header: 'Language',
    },
    {
      accessorKey: 'posts',
      header: 'Linked Posts',
      cell: ({ row }: { row: { original: AutoLink } }) => (
        <div>
          <Button onClick={() => loadLinkedPosts(row.original.id)} disabled={loadingPosts[row.original.id]}>
            {loadingPosts[row.original.id] ? 'Loading...' : 'Load Linked Posts'}
          </Button>
          {row.original.posts && (
            <ul className="list-disc pl-5 mt-2">
              {row.original.posts.map((post) => (
                <li key={post.id} className="mb-2">
                  <Link href={`/posts/${post.slug}`} className="text-blue-500 hover:underline">
                    {post.title}
                  </Link>
                  <Button
                    onClick={() => removeLinkFromPost(row.original.id, post.id)}
                    className="ml-2 text-xs"
                    variant="destructive"
                  >
                    Remove Link
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Auto Links Management</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="mb-8 space-y-4">
        <Input {...register('keyword')} placeholder="Keyword" required />
        <Input {...register('url')} placeholder="URL" required />
        <Controller
          name="languageId"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <LanguageSelect
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
                setValue('languageId', value); // Dil değiştiğinde form state'ini güncelle
              }}
            />
          )}
        />
        <Button type="submit">Add Auto Link</Button>
      </form>

      <TableComponent
        columns={columns}
        data={autoLinks}
        onDelete={deleteAutoLink}
      />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
