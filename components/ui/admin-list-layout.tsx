'use client';
import React, { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import Link from 'next/link';
import { Settings2, X, Check, Search, Trash, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface AdminListLayoutProps<T> {
      title: string;
      addNewLink: string;
      addNewText: string;
      columns: any[];
      data: T[];
      onEdit?: (id: number) => void;
      onDelete?: (id: number) => Promise<void>;
      onBulkDelete?: (ids: number[]) => Promise<void>;
      searchColumn?: string;
      searchPlaceholder?: string;
      onSearch?: (searchTerm: string) => Promise<void>;
      searchTerm?: string;
      onResetSearch?: () => Promise<void>;
      searchTypeSelector?: React.ReactNode;
      searchOptions?: { value: string; label: string }[];
      showCheckbox?: boolean;
}

export function AdminListLayout<T extends { id: number }>({
      title,
      addNewLink,
      addNewText,
      columns,
      data,
      onEdit,
      onDelete,
      onBulkDelete,
      searchColumn,
      searchPlaceholder,
      onSearch,
      searchTerm,
      onResetSearch,
      searchTypeSelector,
      searchOptions,
      showCheckbox = false,
}: AdminListLayoutProps<T>) {
      const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
      const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');
      const [selectedItems, setSelectedItems] = useState<number[]>([]);

      const handleSelectItem = (id: number, checked: boolean) => {
            setSelectedItems((prev) => (checked ? [...prev, id] : prev.filter((item) => item !== id)));
      };

      const handleSelectAll = (checked: boolean) => {
            setSelectedItems(checked ? data.map((item) => item.id) : []);
      };

      const handleBulkDelete = async () => {
            if (onBulkDelete && selectedItems.length > 0) {
                  await onBulkDelete(selectedItems);
                  setSelectedItems([]);
            }
      };

      const selectColumn = showCheckbox
            ? {
                    id: 'select',
                    header: ({ table }) => (
                          <Checkbox
                                checked={table.getIsAllPageRowsSelected()}
                                onCheckedChange={(value) => {
                                      table.toggleAllPageRowsSelected(!!value);
                                      handleSelectAll(!!value);
                                }}
                                aria-label="Select all"
                          />
                    ),
                    cell: ({ row }) => (
                          <Checkbox
                                checked={row.getIsSelected()}
                                onCheckedChange={(value) => {
                                      row.toggleSelected(!!value);
                                      handleSelectItem(row.original.id, !!value);
                                }}
                                aria-label="Select row"
                          />
                    ),
                    enableSorting: false,
                    enableHiding: false,
              }
            : null;

      const actionsColumn = {
            id: 'actions',
            header: 'Actions',
            headerClassName: 'text-center w-2/12',
            cell: ({ row }: { row: { original: T } }) => {
                  const item = row.original;
                  return (
                        <div className="flex items-center justify-center space-x-2">
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

      const columnsWithSelectAndActions = [...(selectColumn ? [selectColumn] : []), ...columns, actionsColumn];

      const handleSearch = async () => {
            if (onSearch) {
                  await onSearch(localSearchTerm);
            }
      };

      const handleResetSearch = async () => {
            setLocalSearchTerm('');
            if (onResetSearch) {
                  await onResetSearch();
            }
      };

      const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                  handleSearch();
            }
      };

      return (
            <div className="container mx-auto p-4">
                  <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">{title}</h1>
                        <Link href={addNewLink}>
                              <Button variant="primary">{addNewText}</Button>
                        </Link>
                  </div>

                  <div className="flex items-center justify-between space-x-2 mb-4">
                        {showCheckbox && (
                              <Button
                                    onClick={handleBulkDelete}
                                    variant={selectedItems.length === 0 ? 'disabled' : 'destructive'}
                                    disabled={selectedItems.length === 0}
                                    className={`text-sm ${
                                          selectedItems.length === 0 ? '' : 'bg-red-500 hover:bg-red-600'
                                    }`}>
                                    Delete Selected {selectedItems.length > 0 && `(${selectedItems.length})`}
                              </Button>
                        )}
                        <div className="flex items-center space-x-2">
                              {searchColumn && onSearch && (
                                    <>
                                          {searchTypeSelector}
                                          {searchOptions ? (
                                                <Select value={localSearchTerm} onValueChange={setLocalSearchTerm}>
                                                      <SelectTrigger className="w-[180px]">
                                                            <SelectValue placeholder={searchPlaceholder} />
                                                      </SelectTrigger>
                                                      <SelectContent>
                                                            {searchOptions.map((option) => (
                                                                  <SelectItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                  </SelectItem>
                                                            ))}
                                                      </SelectContent>
                                                </Select>
                                          ) : (
                                                <Input
                                                      type="text"
                                                      placeholder={searchPlaceholder || `Search ${title}...`}
                                                      value={localSearchTerm}
                                                      onChange={(e) => setLocalSearchTerm(e.target.value)}
                                                      onKeyPress={handleKeyPress}
                                                      className="w-64"
                                                />
                                          )}
                                          <Button onClick={handleSearch} variant="ghost" className="">
                                                <Search className="w-4 h-4" />
                                          </Button>
                                          {localSearchTerm && (
                                                <Button
                                                      onClick={handleResetSearch}
                                                      variant="ghost"
                                                      className="h-10 rounded-none">
                                                      <X className="-ml-4 w-4 h-4" />
                                                </Button>
                                          )}
                                    </>
                              )}
                        </div>
                  </div>
                  <DataTable columns={columnsWithSelectAndActions} data={data} />
            </div>
      );
}
