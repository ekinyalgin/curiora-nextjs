import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
      const { searchParams } = new URL(request.url);
      const slug = searchParams.get('slug');
      const type = searchParams.get('type');
      const id = searchParams.get('id');

      if (!slug || !type) {
            return NextResponse.json({ error: 'Slug and type are required' }, { status: 400 });
      }

      try {
            let isUnique = false;

            switch (type) {
                  case 'tag':
                        const existingTag = await prisma.tag.findFirst({
                              where: {
                                    slug: slug,
                                    ...(id && { id: { not: parseInt(id) } }),
                              },
                        });
                        isUnique = !existingTag;
                        break;
                  case 'category':
                        const existingCategory = await prisma.category.findFirst({
                              where: {
                                    slug: slug,
                                    ...(id && { id: { not: parseInt(id) } }),
                              },
                        });
                        isUnique = !existingCategory;
                        break;
                  case 'post':
                        const existingPost = await prisma.post.findFirst({
                              where: {
                                    slug: slug,
                                    ...(id && { id: { not: parseInt(id) } }),
                              },
                        });
                        isUnique = !existingPost;
                        break;
                  default:
                        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
            }

            return NextResponse.json({ isUnique });
      } catch (error) {
            console.error('Error checking slug uniqueness:', error);
            return NextResponse.json({ error: 'Failed to check slug uniqueness' }, { status: 500 });
      }
}
