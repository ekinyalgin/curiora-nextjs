import { useState } from 'react'
import { FaSearch, FaTimes } from 'react-icons/fa'
import { Search, X } from 'lucide-react'

interface CommentSearchProps {
      onSearch: (term: string) => void
}

export default function CommentSearch({ onSearch }: CommentSearchProps) {
      const [searchTerm, setSearchTerm] = useState('')

      const handleSearch = (e: React.FormEvent) => {
            e.preventDefault()
            onSearch(searchTerm)
      }

      const handleReset = () => {
            setSearchTerm('')
            onSearch('')
      }

      return (
            <form onSubmit={handleSearch} className="flex items-center relative">
                  <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search comments..."
                        className="border rounded-full text-sm pl-10 py-2 pr-10"
                  />
                  <button type="submit" className=" text-black absolute left-4">
                        <Search className="w-4" strokeWidth={1.5} />
                  </button>
                  {searchTerm && (
                        <button type="button" onClick={handleReset} className="text-gray-500 absolute right-4">
                              <X className="w-4" strokeWidth={2.5} />
                        </button>
                  )}
            </form>
      )
}
