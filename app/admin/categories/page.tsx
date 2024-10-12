'use client';

import { useEffect, useState } from 'react';
import { AdminListLayout } from '@/components/ui/admin-list-layout';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';

interface Category {
      id: number;
      name: string;
      slug: string;
      description: string | null;
      language: { id: number; name: string } | null;
      parent: { id: number; name: string } | null;
      children: Category[];
}

export default function CategoriesPage() {
      const [categories, setCategories] = useState<Category[]>([]);
      const [searchTerm, setSearchTerm] = useState('');
      const [searchType, setSearchType] = useState('name');
      const [languages, setLanguages] = useState<{ id: number; name: string }[]>([]);
      const router = useRouter();

      useEffect(() => {
            fetchCategories();
            fetchLanguages();
      }, []);

      async function fetchCategories(searchTerm: string = '', searchType: string = 'name') {
            const response = await fetch(
                  `/api/categories?search=${encodeURIComponent(searchTerm)}&searchType=${searchType}`
            );
            const data = await response.json();
            const organizedCategories = organizeCategories(data);
            setCategories(organizedCategories);
      }

      async function fetchLanguages() {
            const response = await fetch('/api/languages');
            const data = await response.json();
            setLanguages(data);
      }

      function organizeCategories(categories: Category[]): Category[] {
            const topLevelCategories = categories.filter((c) => !c.parent);
            const childCategories = categories.filter((c) => c.parent);

            topLevelCategories.forEach((parent) => {
                  parent.children = childCategories.filter((child) => child.parent?.id === parent.id);
            });

            return topLevelCategories;
      }

      async function deleteCategory(id: number) {
            await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            fetchCategories(searchTerm, searchType);
      }

      async function bulkDeleteCategories(ids: number[]) {
            await Promise.all(ids.map((id) => fetch(`/api/categories/${id}`, { method: 'DELETE' })));
            fetchCategories(searchTerm, searchType);
      }

      const handleEdit = (id: number) => {
            router.push(`/admin/categories/edit/${id}`);
      };

      const handleSearch = async (term: string) => {
            setSearchTerm(term);
            await fetchCategories(term, searchType);
      };

      const handleResetSearch = async () => {
            setSearchTerm('');
            setSearchType('name');
            await fetchCategories();
      };

      const handleSearchTypeChange = (value: string) => {
            setSearchType(value);
            if (searchTerm) {
                  fetchCategories(searchTerm, value);
            }
      };

      const columns: ColumnDef<Category>[] = [
            {
                  accessorKey: 'name',
                  header: 'Name',
                  headerClassName: 'w-3/12',
                  cellClassName: 'font-semibold',
                  cell: ({ row }) => {
                        const indent = row.original.parent ? '' : '';
                        return (
                              <div className={`flex items-center ${indent}`}>
                                    {row.original.parent && <ArrowRight strokeWidth="1.5" className="w-4 h-4 mr-4" />}
                                    <span>{row.original.name}</span>
                              </div>
                        );
                  },
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
                  headerClassName: 'w-4/12',
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
                  cell: ({ row }) => row.original.language?.name || 'N/A',
            },
            {
                  accessorKey: 'parent',
                  header: 'Parent',
                  headerClassName: 'w-2/12',
                  cellClassName: '',
                  cell: ({ row }) => row.original.parent?.name || '-',
            },
      ];

      const flattenCategories = (categories: Category[]): Category[] => {
            return categories.reduce((acc, category) => {
                  acc.push(category);
                  if (category.children && category.children.length > 0) {
                        acc.push(...flattenCategories(category.children));
                  }
                  return acc;
            }, [] as Category[]);
      };

      return (
            <AdminListLayout
                  title="Categories"
                  addNewLink="/admin/categories/new"
                  addNewText="Add New Category"
                  columns={columns}
                  data={flattenCategories(categories)}
                  onEdit={handleEdit}
                  onDelete={deleteCategory}
                  onBulkDelete={bulkDeleteCategories}
                  searchColumn="name"
                  searchPlaceholder={searchType === 'name' ? 'Search Categories...' : 'Select Language'}
                  onSearch={handleSearch}
                  searchTerm={searchTerm}
                  onResetSearch={handleResetSearch}
                  searchTypeSelector={
                        <Select value={searchType} onValueChange={handleSearchTypeChange}>
                              <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Search by" />
                              </SelectTrigger>
                              <SelectContent>
                                    <SelectItem value="name">Name</SelectItem>
                                    <SelectItem value="language">Language</SelectItem>
                              </SelectContent>
                        </Select>
                  }
                  searchOptions={
                        searchType === 'language'
                              ? languages.map((lang) => ({ value: lang.id.toString(), label: lang.name }))
                              : undefined
                  }
                  showCheckbox={true}
            />
      );
}
