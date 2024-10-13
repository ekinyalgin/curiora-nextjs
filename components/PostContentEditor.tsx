import React, { useRef, useState, useEffect, useCallback } from 'react'

interface PostContentEditorProps {
      value: string
      onChange: (value: string) => void
      placeholder?: string
}

export function PostContentEditor({ value, onChange, placeholder }: PostContentEditorProps) {
      const editorRef = useRef<HTMLDivElement>(null)
      const [isComposing, setIsComposing] = useState(false)

      const saveSelection = useCallback(() => {
            const selection = window.getSelection()
            if (selection && selection.rangeCount > 0) {
                  return selection.getRangeAt(0).cloneRange()
            }
            return null
      }, [])

      const restoreSelection = useCallback((range: Range | null) => {
            const selection = window.getSelection()
            if (range && selection) {
                  selection.removeAllRanges()
                  selection.addRange(range)
            }
      }, [])

      const toggleStyle = useCallback(
            (e: React.MouseEvent, tag: string) => {
                  e.preventDefault()

                  const range = saveSelection() // Seçimi kaydet
                  if (!range) return

                  const selectedContent = range.extractContents() // Seçili alanı çıkar
                  const wrapper = document.createElement(tag) // Yeni etiket oluştur

                  let applyNewStyle = true

                  // Stil var mı kontrol et
                  Array.from(selectedContent.childNodes).forEach((node) => {
                        if ((node as HTMLElement).tagName?.toLowerCase() === tag) {
                              applyNewStyle = false // Stil zaten varsa kaldır
                              range.insertNode(document.createTextNode(node.textContent || '')) // Düz metin ekle
                        } else {
                              wrapper.appendChild(node) // Stil eklenmemişse, node'u sar
                        }
                  })

                  if (applyNewStyle) {
                        range.insertNode(wrapper) // Yeni etiketli içeriği ekle
                  }

                  restoreSelection(range) // Seçimi geri yükle
                  if (editorRef.current) {
                        onChange(editorRef.current.innerHTML) // İçeriği güncelle
                  }
            },
            [onChange, saveSelection, restoreSelection]
      )

      useEffect(() => {
            if (editorRef.current && editorRef.current.innerHTML !== value) {
                  editorRef.current.innerHTML = value // DOM'u senkronize et
            }
      }, [value])

      const handleInput = useCallback(() => {
            if (editorRef.current && !isComposing) {
                  const newValue = editorRef.current.innerHTML
                  onChange(newValue) // React state'i güncelle
            }
      }, [onChange, isComposing])

      return (
            <div className="bg-white text-black border border-gray-200 rounded">
                  <div className="flex text-gray-500 h-6 items-center  w-full mt-4 mx-2">
                        {/* Bold Button */}
                        <button
                              type="button"
                              className="flex items-center w-6 hover:bg-gray-200 transition rounded-full"
                              onMouseDown={(e) => toggleStyle(e, 'b')}
                        >
                              <span className="font-bold text-base mx-auto ">B</span>
                        </button>

                        {/* Italic Button */}
                        <button
                              type="button"
                              className="flex items-center w-6 hover:bg-gray-200 transition rounded-full"
                              onMouseDown={(e) => toggleStyle(e, 'i')}
                        >
                              <span className="italic font-bold text-base mx-auto ">i</span>
                        </button>
                  </div>

                  {/* Editable Content */}
                  <div
                        ref={editorRef}
                        contentEditable={true}
                        className="min-h-[200px] p-3 rounded-md focus:outline-none bg-white focus:ring-0 "
                        onInput={handleInput}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => {
                              setIsComposing(false)
                              handleInput()
                        }}
                        placeholder={placeholder}
                  />
            </div>
      )
}
