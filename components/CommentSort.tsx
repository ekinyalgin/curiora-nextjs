interface CommentSortProps {
      onSort: (option: 'best' | 'new' | 'old' | 'controversial') => void
      currentSort: 'best' | 'new' | 'old' | 'controversial'
}

export default function CommentSort({ onSort, currentSort }: CommentSortProps) {
      return (
            <div className="flex items-center space-x-2">
                  <span>Sort by:</span>
                  <select
                        value={currentSort}
                        onChange={(e) => onSort(e.target.value as 'best' | 'new' | 'old' | 'controversial')}
                        className="border rounded px-2 py-1"
                  >
                        <option value="best">Best</option>
                        <option value="new">New</option>
                        <option value="old">Old</option>
                        <option value="controversial">Controversial</option>
                  </select>
            </div>
      )
}
