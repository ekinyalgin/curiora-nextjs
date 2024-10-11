import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
      const id = parseInt(params.id);
      const comment = await prisma.comment.findUnique({
            where: { id },
            include: { user: true, post: true },
      });

      if (!comment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      }

      return NextResponse.json(comment);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
      const id = parseInt(params.id);
      const body = await request.json();

      const updatedComment = await prisma.comment.update({
            where: { id },
            data: body,
            include: { user: true, post: true },
      });

      return NextResponse.json(updatedComment);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
      const id = parseInt(params.id);

      await prisma.comment.delete({ where: { id } });
      return NextResponse.json({ message: 'Comment deleted successfully' });
}
