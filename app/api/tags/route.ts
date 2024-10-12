import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSlug } from '@/components/ui/slug-input';

export async function GET() {
      const tags = await prisma.tag.findMany({
            include: { language: true },
      });
      return NextResponse.json(tags);
}

async function generateUniqueSlug(baseSlug: string): Promise<string> {
      let slug = baseSlug;
      let counter = 1;
      let isUnique = false;

      while (!isUnique) {
            const existingTag = await prisma.tag.findUnique({ where: { slug } });
            if (!existingTag) {
                  isUnique = true;
            } else {
                  slug = `${baseSlug}-${counter}`;
                  counter++;
            }
      }

      return slug;
}

export async function POST(request: Request) {
      try {
            const body = await request.json();
            let { name, slug, description, language_id } = body;

            console.log('Received data:', { name, slug, description, language_id });

            if (!slug) {
                  slug = createSlug(name);
            }

            // Slug'ın benzersizliğini kontrol et ve gerekirse sonuna numara ekle
            slug = await generateUniqueSlug(slug);

            const tag = await prisma.tag.create({
                  data: {
                        name,
                        slug,
                        description,
                        language_id: language_id ? parseInt(language_id) : null,
                  },
                  include: { language: true },
            });

            console.log('Created tag:', tag);

            return NextResponse.json(tag, { status: 201 });
      } catch (error) {
            console.error('Error creating tag:', error);
            return NextResponse.json({ error: 'Failed to create tag', details: error.message }, { status: 500 });
      }
}
