import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  currentCategory?: BreadcrumbItem
  currentPost?: {
    title: string
  }
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, currentCategory, currentPost }) => {
  return (
    <nav className="text-sm breadcrumbs mb-4">
      <ul className='flex items-center'>
        <li>
          <Link className='hover:underline' href="/">Home</Link>
        </li>
        {items.map((item, index) => (
          // "Tags", "Categories" ve "Posts" öğelerini gizlemek için koşullu render
          item.label !== 'Tags' && item.label !== 'Categories' && item.label !== 'Posts' && (
            <li key={index} className='flex items-center'>
              {index !== 0 && <span className='mx-2'>→</span>}
              {index === items.length - 1 ? (
                <span>{item.label}</span>
              ) : (
                <Link className='hover:underline' href={item.href}>{item.label}</Link>
              )}
            </li>
          )
        ))}

        {/* Eğer post sayfasındaysak ve kategori mevcutsa, kategoriyi ekliyoruz */}
        {currentCategory && (
          <>
            <span className='mx-2'>→</span>
            <li>
              <Link className='hover:underline' href={currentCategory.href}>{currentCategory.label}</Link>
            </li>
          </>
        )}

        {/* Post başlığını ekleyelim */}
        {currentPost && (
          <>
            <span className='mx-2'>→</span>
            <li>
              <span>{currentPost.title}</span>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}

export default Breadcrumb
