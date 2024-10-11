'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import Link from 'next/link';
import { Settings2, X, Check } from 'lucide-react';

interface AdminListLayoutProps<T> {
      title: string;
      addNewLink: string;
      addNewText: string;
      columns: any[];
      data: T[];
      onEdit?: (id: number) => void;
      onDelete?: (id: number) => Promise<void>;
}

export function AdminListLayout<T extends { id: number }>({
      title,
      addNewLink,
      addNewText,
      columns,
      data,
      onEdit,
      onDelete,
}: AdminListLayoutProps<T>) {
      const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

      const actionsColumn = {
            id: 'actions',
            header: 'Actions',
            headerClassName: 'text-center w-2/12',
            cell: ({ row }: { row: { original: T } }) => {
                  const item = row.original;
                  return (
                        <div className="flex items-center justify-center space-x-0">
                              {onEdit && (
                                    <Button
                                          variant="ghost"
                                          className="hover:bg-transparent p-1"
                                          onClick={() => onEdit(item.id)}>
                                          <Settings2
                                                strokeWidth="2"
                                                className="w-4 h-4 text-gray-500 hover:text-black transition"
                                          />
                                    </Button>
                              )}
                              {onDelete &&
                                    (deleteConfirmId === item.id ? (
                                          <Button
                                                variant="ghost"
                                                className="hover:bg-transparent p-1"
                                                onClick={async () => {
                                                      await onDelete(item.id);
                                                      setDeleteConfirmId(null);
                                                }}>
                                                <Check
                                                      strokeWidth="3"
                                                      className="w-4 h-4 text-green-500 hover:text-green-700 transition"
                                                />
                                          </Button>
                                    ) : (
                                          <Button
                                                variant="ghost"
                                                className="hover:bg-transparent p-1"
                                                onClick={() => setDeleteConfirmId(item.id)}>
                                                <X
                                                      strokeWidth="3"
                                                      className="w-4 h-4 text-gray-500 hover:text-red-500 transition"
                                                />
                                          </Button>
                                    ))}
                        </div>
                  );
            },
      };

      const columnsWithActions = onEdit || onDelete ? [...columns, actionsColumn] : columns;

      return (
            <div className="container mx-auto p-4">
                  <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">{title}</h1>
                        <Link href={addNewLink}>
                              <Button variant="primary">{addNewText}</Button>
                        </Link>
                  </div>
                  <DataTable columns={columnsWithActions} data={data} />
            </div>
      );
}
