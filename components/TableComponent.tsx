import React, { useState } from 'react'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Settings2, Check, X, Search } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'

type ExtendedColumnDef<T> = ColumnDef<T> & {
      headerClassName?: string
}

interface TableComponentProps<T extends object> {
      columns: ExtendedColumnDef<T>[]
      data: T[]
      onEdit?: (id: number) => void
      onDelete?: (id: number) => void
      enableCheckbox?: boolean
      frontendLink?: string
      useModal?: boolean
      onSearch?: (searchTerm: string) => void
      enableSearch?: boolean // New prop to enable/disable search
}

export function TableComponent<T extends { id: number }>({
      columns,
      data,
      onEdit,
      onDelete,
      enableCheckbox = false,
      frontendLink,
      useModal = false,
      onSearch,
      enableSearch = true // Default to true for backward compatibility
}: TableComponentProps<T>) {
      const [selectedRows, setSelectedRows] = useState<number[]>([])
      const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
      const [selectAll, setSelectAll] = useState(false)
      const [searchTerm, setSearchTerm] = useState('')

      const table = useReactTable({
            data,
            columns,
            getCoreRowModel: getCoreRowModel()
      })

      const handleRowSelect = (id: number) => {
            setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]))
      }

      const handleSelectAll = () => {
            if (selectAll) {
                  setSelectedRows([])
            } else {
                  setSelectedRows(data.map((item) => item.id))
            }
            setSelectAll(!selectAll)
      }

      const handleEdit = (id: number) => {
            if (useModal) {
                  console.log('Open edit modal for id:', id)
            } else if (onEdit) {
                  onEdit(id)
            }
      }

      const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            if (onSearch) {
                  onSearch(searchTerm)
            }
      }

      const handleResetSearch = () => {
            setSearchTerm('')
            if (onSearch) {
                  onSearch('')
            }
      }

      return (
            <div className="bg-white rounded-lg p-8 shadow-sm">
                  {enableSearch && ( // Only render search form if enableSearch is true
                        <form onSubmit={handleSearch} className="mb-4 relative">
                              <Input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pr-20"
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    {searchTerm && (
                                          <button type="button" onClick={handleResetSearch} className="p-1">
                                                <X className="h-4 w-4 text-gray-400" />
                                          </button>
                                    )}
                                    <button type="submit" className="p-1">
                                          <Search className="h-4 w-4 text-gray-400" />
                                    </button>
                              </div>
                        </form>
                  )}
                  <table className="w-full">
                        <thead className="uppercase h-10 text-xs bg-gray-50 border border-white tracking-wider">
                              {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                          {enableCheckbox && (
                                                <th className="w-1/12 text-black px-4 py-2">
                                                      <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
                                                </th>
                                          )}
                                          {headerGroup.headers.map((header) => (
                                                <th
                                                      key={header.id}
                                                      className={`text-black text-left px-4 ${(header.column.columnDef as ExtendedColumnDef<T>).headerClassName || ''}`}
                                                >
                                                      {header.isPlaceholder
                                                            ? null
                                                            : flexRender(
                                                                    header.column.columnDef.header,
                                                                    header.getContext()
                                                              )}
                                                </th>
                                          ))}
                                          {(onEdit || onDelete) && (
                                                <th className="w-1/12 text-center text-black text-xs px-4">Actions</th>
                                          )}
                                    </tr>
                              ))}
                        </thead>
                        <tbody>
                              {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                          <tr
                                                key={row.id}
                                                className="border-t border-gray-100 text-left hover:bg-gray-50"
                                          >
                                                {enableCheckbox && (
                                                      <td className="text-center px-4 ">
                                                            <Checkbox
                                                                  checked={selectedRows.includes(row.original.id)}
                                                                  onCheckedChange={() =>
                                                                        handleRowSelect(row.original.id)
                                                                  }
                                                            />
                                                      </td>
                                                )}
                                                {row.getVisibleCells().map((cell) => (
                                                      <td className="px-4 h-10 py-4" key={cell.id}>
                                                            {frontendLink ? (
                                                                  <Link href={`${frontendLink}/${row.original.id}`}>
                                                                        {flexRender(
                                                                              cell.column.columnDef.cell,
                                                                              cell.getContext()
                                                                        )}
                                                                  </Link>
                                                            ) : (
                                                                  flexRender(
                                                                        cell.column.columnDef.cell,
                                                                        cell.getContext()
                                                                  )
                                                            )}
                                                      </td>
                                                ))}
                                                {(onEdit || onDelete) && (
                                                      <td className="text-center px-4 py-2">
                                                            <div className="flex items-center justify-center space-x-1">
                                                                  {onEdit && (
                                                                        <Button
                                                                              variant="icon"
                                                                              className="hover:bg-transparent p-1"
                                                                              onClick={() =>
                                                                                    handleEdit(row.original.id)
                                                                              }
                                                                        >
                                                                              <Settings2
                                                                                    strokeWidth="2"
                                                                                    className="w-4 h-4 text-gray-500 hover:text-black transition"
                                                                              />
                                                                        </Button>
                                                                  )}
                                                                  {onDelete &&
                                                                        (deleteConfirmId === row.original.id ? (
                                                                              <>
                                                                                    <Button
                                                                                          variant="icon"
                                                                                          className="hover:bg-transparent p-1"
                                                                                          onClick={async () => {
                                                                                                await onDelete(
                                                                                                      row.original.id
                                                                                                )
                                                                                                setDeleteConfirmId(null)
                                                                                          }}
                                                                                    >
                                                                                          <Check
                                                                                                strokeWidth="3"
                                                                                                className="w-4 h-4 text-green-500 hover:text-green-700 transition"
                                                                                          />
                                                                                    </Button>
                                                                                    <Button
                                                                                          variant="icon"
                                                                                          className="hover:bg-transparent p-1"
                                                                                          onClick={() =>
                                                                                                setDeleteConfirmId(null)
                                                                                          }
                                                                                    >
                                                                                          <X
                                                                                                strokeWidth="3"
                                                                                                className="w-4 h-4 text-red-500 hover:text-red-700 transition"
                                                                                          />
                                                                                    </Button>
                                                                              </>
                                                                        ) : (
                                                                              <Button
                                                                                    variant="icon"
                                                                                    className="hover:bg-transparent p-1"
                                                                                    onClick={() =>
                                                                                          setDeleteConfirmId(
                                                                                                row.original.id
                                                                                          )
                                                                                    }
                                                                              >
                                                                                    <X
                                                                                          strokeWidth="3"
                                                                                          className="w-4 h-4 text-gray-500 hover:text-red-500 transition"
                                                                                    />
                                                                              </Button>
                                                                        ))}
                                                            </div>
                                                      </td>
                                                )}
                                          </tr>
                                    ))
                              ) : (
                                    <tr>
                                          <td colSpan={columns.length} className="h-24 text-center">
                                                No results.
                                          </td>
                                    </tr>
                              )}
                        </tbody>
                  </table>
            </div>
      )
}
