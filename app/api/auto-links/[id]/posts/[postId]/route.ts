import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request, { params }: { params: { id: string, postId: string } }) {
  const autoLinkId = parseInt(params.id);
  const postId = parseInt(params.postId);

  try {
    const autoLink = await prisma.autoLink.findUnique({ where: { id: autoLinkId } });
    if (!autoLink) {
      return NextResponse.json({ error: 'AutoLink not found' }, { status: 404 });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Remove the link from the post content
    const updatedContent = post.content.replace(
      new RegExp(`\\[${escapeRegExp(autoLink.keyword)}\\]\\(${escapeRegExp(autoLink.url)}\\)`, 'gi'),
      autoLink.keyword
    );

    // Update the post and disconnect the autoLink
    await prisma.post.update({
      where: { id: postId },
      data: {
        content: updatedContent,
        autoLinks: { disconnect: { id: autoLinkId } },
      },
    });

    return NextResponse.json({ message: 'Link removed from post successfully' });
  } catch (error) {
    console.error('Error removing link from post:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// Özel karakterleri escape etmek için yardımcı fonksiyon
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
