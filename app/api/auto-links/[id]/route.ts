import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  try {
    const autoLink = await prisma.autoLink.findUnique({ where: { id } });
    if (!autoLink) {
      return NextResponse.json({ error: 'AutoLink not found' }, { status: 404 });
    }

    // Bağlantılı gönderilerdeki linkleri kaldır
    const posts = await prisma.post.findMany({
      where: { autoLinks: { some: { id } } },
      select: { id: true, content: true }
    });

    for (const post of posts) {
      const updatedContent = post.content.replace(
        new RegExp(`\\[${escapeRegExp(autoLink.keyword)}\\]\\(${escapeRegExp(autoLink.url)}\\)`, 'gi'),
        autoLink.keyword
      );

      await prisma.post.update({
        where: { id: post.id },
        data: {
          content: updatedContent,
          autoLinks: { disconnect: { id } }
        }
      });
    }

    // AutoLink'i sil
    await prisma.autoLink.delete({ where: { id } });

    return NextResponse.json({ message: 'AutoLink deleted successfully' });
  } catch (error) {
    console.error('Error deleting AutoLink:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  try {
    const autoLink = await prisma.autoLink.findUnique({
      where: { id },
      include: {
        posts: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    if (!autoLink) {
      return NextResponse.json({ error: 'AutoLink not found' }, { status: 404 });
    }

    return NextResponse.json(autoLink);
  } catch (error) {
    console.error('Error fetching AutoLink:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// Özel karakterleri escape etmek için yardımcı fonksiyon
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
