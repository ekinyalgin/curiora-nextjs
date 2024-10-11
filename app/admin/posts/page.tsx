'use client';

import { useEffect, useState } from 'react';
import { AdminListLayout } from '@/components/ui/admin-list-layout';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

interface Post {
      id: number;
      title: string;
      slug: string;
      status: string;
      type: string;
      author: { name: string };
      category: { name: string };
      language: { name: string };
      publishedAt: string | null;
}

export default function PostsPage() {
      const [posts, setPosts] = useState<Post[]>([]);
      const [searchTerm, setSearchTerm] = useState('');
      const router = useRouter();

      useEffect(() => {
            fetchPosts();
      }, []);

      async function fetchPosts(search: string = '') {
            const response = await fetch(`/api/posts?search=${encodeURIComponent(search)}`);
            const data = await response.json();
            setPosts(data);
      }

      async function deletePost(id: number) {
            await fetch(`/api/posts/${id}`, { method: 'DELETE' });
            fetchPosts(searchTerm);
      }

      const handleEdit = (id: number) => {
            router.push(`/admin/posts/${id}`);
      };

      const handleSearch = async (term: string) => {
            setSearchTerm(term);
            await fetchPosts(term);
      };

      const columns: ColumnDef<Post>[] = [
            {
                  accessorKey: 'title',
                  header: 'Title',
            },
            {
                  accessorKey: 'status',
                  header: 'Status',
            },
            {
                  accessorKey: 'type',
                  header: 'Type',
            },
            {
                  accessorKey: 'author.name',
                  header: 'Author',
            },
            {
                  accessorKey: 'category.name',
                  header: 'Category',
            },
            {
                  accessorKey: 'language.name',
                  header: 'Language',
            },
            {
                  accessorKey: 'publishedAt',
                  header: 'Published At',
                  cell: ({ row }) =>
                        row.original.publishedAt
                              ? new Date(row.original.publishedAt).toLocaleDateString()
                              : 'Not published',
            },
      ];

      return (
            <AdminListLayout
                  title="Posts"
                  addNewLink="/admin/posts/new"
                  addNewText="Add New Post"
                  columns={columns}
                  data={posts}
                  onEdit={handleEdit}
                  onDelete={deletePost}
                  searchColumn="title"
                  searchPlaceholder="Search Posts..."
                  onSearch={handleSearch}
                  showCheckbox={true}
            />
      );
}
