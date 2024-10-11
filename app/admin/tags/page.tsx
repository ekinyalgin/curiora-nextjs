'use client';

import { useEffect, useState } from 'react';
import { AdminListLayout } from '@/components/ui/admin-list-layout';
import { ColumnDef } from '@tanstack/react-table';
import { Tag } from '@prisma/client';
import { useRouter } from 'next/navigation';

interface TagWithLanguage extends Tag {
      language: {
            code: string;
            name: string;
      } | null;
}

export default function TagsPage() {
      const [tags, setTags] = useState<TagWithLanguage[]>([]);
      const router = useRouter();

      useEffect(() => {
            fetchTags();
      }, []);

      async function fetchTags() {
            const response = await fetch('/api/tags');
            const data = await response.json();
            setTags(data);
      }

      async function deleteTag(id: number) {
            await fetch(`/api/tags/${id}`, { method: 'DELETE' });
            fetchTags();
      }

      const handleEdit = (id: number) => {
            router.push(`/admin/tags/${id}`);
      };

      const columns: ColumnDef<TagWithLanguage>[] = [
            {
                  accessorKey: 'name',
                  header: 'Name',
                  headerClassName: 'w-2/12',
                  cellClassName: 'font-semibold',
            },
            {
                  accessorKey: 'slug',
                  header: 'Slug',
                  headerClassName: 'w-2/12',
                  cellClassName: 'text-gray-400',
            },
            {
                  accessorKey: 'description',
                  header: 'Description',
                  headerClassName: 'w-6/12',
                  cellClassName: 'text-gray-400 text-sm',
                  cell: ({ row }) => {
                        const description = row.original.description;
                        return description ? description.substring(0, 50) + (description.length > 50 ? '...' : '') : '';
                  },
            },
            {
                  accessorKey: 'language',
                  header: 'Language',
                  headerClassName: 'w-1/12',
                  cellClassName: '',
                  cell: ({ row }) => {
                        const lang = row.original.language;
                        return lang ? lang.name : 'N/A';
                  },
            },
      ];

      return (
            <AdminListLayout
                  title="Tags"
                  addNewLink="/admin/tags/new"
                  addNewText="Add New Tag"
                  columns={columns}
                  data={tags}
                  onEdit={handleEdit}
                  onDelete={deleteTag}
            />
      );
}
