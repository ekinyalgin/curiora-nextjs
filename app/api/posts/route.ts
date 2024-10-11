import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
      const { searchParams } = new URL(request.url);
      const search = searchParams.get('search');

      let posts;
      if (search) {
            posts = await prisma.post.findMany({
                  where: {
                        OR: [{ title: { contains: search } }, { content: { contains: search } }],
                  },
                  include: { user: true, category: true, language: true },
            });
      } else {
            posts = await prisma.post.findMany({
                  include: { user: true, category: true, language: true },
            });
      }

      return NextResponse.json(posts);
}

export async function POST(request: Request) {
      try {
            const body = await request.json();
            const { user, category, language, ...postData } = body;

            if (!user || !category || !language) {
                  return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
            }

            const post = await prisma.post.create({
                  data: {
                        ...postData,
                        userId: user.id, // Burada değişiklik yaptık
                        categoryId: parseInt(category.id),
                        languageId: parseInt(language.id),
                  },
                  include: { user: true, category: true, language: true },
            });
            return NextResponse.json(post, { status: 201 });
      } catch (error) {
            console.error('Error creating post:', error);
            return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
      }
}
