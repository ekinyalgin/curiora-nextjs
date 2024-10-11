import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
      const { searchParams } = new URL(request.url);
      const search = searchParams.get('search');

      let comments;
      if (search) {
            comments = await prisma.comment.findMany({
                  where: {
                        OR: [{ commentText: { contains: search } }, { user: { name: { contains: search } } }],
                  },
                  include: { user: true, post: true },
            });
      } else {
            comments = await prisma.comment.findMany({
                  include: { user: true, post: true },
            });
      }

      return NextResponse.json(comments);
}

export async function POST(request: Request) {
      const body = await request.json();
      const comment = await prisma.comment.create({
            data: body,
            include: { user: true, post: true },
      });
      return NextResponse.json(comment, { status: 201 });
}
