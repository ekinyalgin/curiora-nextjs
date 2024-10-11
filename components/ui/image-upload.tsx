'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from './button';

interface ImageUploadProps {
      onImageUpload: (imageUrl: string) => void;
      onImageDelete: (imageUrl: string) => Promise<void>;
      initialImage?: string;
}

export function ImageUpload({ onImageUpload, onImageDelete, initialImage }: ImageUploadProps) {
      const [image, setImage] = useState<string | null>(initialImage || null);

      const onDrop = useCallback(
            async (acceptedFiles: File[]) => {
                  const file = acceptedFiles[0];
                  if (file) {
                        try {
                              const formData = new FormData();
                              formData.append('file', file);

                              const response = await fetch('/api/upload', {
                                    method: 'POST',
                                    body: formData,
                              });

                              if (!response.ok) {
                                    throw new Error('Failed to upload image');
                              }

                              const data = await response.json();
                              const imageUrl = data.filePath;
                              setImage(imageUrl);
                              onImageUpload(imageUrl);
                        } catch (error) {
                              console.error('Error uploading image:', error);
                              alert('Failed to upload image. Please try again.');
                        }
                  }
            },
            [onImageUpload]
      );

      const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

      const handleDelete = async () => {
            if (image) {
                  try {
                        await onImageDelete(image);
                        setImage(null);
                  } catch (error) {
                        console.error('Error deleting image:', error);
                        alert('Failed to delete image. Please try again.');
                  }
            }
      };

      return (
            <div className="space-y-4">
                  {image ? (
                        <div className="relative">
                              <Image
                                    src={image}
                                    alt="Uploaded image"
                                    width={300}
                                    height={200}
                                    className="object-cover rounded-md"
                              />
                              <Button
                                    onClick={handleDelete}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                                    <X size={16} />
                              </Button>
                        </div>
                  ) : (
                        <div
                              {...getRootProps()}
                              className={`border-2 border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer ${
                                    isDragActive ? 'border-blue-500 bg-blue-50' : ''
                              }`}>
                              <input {...getInputProps()} />
                              {isDragActive ? (
                                    <p>Drop the image here ...</p>
                              ) : (
                                    <p>Drag 'n' drop an image here, or click to select an image</p>
                              )}
                        </div>
                  )}
            </div>
      );
}
