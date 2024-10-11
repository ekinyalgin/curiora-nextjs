import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export async function GET(request: Request, { params }: { params: { id: string } }) {
      const id = parseInt(params.id);
      const tag = await prisma.tag.findUnique({
            where: { id },
            include: { language: true },
      });

      if (!tag) {
            return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
      }

      return NextResponse.json(tag);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
      const id = parseInt(params.id);
      const body = await request.json();
      let { name, slug, description, language_id } = body;

      if (!slug) {
            slug = slugify(name, { lower: true, strict: true });
      }

      try {
            const updatedTag = await prisma.tag.update({
                  where: { id },
                  data: {
                        name,
                        slug,
                        description,
                        language_id: language_id ? parseInt(language_id) : null,
                  },
                  include: { language: true },
            });
            return NextResponse.json(updatedTag);
      } catch (error) {
            return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 });
      }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
      const id = parseInt(params.id);

      try {
            await prisma.tag.delete({
                  where: { id },
            });
            return NextResponse.json({ message: 'Tag deleted successfully' });
      } catch (error) {
            return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
      }
}
