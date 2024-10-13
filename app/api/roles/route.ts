import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(request: Request) {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== 1) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const roles = await prisma.role.findMany()
      return NextResponse.json(roles)
}

export async function POST(request: Request) {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== 1) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { name, description } = await request.json()
      if (!name || name.trim() === '') {
            return NextResponse.json({ error: 'Role name is required' }, { status: 400 })
      }

      const role = await prisma.role.create({
            data: {
                  name: name.trim(),
                  description: description || ''
            }
      })
      return NextResponse.json(role)
}

export async function PUT(request: Request) {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== 1) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { id, name, description } = await request.json()
      if (!id || !name || name.trim() === '') {
            return NextResponse.json({ error: 'Role ID and name are required' }, { status: 400 })
      }

      const updatedRole = await prisma.role.update({
            where: { id: parseInt(id) },
            data: {
                  name: name.trim(),
                  description: description || ''
            }
      })

      return NextResponse.json(updatedRole)
}

export async function DELETE(request: Request) {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== 1) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { id } = await request.json()
      if (!id) {
            return NextResponse.json({ error: 'Role ID is required' }, { status: 400 })
      }

      await prisma.role.delete({
            where: { id: parseInt(id) }
      })

      return NextResponse.json({ message: 'Role deleted successfully' })
}
