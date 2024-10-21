import fs from 'fs/promises'
import path from 'path'
import { XMLBuilder } from 'fast-xml-parser'
import prisma from '../../lib/prisma' // Prisma client'ınızı import edin

const SITEMAP_DIR = path.join(process.cwd(), 'public')

export default async function handler(req, res) {
      if (req.method !== 'POST') {
            return res.status(405).json({ message: 'Method Not Allowed' })
      }

      try {
            // Tüm içeriği çek
            const posts = await fetchPosts()
            const categories = await fetchCategories()
            const tags = await fetchTags()

            // Alt sitemapları oluştur
            await generateSitemap('post', posts)
            await generateSitemap('category', categories)
            await generateSitemap('tag', tags)

            // Ana sitemap.xml dosyasını oluştur
            await generateMainSitemap()

            res.status(200).json({ message: 'Sitemaps generated successfully' })
      } catch (error) {
            console.error('Error generating sitemaps:', error)
            res.status(500).json({ message: 'Failed to generate sitemaps' })
      }
}

async function generateSitemap(type, items) {
      const sitemapPath = path.join(SITEMAP_DIR, `${type}-sitemap.xml`)
      const urls = items.map((item) => ({
            loc: `${process.env.SITE_URL}/${type}/${item.slug}`,
            lastmod: item.updatedAt,
            changefreq: 'daily',
            priority: 0.7
      }))

      const sitemapObj = {
            urlset: {
                  '@_xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
                  url: urls
            }
      }

      const builder = new XMLBuilder({ format: true })
      const xml = builder.build(sitemapObj)

      await fs.writeFile(sitemapPath, xml)
}

async function generateMainSitemap() {
      const mainSitemapPath = path.join(SITEMAP_DIR, 'sitemap.xml')
      const sitemaps = ['post', 'category', 'tag'].map((type) => ({
            loc: `${process.env.SITE_URL}/${type}-sitemap.xml`,
            lastmod: new Date().toISOString()
      }))

      const mainSitemapObj = {
            sitemapindex: {
                  '@_xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
                  sitemap: sitemaps
            }
      }

      const builder = new XMLBuilder({ format: true })
      const xml = builder.build(mainSitemapObj)

      await fs.writeFile(mainSitemapPath, xml)
}

async function fetchPosts() {
      return await prisma.post.findMany({
            select: {
                  slug: true,
                  updatedAt: true
            }
      })
}

async function fetchCategories() {
      return await prisma.category.findMany({
            select: {
                  slug: true,
                  updatedAt: true
            }
      })
}

async function fetchTags() {
      return await prisma.tag.findMany({
            select: {
                  slug: true,
                  updatedAt: true
            }
      })
}

// fetchPosts, fetchCategories, fetchTags fonksiyonlarını uygulamanıza göre implement edin
