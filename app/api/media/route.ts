import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
      const { searchParams } = new URL(request.url);
      const search = searchParams.get('search') || '';
      const date = searchParams.get('date') || 'all';

      let whereClause: any = {};

      if (search) {
            whereClause.fileName = { contains: search };
      }

      if (date !== 'all') {
            const monthsAgo = parseInt(date);
            const dateLimit = new Date();
            dateLimit.setMonth(dateLimit.getMonth() - monthsAgo);
            whereClause.createdAt = { gte: dateLimit };
      }

      const media = await prisma.media.findMany({
            where: whereClause,
            include: { user: true },
            orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(media);
}
