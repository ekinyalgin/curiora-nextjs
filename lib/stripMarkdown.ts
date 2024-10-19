export function stripMarkdown(markdown: string): string {
      // Remove bold and italic
      let stripped = markdown.replace(/(\*\*|__)(.*?)\1/g, '$2').replace(/(\*|_)(.*?)\1/g, '$2')

      // Remove links
      stripped = stripped.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')

      // Remove headers
      stripped = stripped.replace(/^#+\s+/gm, '')

      // Remove blockquotes
      stripped = stripped.replace(/^>\s+/gm, '')

      // Remove code blocks
      stripped = stripped.replace(/```[\s\S]*?```/g, '')

      // Remove inline code
      stripped = stripped.replace(/`([^`]+)`/g, '$1')

      return stripped.trim()
}
