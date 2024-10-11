import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export async function GET() {
      const tags = await prisma.tag.findMany({
            include: { language: true },
      });
      return NextResponse.json(tags);
}

export async function POST(request: Request) {
      try {
            const body = await request.json();
            let { name, slug, description, language_id } = body;

            console.log('Received data:', { name, slug, description, language_id });

            if (!slug) {
                  slug = slugify(name, { lower: true, strict: true });
            }

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
