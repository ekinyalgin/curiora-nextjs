import React, { useState } from 'react'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Settings2, Check, X } from 'lucide-react'
import Link from 'next/link'

// ColumnDef tipini genişletelim
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
}

export function TableComponent<T extends { id: number }>({
      columns,
      data,
      onEdit,
      onDelete,
      enableCheckbox = false,
      frontendLink,
      useModal = false
}: TableComponentProps<T>) {
      const [selectedRows, setSelectedRows] = useState<number[]>([])
      const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

      const table = useReactTable({
            data,
            columns,
            getCoreRowModel: getCoreRowModel()
      })

      const handleRowSelect = (id: number) => {
            setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]))
      }

      const handleEdit = (id: number) => {
            if (useModal) {
                  console.log('Open edit modal for id:', id)
            } else if (onEdit) {
                  onEdit(id)
            }
      }

      return (
            <div className="bg-white rounded-lg p-8 shadow-sm">
                  <table className="w-full">
                        <thead className="uppercase h-12 text-xs">
                              {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                          {enableCheckbox && <th className="w-1/12 text-black px-4 py-2">Select</th>}
                                          {headerGroup.headers.map((header) => (
                                                <th
                                                      key={header.id}
                                                      className={`text-black px-4 py-2 ${(header.column.columnDef as ExtendedColumnDef<T>).headerClassName || ''}`}
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
                                          <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                                                {enableCheckbox && (
                                                      <td className="px-4 py-2">
                                                            <Checkbox
                                                                  checked={selectedRows.includes(row.original.id)}
                                                                  onCheckedChange={() =>
                                                                        handleRowSelect(row.original.id)
                                                                  }
                                                            />
                                                      </td>
                                                )}
                                                {row.getVisibleCells().map((cell) => (
                                                      <td className="px-4 py-2 h-12" key={cell.id}>
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
