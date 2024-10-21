import { generateSitemaps } from 'next-sitemap'
import axios from 'axios'

export default async function handler(req, res) {
      if (req.method === 'POST') {
            try {
                  // Regenerate sitemaps
                  await generateSitemaps()

                  // Notify search engines
                  /*const sitemapUrl = 'https://your-site-url.com/sitemap.xml'
                  await Promise.all([
                        axios.get(`http://www.google.com/ping?sitemap=${sitemapUrl}`),
                        axios.get(`http://www.bing.com/ping?sitemap=${sitemapUrl}`)
                  ])*/

                  res.status(200).json({ message: 'Sitemaps regenerated and search engines notified' })
            } catch (error) {
                  console.error('Error regenerating sitemaps:', error)
                  res.status(500).json({ error: 'Failed to regenerate sitemaps' })
            }
      } else {
            res.setHeader('Allow', ['POST'])
            res.status(405).end(`Method ${req.method} Not Allowed`)
      }
}
