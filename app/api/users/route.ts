import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
      const { searchParams } = new URL(request.url);
      const search = searchParams.get('search');

      let users;
      if (search) {
            users = await prisma.user.findMany({
                  where: {
                        OR: [
                              { name: { contains: search } },
                              { email: { contains: search } },
                              { username: { contains: search } },
                        ],
                  },
                  include: { role: true },
            });
      } else {
            users = await prisma.user.findMany({
                  include: { role: true },
            });
      }

      return NextResponse.json(users);
}

export async function POST(request: Request) {
      const body = await request.json();
      const user = await prisma.user.create({
            data: body,
            include: { role: true },
      });
      return NextResponse.json(user, { status: 201 });
}
