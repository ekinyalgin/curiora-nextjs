'use client';

import { useEffect, useState } from 'react';
import { AdminListLayout } from '@/components/ui/admin-list-layout';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Media {
      id: number;
      fileName: string;
      filePath: string;
      fileType: string;
      fileSize: number;
      createdAt: string;
      user: { name: string };
}

export default function MediaPage() {
      const [media, setMedia] = useState<Media[]>([]);
      const [searchTerm, setSearchTerm] = useState('');
      const router = useRouter();

      useEffect(() => {
            fetchMedia();
      }, []);

      async function fetchMedia(search: string = '') {
            const response = await fetch(`/api/media?search=${encodeURIComponent(search)}`);
            const data = await response.json();
            setMedia(data);
      }

      async function deleteMedia(id: number) {
            await fetch(`/api/media/${id}`, { method: 'DELETE' });
            fetchMedia(searchTerm);
      }

      const handleSearch = async (term: string) => {
            setSearchTerm(term);
            await fetchMedia(term);
      };

      const columns: ColumnDef<Media>[] = [
            {
                  accessorKey: 'fileName',
                  header: 'File Name',
            },
            {
                  accessorKey: 'filePath',
                  header: 'Preview',
                  cell: ({ row }) => (
                        <Image src={row.original.filePath} alt={row.original.fileName} width={50} height={50} />
                  ),
            },
            {
                  accessorKey: 'fileType',
                  header: 'File Type',
            },
            {
                  accessorKey: 'fileSize',
                  header: 'File Size',
                  cell: ({ row }) => `${(row.original.fileSize / 1024).toFixed(2)} KB`,
            },
            {
                  accessorKey: 'user.name',
                  header: 'Uploaded By',
            },
            {
                  accessorKey: 'createdAt',
                  header: 'Upload Date',
                  cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
            },
      ];

      return (
            <AdminListLayout
                  title="Media"
                  addNewLink="/admin/media/new" // Bu satırın doğru olduğundan emin olun
                  addNewText="Upload New Media"
                  columns={columns}
                  data={media}
                  onDelete={deleteMedia}
                  searchColumn="fileName"
                  searchPlaceholder="Search Media..."
                  onSearch={handleSearch}
                  showCheckbox={true}
            />
      );
}
