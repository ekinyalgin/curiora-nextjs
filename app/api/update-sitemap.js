import fs from 'fs/promises'
import path from 'path'
import { XMLBuilder, XMLParser } from 'fast-xml-parser'
import axios from 'axios'

const SITEMAP_DIR = path.join(process.cwd(), 'public')

export default async function handler(req, res) {
      if (req.method !== 'POST') {
            return res.status(405).json({ message: 'Method Not Allowed' })
      }

      try {
            const { action, contentType, slug, lastmod } = req.body
            const sitemapPath = path.join(SITEMAP_DIR, `${contentType}-sitemap.xml`)

            let sitemapContent = await fs.readFile(sitemapPath, 'utf-8')
            let sitemapObj = parseXml(sitemapContent)

            updateSitemap(sitemapObj, action, contentType, slug, lastmod)

            const builder = new XMLBuilder({ format: true })
            const updatedXml = builder.build(sitemapObj)

            await fs.writeFile(sitemapPath, updatedXml)

            // Arama motorlarına bildirim gönder
            await notifySearchEngines(`${process.env.SITE_URL}/${contentType}-sitemap.xml`)

            res.status(200).json({ message: 'Sitemap updated successfully' })
      } catch (error) {
            console.error('Error updating sitemap:', error)
            res.status(500).json({ message: 'Failed to update sitemap' })
      }
}

function parseXml(xml) {
      const parser = new XMLParser()
      return parser.parse(xml)
}

function updateSitemap(sitemapObj, action, contentType, slug, lastmod) {
      const url = `${process.env.SITE_URL}/${contentType}/${slug}`

      if (action === 'add' || action === 'update') {
            const existingUrlIndex = sitemapObj.urlset.url.findIndex((u) => u.loc === url)
            if (existingUrlIndex > -1) {
                  sitemapObj.urlset.url[existingUrlIndex].lastmod = lastmod
            } else {
                  sitemapObj.urlset.url.push({
                        loc: url,
                        lastmod: lastmod,
                        changefreq: 'daily',
                        priority: 0.7
                  })
            }
      } else if (action === 'delete') {
            sitemapObj.urlset.url = sitemapObj.urlset.url.filter((u) => u.loc !== url)
      }
}

async function notifySearchEngines(sitemapUrl) {
      const engines = [
            `http://www.google.com/webmasters/sitemaps/ping?sitemap=${sitemapUrl}`,
            `http://www.bing.com/ping?sitemap=${sitemapUrl}`
      ]

      await Promise.all(engines.map((engine) => axios.get(engine)))
}
