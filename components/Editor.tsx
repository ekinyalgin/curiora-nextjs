import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'

import { Button } from './ui/button'
import { Bold, Italic, List, ListOrdered, Code } from 'lucide-react'

interface EditorProps {
      content: string
      onChange: (content: string) => void
}

const Editor = ({ content, onChange }: EditorProps) => {
      const editor = useEditor({
            extensions: [
                  StarterKit,
                  Markdown.configure({
                        html: false,
                        tightLists: true,
                        bulletListMarker: '-',
                        linkify: true
                  })
            ],
            content,
            onUpdate: ({ editor }) => {
                  const markdown = editor.storage.markdown.getMarkdown()
                  onChange(markdown)
            }
      })

      if (!editor) {
            return null
      }

      const handleButtonClick = (action: () => boolean) => (e: React.MouseEvent) => {
            e.preventDefault()
            action()
      }

      return (
            <div className="bg-white border border-gray-200 rounded px-2 py-2">
                  <div className="flex items-center space-x-1 mb-2 [&>Button]:py-1 [&>Button]:px-2 ">
                        <Button
                              type="button"
                              variant="none"
                              size="sm"
                              onClick={handleButtonClick(() => editor.chain().focus().toggleBold().run())}
                              className={`hover:bg-gray-200 rounded-full transition ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
                        >
                              <Bold strokeWidth="3" className="w-4" />
                        </Button>
                        <Button
                              type="button"
                              variant="none"
                              size="sm"
                              onClick={handleButtonClick(() => editor.chain().focus().toggleItalic().run())}
                              className={`hover:bg-gray-200 rounded-full transition ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
                        >
                              <Italic className="w-4" />
                        </Button>
                        <Button
                              type="button"
                              variant="none"
                              size="sm"
                              onClick={handleButtonClick(() => editor.chain().focus().toggleBulletList().run())}
                              className={`hover:bg-gray-200 rounded-full transition${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
                        >
                              <List className="w-4" />
                        </Button>
                        <Button
                              type="button"
                              variant="none"
                              size="sm"
                              onClick={handleButtonClick(() => editor.chain().focus().toggleOrderedList().run())}
                              className={`hover:bg-gray-200 rounded-full transition${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
                        >
                              <ListOrdered className="w-4" />
                        </Button>
                        <Button
                              type="button"
                              variant="none"
                              size="sm"
                              onClick={handleButtonClick(() => editor.chain().focus().toggleCodeBlock().run())}
                              className={`hover:bg-gray-200 rounded-full transition ${editor.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
                        >
                              <Code className="w-4" />
                        </Button>
                  </div>
                  <style jsx global>{`
                        .ProseMirror-focused {
                              outline: none !important;
                              border: none !important;
                              box-shadow: none !important;
                        }
                        .prose p {
                              margin-top: 0;
                              margin-bottom: 1rem;
                              line-height: 24px;
                        }
                  `}</style>
                  <EditorContent editor={editor} className="prose max-w-none focus:outline-none px-2" />
            </div>
      )
}

export default Editor
