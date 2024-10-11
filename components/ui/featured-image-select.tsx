'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from './button';
import { Dialog, DialogContent, DialogTrigger } from './dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { ImageUpload } from './image-upload';
import { Grid, List, Search, Trash } from 'lucide-react';

interface FeaturedImageSelectProps {
      value: number | null;
      onChange: (imageId: number | null) => void;
}

export function FeaturedImageSelect({ value, onChange }: FeaturedImageSelectProps) {
      const [selectedImage, setSelectedImage] = useState<any>(null);
      const [isOpen, setIsOpen] = useState(false);
      const [media, setMedia] = useState([]);
      const [searchTerm, setSearchTerm] = useState('');
      const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
      const [folders, setFolders] = useState<string[]>([]);
      const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
      const [selectedMediaItem, setSelectedMediaItem] = useState<any>(null);

      useEffect(() => {
            if (value) {
                  fetchImage(value);
            }
            fetchFolders();
      }, [value]);

      async function fetchImage(id: number) {
            const response = await fetch(`/api/media/${id}`);
            const data = await response.json();
            setSelectedImage(data);
      }

      async function fetchMedia() {
            const response = await fetch(`/api/media?search=${searchTerm}&folder=${selectedFolder || ''}`);
            const data = await response.json();
            setMedia(data);
      }

      async function fetchFolders() {
            const response = await fetch('/api/media/folders');
            const data = await response.json();
            setFolders(data);
            if (data.length > 0) {
                  setSelectedFolder(data[0]);
            }
      }

      useEffect(() => {
            fetchMedia();
      }, [searchTerm, selectedFolder]);

      const handleSelect = (image: any) => {
            onChange(image.id);
            setSelectedImage(image);
            setIsOpen(false);
      };

      const handleRemove = () => {
            onChange(null);
            setSelectedImage(null);
      };

      const handleUpload = (imageUrl: string) => {
            fetchMedia();
      };

      const handleDelete = async (id: number) => {
            if (confirm('Are you sure you want to delete this image?')) {
                  try {
                        const response = await fetch(`/api/media/${id}`, { method: 'DELETE' });
                        if (!response.ok) {
                              throw new Error('Failed to delete image');
                        }
                        await fetchMedia();
                        if (selectedMediaItem && selectedMediaItem.id === id) {
                              setSelectedMediaItem(null);
                        }
                  } catch (error) {
                        console.error('Error deleting image:', error);
                        alert('Failed to delete image. It may still be in use or locked. Please try again later.');
                  }
            }
      };

      return (
            <div>
                  <h3 className="text-lg font-semibold mb-2">Featured Image</h3>
                  {selectedImage ? (
                        <div className="relative">
                              <Image
                                    src={selectedImage.filePath}
                                    alt={selectedImage.fileName}
                                    width={300}
                                    height={200}
                                    className="object-cover rounded-md"
                              />
                              <Button onClick={handleRemove} className="mt-2">
                                    Remove Featured Image
                              </Button>
                        </div>
                  ) : (
                        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                              <DialogTrigger asChild>
                                    <Button onClick={() => setIsOpen(true)}>Select Featured Image</Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-[calc(100vw-160px)] w-full max-h-[calc(100vh-160px)] h-full">
                                    <Tabs defaultValue="library" className="h-full flex flex-col">
                                          <TabsList>
                                                <TabsTrigger value="library">Media Library</TabsTrigger>
                                                <TabsTrigger value="upload">Upload</TabsTrigger>
                                          </TabsList>
                                          <TabsContent value="library" className="flex-grow overflow-hidden">
                                                <div className="flex justify-between mb-4">
                                                      <div className="flex items-center space-x-2">
                                                            <Input
                                                                  type="text"
                                                                  placeholder="Search media..."
                                                                  value={searchTerm}
                                                                  onChange={(e) => setSearchTerm(e.target.value)}
                                                            />
                                                            <Select
                                                                  value={selectedFolder || ''}
                                                                  onValueChange={setSelectedFolder}>
                                                                  <SelectTrigger>
                                                                        <SelectValue placeholder="Select folder" />
                                                                  </SelectTrigger>
                                                                  <SelectContent>
                                                                        {folders.map((folder) => (
                                                                              <SelectItem key={folder} value={folder}>
                                                                                    {folder}
                                                                              </SelectItem>
                                                                        ))}
                                                                  </SelectContent>
                                                            </Select>
                                                      </div>
                                                      <div>
                                                            <Button
                                                                  variant="outline"
                                                                  onClick={() => setViewMode('grid')}>
                                                                  <Grid size={20} />
                                                            </Button>
                                                            <Button
                                                                  variant="outline"
                                                                  onClick={() => setViewMode('list')}>
                                                                  <List size={20} />
                                                            </Button>
                                                      </div>
                                                </div>
                                                <div className="flex h-full overflow-hidden">
                                                      <div
                                                            className={`${
                                                                  viewMode === 'grid'
                                                                        ? 'grid grid-cols-4 gap-4'
                                                                        : 'space-y-2'
                                                            } flex-grow overflow-y-auto pr-4`}>
                                                            {media.map((item: any) =>
                                                                  viewMode === 'grid' ? (
                                                                        <div
                                                                              key={item.id}
                                                                              className={`cursor-pointer relative ${
                                                                                    selectedMediaItem?.id === item.id
                                                                                          ? 'ring-2 ring-blue-500'
                                                                                          : ''
                                                                              }`}
                                                                              onClick={() =>
                                                                                    setSelectedMediaItem(item)
                                                                              }>
                                                                              <Image
                                                                                    src={item.filePath}
                                                                                    alt={item.fileName}
                                                                                    width={150}
                                                                                    height={150}
                                                                                    className="object-cover rounded-md"
                                                                              />
                                                                        </div>
                                                                  ) : (
                                                                        <div
                                                                              key={item.id}
                                                                              className={`flex items-center space-x-2 cursor-pointer ${
                                                                                    selectedMediaItem?.id === item.id
                                                                                          ? 'bg-blue-100'
                                                                                          : ''
                                                                              }`}
                                                                              onClick={() =>
                                                                                    setSelectedMediaItem(item)
                                                                              }>
                                                                              <Image
                                                                                    src={item.filePath}
                                                                                    alt={item.fileName}
                                                                                    width={50}
                                                                                    height={50}
                                                                                    className="object-cover rounded-md"
                                                                              />
                                                                              <span>{item.fileName}</span>
                                                                        </div>
                                                                  )
                                                            )}
                                                      </div>
                                                      {selectedMediaItem && (
                                                            <div className="w-1/3 pl-4 border-l overflow-y-auto">
                                                                  <h3 className="text-lg font-semibold mb-2">
                                                                        Image Details
                                                                  </h3>
                                                                  <Image
                                                                        src={selectedMediaItem.filePath}
                                                                        alt={selectedMediaItem.fileName}
                                                                        width={300}
                                                                        height={200}
                                                                        className="object-cover rounded-md mb-4"
                                                                  />
                                                                  <p>
                                                                        <strong>File Name:</strong>{' '}
                                                                        {selectedMediaItem.fileName}
                                                                  </p>
                                                                  <p>
                                                                        <strong>File Type:</strong>{' '}
                                                                        {selectedMediaItem.fileType}
                                                                  </p>
                                                                  <p>
                                                                        <strong>File Size:</strong>{' '}
                                                                        {(selectedMediaItem.fileSize / 1024).toFixed(2)}{' '}
                                                                        KB
                                                                  </p>
                                                                  <p>
                                                                        <strong>Uploaded At:</strong>{' '}
                                                                        {new Date(
                                                                              selectedMediaItem.createdAt
                                                                        ).toLocaleString()}
                                                                  </p>
                                                                  <div className="mt-4 space-y-2">
                                                                        <Button
                                                                              onClick={() =>
                                                                                    handleSelect(selectedMediaItem)
                                                                              }>
                                                                              Set Featured Image
                                                                        </Button>
                                                                        <Button
                                                                              variant="destructive"
                                                                              onClick={() =>
                                                                                    handleDelete(selectedMediaItem.id)
                                                                              }>
                                                                              <Trash size={16} className="mr-2" />{' '}
                                                                              Delete Image
                                                                        </Button>
                                                                  </div>
                                                            </div>
                                                      )}
                                                </div>
                                          </TabsContent>
                                          <TabsContent value="upload">
                                                <ImageUpload onImageUpload={handleUpload} onImageDelete={() => {}} />
                                          </TabsContent>
                                    </Tabs>
                              </DialogContent>
                        </Dialog>
                  )}
            </div>
      );
}
