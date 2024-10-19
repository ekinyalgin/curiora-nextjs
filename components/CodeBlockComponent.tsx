import React, { useEffect, useState } from 'react'
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism'

const CodeBlockComponent: React.FC<NodeViewProps> = ({ node, updateAttributes }) => {
      const [language, setLanguage] = useState(node.attrs.language || 'javascript')
      const [content, setContent] = useState(node.textContent || '')

      useEffect(() => {
            setContent(node.textContent || '')
      }, [node.textContent])

      const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            const newLanguage = e.target.value
            setLanguage(newLanguage)
            updateAttributes({ language: newLanguage })
      }

      return (
            <NodeViewWrapper className="code-block">
                  <select
                        contentEditable={false}
                        value={language}
                        onChange={handleLanguageChange}
                        className="mb-2 p-1 text-sm"
                  >
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="css">CSS</option>
                        <option value="html">HTML</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="csharp">C#</option>
                        <option value="php">PHP</option>
                        <option value="ruby">Ruby</option>
                        <option value="go">Go</option>
                        <option value="rust">Rust</option>
                        <option value="swift">Swift</option>
                        <option value="kotlin">Kotlin</option>
                        <option value="sql">SQL</option>
                  </select>
                  <SyntaxHighlighter language={language} style={tomorrow} PreTag="div" className="text-sm">
                        {content}
                  </SyntaxHighlighter>
                  <NodeViewContent as="pre" className="hidden" />
            </NodeViewWrapper>
      )
}

export default CodeBlockComponent
