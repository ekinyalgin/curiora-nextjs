import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Plugin, PluginKey } from 'prosemirror-state'
import { useState } from 'react'

import { Button } from './ui/button'
import {
      Bold,
      Italic,
      List,
      ListOrdered,
      Code,
      Undo,
      Redo,
      Heading1,
      Heading2,
      Heading3,
      Pilcrow,
      Table as TableIcon,
      Link as LinkIcon,
      Merge,
      Image as ImageIcon
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { ImageSelect } from './ui/imageSelect/image-select'

// Ensure CodeBlockComponent is imported
import CodeBlockComponent from './CodeBlockComponent'

const lowlight = createLowlight(common)

// Dil seçenekleri
const languageOptions = [
      { value: 'javascript', label: 'JavaScript' },
      { value: 'typescript', label: 'TypeScript' },
      { value: 'css', label: 'CSS' },
      { value: 'html', label: 'HTML' },
      { value: 'python', label: 'Python' },
      { value: 'php', label: 'PHP' },
      { value: 'markdown', label: 'Markdown' }
]

interface EditorProps {
      content: string
      onChange: (content: string) => void
      simpleMode?: boolean
      onImageButtonClick?: () => void
}

const Editor = ({ content, onChange, simpleMode = false, onImageButtonClick }: EditorProps) => {
      const [showImageSelect, setShowImageSelect] = useState(false)

      const editor = useEditor({
            extensions: [
                  StarterKit.configure({
                        codeBlock: false
                  }),
                  Markdown.configure({
                        html: false,
                        tightLists: true,
                        bulletListMarker: '-',
                        linkify: true,
                        breaks: false,
                        transformPastedText: true
                  }),
                  CodeBlockLowlight.configure({
                        lowlight,
                        defaultLanguage: 'javascript',
                        HTMLAttributes: {
                              class: 'code-block'
                        },
                        renderHTMLElement: CodeBlockComponent
                  }),
                  Table.configure({
                        resizable: true,
                        HTMLAttributes: {
                              class: 'border-collapse table-auto w-full'
                        }
                  }),
                  TableRow,
                  TableHeader,
                  TableCell,
                  Link.configure({
                        openOnClick: false
                  }),
                  Image.configure({
                        inline: true,
                        allowBase64: true
                  }),
                  new Plugin({
                        key: new PluginKey('handlePaste'),
                        props: {
                              handlePaste: (view, event, slice) => {
                                    const text = event.clipboardData?.getData('text/plain')
                                    if (text) {
                                          if (
                                                text.includes('\n') &&
                                                !view.state.selection.$from.parent.type.name.includes('code')
                                          ) {
                                                event.preventDefault()
                                                const { tr } = view.state
                                                tr.replaceSelectionWith(
                                                      view.state.schema.nodes.paragraph.create(),
                                                      false
                                                )
                                                tr.insertText(text)
                                                view.dispatch(tr)
                                                return true
                                          }
                                    }
                                    return false
                              }
                        }
                  })
            ],
            content,
            onUpdate: ({ editor }) => {
                  const markdown = editor.storage.markdown.getMarkdown()
                  onChange(markdown)
            },
            editorProps: {
                  handlePaste: (view, event, slice) => {
                        const clipboardData = event.clipboardData?.getData('text/plain')
                        if (clipboardData) {
                              event.preventDefault()
                              const { schema, selection } = view.state
                              const { $from } = selection
                              const node = $from.parent

                              if (node.type.name === 'codeBlock') {
                                    view.dispatch(view.state.tr.insertText(clipboardData))
                              } else {
                                    const lines = clipboardData.split('\n')
                                    const fragment = view.state.schema.nodes.doc.create(
                                          null,
                                          lines.map((line) => schema.nodes.paragraph.create(null, schema.text(line)))
                                    )

                                    view.dispatch(view.state.tr.replaceSelectionWith(fragment))
                              }
                              return true
                        }
                        return false
                  }
            }
      })

      if (!editor) {
            return null
      }

      const handleButtonClick = (action: () => boolean) => (e: React.MouseEvent) => {
            e.preventDefault()
            action()
      }

      const addLink = () => {
            const url = window.prompt('URL')
            if (url) {
                  editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
            }
      }

      const addCodeBlock = (language: string) => {
            editor.chain().focus().toggleCodeBlock({ language }).run()
      }

      const mergeCodeBlocks = () => {
            if (editor) {
                  const { from, to } = editor.state.selection
                  const mergedContent = editor.state.doc.textBetween(from, to, '\n')
                  editor.chain().focus().deleteSelection().insertContentAt(from, mergedContent).run()
            }
      }

      const handleImageSelect = (image: { filePath: string; id: number }) => {
            editor?.chain().focus().setImage({ src: image.filePath }).run()
            setShowImageSelect(false)
      }

      return (
            <div className="bg-white border border-gray-200 rounded px-2 py-2">
                  {!simpleMode && (
                        <div className="flex flex-wrap items-center space-x-1 mb-2 [&>Button]:py-1 [&>Button]:px-2 ">
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
                                    onClick={handleButtonClick(() => editor.chain().focus().setParagraph().run())}
                                    className={`hover:bg-gray-200 rounded-full transition ${editor.isActive('paragraph') ? 'bg-gray-200' : ''}`}
                              >
                                    <Pilcrow className="w-4" />
                              </Button>
                              <Button
                                    type="button"
                                    variant="none"
                                    size="sm"
                                    onClick={handleButtonClick(() =>
                                          editor.chain().focus().toggleHeading({ level: 1 }).run()
                                    )}
                                    className={`hover:bg-gray-200 rounded-full transition ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
                              >
                                    <Heading1 className="w-4" />
                              </Button>
                              <Button
                                    type="button"
                                    variant="none"
                                    size="sm"
                                    onClick={handleButtonClick(() =>
                                          editor.chain().focus().toggleHeading({ level: 2 }).run()
                                    )}
                                    className={`hover:bg-gray-200 rounded-full transition ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
                              >
                                    <Heading2 className="w-4" />
                              </Button>
                              <Button
                                    type="button"
                                    variant="none"
                                    size="sm"
                                    onClick={handleButtonClick(() =>
                                          editor.chain().focus().toggleHeading({ level: 3 }).run()
                                    )}
                                    className={`hover:bg-gray-200 rounded-full transition ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
                              >
                                    <Heading3 className="w-4" />
                              </Button>
                              <Button
                                    type="button"
                                    variant="none"
                                    size="sm"
                                    onClick={handleButtonClick(() => editor.chain().focus().toggleBulletList().run())}
                                    className={`hover:bg-gray-200 rounded-full transition ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
                              >
                                    <List className="w-4" />
                              </Button>
                              <Button
                                    type="button"
                                    variant="none"
                                    size="sm"
                                    onClick={handleButtonClick(() => editor.chain().focus().toggleOrderedList().run())}
                                    className={`hover:bg-gray-200 rounded-full transition ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
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
                              <Select onValueChange={addCodeBlock}>
                                    <SelectTrigger className="text-xs h-8 px-2 w-[120px]">
                                          <SelectValue placeholder="Language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                          {languageOptions.map((lang) => (
                                                <SelectItem key={lang.value} value={lang.value}>
                                                      {lang.label}
                                                </SelectItem>
                                          ))}
                                    </SelectContent>
                              </Select>
                              <Button
                                    type="button"
                                    variant="none"
                                    size="sm"
                                    onClick={handleButtonClick(() => editor.chain().focus().toggleCode().run())}
                                    className={`hover:bg-gray-200 rounded-full transition ${editor.isActive('code') ? 'bg-gray-200' : ''}`}
                              >
                                    <Code className="w-4" />
                              </Button>

                              <Button
                                    type="button"
                                    variant="none"
                                    size="sm"
                                    onClick={handleButtonClick(() =>
                                          editor
                                                .chain()
                                                .focus()
                                                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                                                .run()
                                    )}
                                    className="hover:bg-gray-200 rounded-full transition"
                              >
                                    <TableIcon className="w-4" />
                              </Button>
                              <Button
                                    type="button"
                                    variant="none"
                                    size="sm"
                                    onClick={handleButtonClick(() => editor.chain().focus().undo().run())}
                                    disabled={!editor.can().undo()}
                                    className="hover:bg-gray-200 rounded-full transition"
                              >
                                    <Undo className="w-4" />
                              </Button>
                              <Button
                                    type="button"
                                    variant="none"
                                    size="sm"
                                    onClick={handleButtonClick(() => editor.chain().focus().redo().run())}
                                    disabled={!editor.can().redo()}
                                    className="hover:bg-gray-200 rounded-full transition"
                              >
                                    <Redo className="w-4" />
                              </Button>
                              <Button
                                    type="button"
                                    variant="none"
                                    size="sm"
                                    onClick={addLink}
                                    className={`hover:bg-gray-200 rounded-full transition ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
                              >
                                    <LinkIcon className="w-4" />
                              </Button>
                              <Button
                                    type="button"
                                    variant="none"
                                    size="sm"
                                    onClick={mergeCodeBlocks}
                                    className="hover:bg-gray-200 rounded-full transition"
                              >
                                    <Merge className="w-4" />
                              </Button>
                              <Button
                                    type="button"
                                    variant="none"
                                    size="sm"
                                    onClick={() => setShowImageSelect(true)}
                                    className="hover:bg-gray-200 rounded-full transition"
                              >
                                    <ImageIcon className="w-4" />
                              </Button>
                        </div>
                  )}
                  {simpleMode && (
                        <div className="flex flex-wrap items-center space-x-1 mb-2 [&>Button]:py-1 [&>Button]:px-2 ">
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
                        </div>
                  )}
                  <style jsx global>{`
                        .ProseMirror-focused {
                              outline: none !important;
                              border: none !important;
                              box-shadow: none !important;
                        }
                        .prose p {
                              margin-bottom: 1rem;
                              line-height: 24px;
                        }
                        .ProseMirror table {
                              border-collapse: collapse;
                              margin: 0;
                              overflow: hidden;
                              table-layout: fixed;
                              width: 100%;
                        }
                        .ProseMirror table td,
                        .ProseMirror table th {
                              border: 2px solid #ced4da;
                              box-sizing: border-box;
                              min-width: 1em;
                              padding: 3px 5px;
                              position: relative;
                              vertical-align: top;
                        }
                        .ProseMirror table th {
                              background-color: #f1f3f5;
                              font-weight: bold;
                              text-align: left;
                        }
                        pre {
                              background-color: #f4f4f4;
                              border-radius: 0.3em;
                              padding: 0.5em;
                              overflow-x: auto;
                        }
                        code {
                              font-family: 'Fira Code', monospace;
                              font-size: 0.9em;
                        }
                        .prose li p {
                              margin: 0;
                              padding: 0;
                        }
                        .hljs-comment,
                        .hljs-quote {
                              color: #998;
                              font-style: italic;
                        }
                        .hljs-keyword,
                        .hljs-selector-tag,
                        .hljs-subst {
                              color: #333;
                              font-weight: bold;
                        }
                        .hljs-number,
                        .hljs-literal,
                        .hljs-variable,
                        .hljs-template-variable,
                        .hljs-tag .hljs-attr {
                              color: #008080;
                        }
                        .hljs-string,
                        .hljs-doctag {
                              color: #d14;
                        }
                        .hljs-title,
                        .hljs-section,
                        .hljs-selector-id {
                              color: #900;
                              font-weight: bold;
                        }
                        .hljs-subst {
                              font-weight: normal;
                        }
                        .hljs-type,
                        .hljs-class .hljs-title {
                              color: #458;
                              font-weight: bold;
                        }
                        .hljs-tag,
                        .hljs-name,
                        .hljs-attribute {
                              color: #000080;
                              font-weight: normal;
                        }
                        .hljs-regexp,
                        .hljs-link {
                              color: #009926;
                        }
                        .hljs-symbol,
                        .hljs-bullet {
                              color: #990073;
                        }
                        .hljs-built_in,
                        .hljs-builtin-name {
                              color: #0086b3;
                        }
                        .hljs-meta {
                              color: #999;
                              font-weight: bold;
                        }
                        .hljs-deletion {
                              background: #fdd;
                        }
                        .hljs-addition {
                              background: #dfd;
                        }
                        .hljs-emphasis {
                              font-style: italic;
                        }
                        .hljs-strong {
                              font-weight: bold;
                        }
                        code {
                              background-color: rgb(243 244 246);
                        }
                        code:before,
                        code:after {
                              display: none;
                        }
                  `}</style>
                  <EditorContent editor={editor} className="prose max-w-none focus:outline-none px-2" />
                  {showImageSelect && (
                        <ImageSelect
                              onSelect={handleImageSelect}
                              onClose={() => setShowImageSelect(false)}
                              isOpen={showImageSelect}
                        />
                  )}
            </div>
      )
}

export default Editor
