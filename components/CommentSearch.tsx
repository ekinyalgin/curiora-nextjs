import { useState } from 'react'
import { FaSearch, FaTimes } from 'react-icons/fa'

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
            <form onSubmit={handleSearch} className="flex items-center">
                  <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search comments..."
                        className="border rounded-l px-2 py-1"
                  />
                  <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded-r">
                        <FaSearch />
                  </button>
                  {searchTerm && (
                        <button type="button" onClick={handleReset} className="ml-2 text-gray-500">
                              <FaTimes />
                        </button>
                  )}
            </form>
      )
}
