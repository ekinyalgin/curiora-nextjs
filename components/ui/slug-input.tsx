'use client'
import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'

interface SlugInputProps {
      name: string
      value: string
      onChange: (name: string, value: string) => void
      sourceValue: string
      placeholder?: string
      autoGenerate?: boolean
}

export function createSlug(text: string): string {
      // Türkçe karakterleri İngilizce karşılıklarına çevir
      const turkishToEnglish = text
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/Ğ/g, 'g')
            .replace(/Ü/g, 'u')
            .replace(/Ş/g, 's')
            .replace(/İ/g, 'i')
            .replace(/Ö/g, 'o')
            .replace(/Ç/g, 'c')

      // Küçük harfe çevir ve istenmeyen karakterleri temizleyerek slug oluştur
      return turkishToEnglish
            .toLowerCase()
            .replace(/[^\w\s-]+/g, '') // Alfasayısal, boşluk ve tire dışındaki karakterleri kaldır
            .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
            .replace(/\-\-+/g, '-') // Birden fazla tireyi tek bir tireye indir
            .replace(/^-+/, '') // Başındaki tireyi kaldır
            .replace(/-+$/, '') // Sonundaki tireyi kaldır
            .substring(0, 100) // Maksimum 100 karakterle sınırla
}

export function SlugInput({ name, value, onChange, sourceValue, placeholder, autoGenerate = false }: SlugInputProps) {
      const [isManuallyEdited, setIsManuallyEdited] = useState(false)

      useEffect(() => {
            if (autoGenerate && !isManuallyEdited && !value && sourceValue) {
                  const baseSlug = createSlug(sourceValue)
                  onChange(name, baseSlug)
            }
      }, [sourceValue, isManuallyEdited, value, name, onChange, autoGenerate])

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value
            setIsManuallyEdited(true)
            onChange(name, newValue)
      }

      const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            const processedValue = createSlug(e.target.value)
            onChange(name, processedValue)
      }

      return (
            <Input
                  name={name}
                  value={value}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={placeholder || 'Enter slug or leave empty to generate automatically'}
            />
      )
}
