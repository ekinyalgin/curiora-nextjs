const siteUrl = 'http://localhost:3000'

const fetchPosts = async () => {
      // API'den veya veritabanından postları çekin
      // Örnek: return await fetch('your-api-url/posts').then(res => res.json());
}

const fetchCategories = async () => {
      // API'den veya veritabanından kategorileri çekin
}

const fetchTags = async () => {
      // API'den veya veritabanından etiketleri çekin
}

module.exports = {
      siteUrl,
      generateRobotsTxt: true,
      sitemapSize: 5000, // Limit the number of URLs per sitemap file
      exclude: ['/admin/*', '/private/*'], // Add any paths you want to exclude
      robotsTxtOptions: {
            additionalSitemaps: [
                  `${siteUrl}/sitemap.xml`,
                  `${siteUrl}/post-sitemap.xml`,
                  `${siteUrl}/category-sitemap.xml`,
                  `${siteUrl}/tag-sitemap.xml`
            ]
      },
      // Ana sitemap.xml dosyasını oluştur
      generateIndexSitemap: true,
      // Alt sitemapları oluştur
      additionalPaths: async (config) => {
            const result = []

            const posts = await fetchPosts()
            const categories = await fetchCategories()
            const tags = await fetchTags()

            // Add posts to post-sitemap.xml
            posts.forEach((post) => {
                  result.push({
                        loc: `/post/${post.slug}`,
                        lastmod: post.updatedAt,
                        priority: 0.8
                  })
            })

            // Add categories to category-sitemap.xml
            categories.forEach((category) => {
                  result.push({
                        loc: `/category/${category.slug}`,
                        lastmod: category.updatedAt,
                        priority: 0.6
                  })
            })

            // Add tags to tag-sitemap.xml
            tags.forEach((tag) => {
                  result.push({
                        loc: `/tag/${tag.slug}`,
                        lastmod: tag.updatedAt,
                        priority: 0.5
                  })
            })

            return result
      }
}
