'use client';

import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Language {
      id: number;
      code: string;
      name: string;
}

interface LanguageSelectProps {
      value: string;
      onChange: (value: string) => void;
}

export function LanguageSelect({ value, onChange }: LanguageSelectProps) {
      const [languages, setLanguages] = useState<Language[]>([]);

      useEffect(() => {
            async function fetchLanguages() {
                  const response = await fetch('/api/languages');
                  const data = await response.json();
                  setLanguages(data);
            }
            fetchLanguages();
      }, []);

      return (
            <Select value={value} onValueChange={onChange}>
                  <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                        {languages.map((lang) => (
                              <SelectItem key={lang.id} value={lang.id.toString()}>
                                    {lang.name}
                              </SelectItem>
                        ))}
                  </SelectContent>
            </Select>
      );
}
