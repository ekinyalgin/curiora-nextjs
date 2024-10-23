import Link from 'next/link'
import { routes } from '@/lib/routes'
import Script from 'next/script'

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
  const breadcrumbList = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": routes.home
    },
    ...items
      .filter(item => item.label !== 'Tags' && item.label !== 'Categories' && item.label !== 'Posts')
      .map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        "item": `${routes.home}${item.href}`
      }))
  ]

  if (currentCategory) {
    breadcrumbList.push({
      "@type": "ListItem",
      "position": breadcrumbList.length + 1,
      "name": currentCategory.label,
      "item": `${routes.home}${currentCategory.href}`
    })
  }

  if (currentPost) {
    breadcrumbList.push({
      "@type": "ListItem",
      "position": breadcrumbList.length + 1,
      "name": currentPost.title,
      "item": `${routes.home}${items[items.length - 1].href}`
    })
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbList
  }

  return (
    <>
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <nav className="text-sm breadcrumbs mb-4">
        <ul className='flex items-center'>
          <li>
            <Link className='hover:underline' href="/">Home</Link>
          </li>
          {items.map((item, index) => (
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

          {currentCategory && (
            <>
              <span className='mx-2'>→</span>
              <li>
                <Link className='hover:underline' href={currentCategory.href}>{currentCategory.label}</Link>
              </li>
            </>
          )}

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
    </>
  )
}

export default Breadcrumb
