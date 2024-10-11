import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export async function GET(request: Request) {
      const { searchParams } = new URL(request.url);
      const search = searchParams.get('search');
      const searchType = searchParams.get('searchType') || 'name';

      let categories;
      if (search) {
            const whereClause =
                  searchType === 'name'
                        ? {
                                OR: [
                                      { name: { contains: search } },
                                      { slug: { contains: search } },
                                      { description: { contains: search } },
                                ],
                          }
                        : { language: { id: parseInt(search) } };

            categories = await prisma.category.findMany({
                  where: whereClause,
                  include: { language: true, parent: true, children: true },
            });

            // Eğer bir child kategori bulunduysa, parent'ını da ekleyelim
            const parentIds = categories.map((c) => c.parentId).filter((id) => id !== null);
            const parents = await prisma.category.findMany({
                  where: { id: { in: parentIds } },
                  include: { language: true, parent: true, children: true },
            });

            categories = [...categories, ...parents];
      } else {
            categories = await prisma.category.findMany({
                  include: { language: true, parent: true, children: true },
            });
      }

      // Duplicate'leri kaldıralım
      categories = Array.from(new Set(categories.map((c) => c.id))).map((id) => {
            return categories.find((c) => c.id === id);
      });

      return NextResponse.json(categories);
}

export async function POST(request: Request) {
      try {
            const body = await request.json();
            let { name, slug, description, languageId, parentId, seoDescription, seoTitle } = body;

            if (!slug) {
                  slug = slugify(name, { lower: true, strict: true });
            }

            const category = await prisma.category.create({
                  data: {
                        name,
                        slug,
                        description,
                        languageId: languageId ? parseInt(languageId) : null,
                        parentId: parentId ? parseInt(parentId) : null,
                        seoDescription,
                        seoTitle,
                  },
                  include: { language: true, parent: true },
            });

            return NextResponse.json(category, { status: 201 });
      } catch (error) {
            console.error('Error creating category:', error);
            return NextResponse.json({ error: 'Failed to create category', details: error.message }, { status: 500 });
      }
}
