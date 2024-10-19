import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface FeaturedImageSelectProps {
      featuredImage: string | null
      featuredImageId: number | null
      onSelectImage: () => void
      onRemoveImage: () => void
}

export function FeaturedImageSelect({
      featuredImage,
      featuredImageId,
      onSelectImage,
      onRemoveImage
}: FeaturedImageSelectProps) {
      return (
            <div>
                  <label className="block text-sm font-medium text-gray-700">Featured Image</label>
                  {featuredImage && (
                        <div className="mt-2 relative">
                              <Image
                                    src={featuredImage}
                                    alt="Featured Image"
                                    width={200}
                                    height={200}
                                    className="object-cover rounded-md"
                              />
                              <button
                                    onClick={onRemoveImage}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    aria-label="Remove image"
                              >
                                    <X size={16} />
                              </button>
                        </div>
                  )}
                  <Button type="button" onClick={onSelectImage} className="mt-2">
                        {featuredImageId ? 'Change' : 'Select'} Featured Image
                  </Button>
            </div>
      )
}
