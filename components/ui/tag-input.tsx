import React, { useState, KeyboardEvent } from 'react';
import { Input } from './input';
import { X } from 'lucide-react';

interface TagInputProps {
      tags: string[];
      setTags: (tags: string[]) => void;
}

export function TagInput({ tags, setTags }: TagInputProps) {
      const [input, setInput] = useState('');

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setInput(e.target.value);
      };

      const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  addTag();
            }
      };

      const addTag = () => {
            const trimmedInput = input.trim();
            if (trimmedInput && !tags.includes(trimmedInput)) {
                  setTags([...tags, trimmedInput]);
                  setInput('');
            }
      };

      const removeTag = (tagToRemove: string) => {
            setTags(tags.filter((tag) => tag !== tagToRemove));
      };

      return (
            <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                              <span
                                    key={tag}
                                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center">
                                    {tag}
                                    <button
                                          onClick={() => removeTag(tag)}
                                          className="ml-1 text-blue-600 hover:text-blue-800">
                                          <X size={14} />
                                    </button>
                              </span>
                        ))}
                  </div>
                  <Input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleInputKeyDown}
                        placeholder="Add tags (comma separated)"
                  />
            </div>
      );
}
