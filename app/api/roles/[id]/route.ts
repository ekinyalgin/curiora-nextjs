import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 1) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = await prisma.role.findUnique({
    where: { id: parseInt(params.id) },
  });

  if (!role) {
    return NextResponse.json({ error: 'Role not found' }, { status: 404 });
  }

  return NextResponse.json(role);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 1) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, description } = await request.json();
  if (!name || name.trim() === '') {
    return NextResponse.json({ error: 'Role name is required' }, { status: 400 });
  }

  const updatedRole = await prisma.role.update({
    where: { id: parseInt(params.id) },
    data: { 
      name: name.trim(),
      description: description || ''
    },
  });

  return NextResponse.json(updatedRole);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 1) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.role.delete({
    where: { id: parseInt(params.id) },
  });

  return NextResponse.json({ message: 'Role deleted successfully' });
}