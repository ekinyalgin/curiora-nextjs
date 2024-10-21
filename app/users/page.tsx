import { redirect } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
      title: 'Community Members | Your Blog Name',
      description: 'Explore our diverse community of writers, thinkers, and creators on Your Blog Name.',
      openGraph: {
            title: 'Community Members | Your Blog Name',
            description: 'Explore our diverse community of writers, thinkers, and creators on Your Blog Name.',
            url: 'https://yourblog.com/users',
            siteName: 'Your Blog Name',
            type: 'website',
            images: [
                  {
                        url: 'https://yourblog.com/images/community-og.jpg', // Topluluk sayfanız için özel bir OG görüntüsü ekleyin
                        width: 1200,
                        height: 630,
                        alt: 'Your Blog Name Community'
                  }
            ]
      },
      twitter: {
            card: 'summary_large_image',
            title: 'Community Members | Your Blog Name',
            description: 'Explore our diverse community of writers, thinkers, and creators on Your Blog Name.',
            creator: '@yourtwitterhandle',
            images: ['https://yourblog.com/images/community-og.jpg'] // Twitter için de aynı görüntüyü kullanabilirsiniz
      }
}

export default function UsersPage() {
      redirect('/users/settings')
}
