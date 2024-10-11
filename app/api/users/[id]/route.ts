import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
      const user = await prisma.user.findUnique({
            where: { id: params.id },
            include: { role: true },
      });

      if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json(user);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
      const body = await request.json();

      const updatedUser = await prisma.user.update({
            where: { id: params.id },
            data: body,
            include: { role: true },
      });

      return NextResponse.json(updatedUser);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
      await prisma.user.delete({ where: { id: params.id } });
      return NextResponse.json({ message: 'User deleted successfully' });
}
