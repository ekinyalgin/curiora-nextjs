import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
      const id = parseInt(params.id);
      const post = await prisma.post.findUnique({
            where: { id },
            include: { user: true, category: true, language: true },
      });

      if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }

      return NextResponse.json(post);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
      const id = parseInt(params.id);
      const body = await request.json();

      try {
            // Tüm verileri body'den al, ardından id'yi doğrudan çıkar.
            const { id: _postId, user, category, language, ...postData } = body;

            // Eğer user, category veya language varsa sadece ilgili ID'leri kullan.
            const data: any = {
                  ...postData,
                  userId: user?.id || undefined,
                  categoryId: category?.id ? parseInt(category.id, 10) : undefined,
                  languageId: language?.id ? parseInt(language.id, 10) : undefined,
            };

            // Prisma güncellemesini gerçekleştir
            const updatedPost = await prisma.post.update({
                  where: { id },
                  data,
                  include: {
                        user: true,
                        category: true,
                        language: true,
                  },
            });

            return NextResponse.json(updatedPost);
      } catch (error) {
            console.error('Error updating post:', error);
            return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
      }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
      const id = parseInt(params.id);

      try {
            await prisma.post.delete({ where: { id } });
            return NextResponse.json({ message: 'Post deleted successfully' });
      } catch (error) {
            console.error('Error deleting post:', error);
            return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
      }
}
