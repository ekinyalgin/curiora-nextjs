'use client';

import { useEffect, useState } from 'react';
import { AdminListLayout } from '@/components/ui/admin-list-layout';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

interface Comment {
      id: number;
      status: string;
      commentText: string;
      createdAt: string;
      user: { name: string };
      post: { title: string };
}

export default function CommentsPage() {
      const [comments, setComments] = useState<Comment[]>([]);
      const [searchTerm, setSearchTerm] = useState('');
      const router = useRouter();

      useEffect(() => {
            fetchComments();
      }, []);

      async function fetchComments(search: string = '') {
            const response = await fetch(`/api/comments?search=${encodeURIComponent(search)}`);
            const data = await response.json();
            setComments(data);
      }

      async function deleteComment(id: number) {
            await fetch(`/api/comments/${id}`, { method: 'DELETE' });
            fetchComments(searchTerm);
      }

      const handleEdit = (id: number) => {
            router.push(`/admin/comments/${id}`);
      };

      const handleSearch = async (term: string) => {
            setSearchTerm(term);
            await fetchComments(term);
      };

      const columns: ColumnDef<Comment>[] = [
            {
                  accessorKey: 'commentText',
                  header: 'Comment',
                  cell: ({ row }) => row.original.commentText.substring(0, 50) + '...',
            },
            {
                  accessorKey: 'status',
                  header: 'Status',
            },
            {
                  accessorKey: 'user.name',
                  header: 'User',
            },
            {
                  accessorKey: 'post.title',
                  header: 'Post',
            },
            {
                  accessorKey: 'createdAt',
                  header: 'Created At',
                  cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
            },
      ];

      return (
            <AdminListLayout
                  title="Comments"
                  addNewLink="/admin/comments/new"
                  addNewText="Add New Comment"
                  columns={columns}
                  data={comments}
                  onEdit={handleEdit}
                  onDelete={deleteComment}
                  searchColumn="commentText"
                  searchPlaceholder="Search Comments..."
                  onSearch={handleSearch}
                  showCheckbox={true}
            />
      );
}
