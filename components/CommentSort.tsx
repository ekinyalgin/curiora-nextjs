import { ChevronDown } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface CommentSortProps {
      onSort: (option: 'best' | 'new' | 'old' | 'controversial') => void
      currentSort: 'best' | 'new' | 'old' | 'controversial'
}

export default function CommentSort({ onSort, currentSort }: CommentSortProps) {
      const sortOptions = [
            { value: 'best', label: 'Best' },
            { value: 'new', label: 'New' },
            { value: 'old', label: 'Old' },
            { value: 'controversial', label: 'Controversial' }
      ]

      return (
            <div className="flex items-center">
                  <span className="text-sm">Sort by:</span>
                  <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                              <Button
                                    variant="outline"
                                    className="flex items-center text-sm border-none hover:bg-transparent text-black hover:text-gray-600"
                              >
                                    <div>{sortOptions.find((option) => option.value === currentSort)?.label}</div>
                                    <ChevronDown className="ml-2 h-4 w-4" />
                              </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="bottom" align="start">
                              {sortOptions.map((option) => (
                                    <DropdownMenuItem
                                          key={option.value}
                                          onSelect={() =>
                                                onSort(option.value as 'best' | 'new' | 'old' | 'controversial')
                                          }
                                    >
                                          {option.label}
                                    </DropdownMenuItem>
                              ))}
                        </DropdownMenuContent>
                  </DropdownMenu>
            </div>
      )
}
