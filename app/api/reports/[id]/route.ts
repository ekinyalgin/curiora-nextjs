import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { id } = params
      // status'u kaldırdık, çünkü artık rapor üzerinde değil, yorum üzerinde işlem yapıyoruz
      // const { status } = await req.json()

      try {
            // Raporu güncellemek yerine sadece var olduğunu kontrol ediyoruz
            const report = await prisma.report.findUnique({
                  where: { id },
                  include: { comment: true }
            })

            if (!report) {
                  return NextResponse.json({ error: 'Report not found' }, { status: 404 })
            }

            // Rapor ile ilişkili yorumu güncelliyoruz
            if (report.comment) {
                  await prisma.comment.update({
                        where: { id: report.comment.id },
                        data: { status: 'approved' } // Veya istediğiniz başka bir durum
                  })
            }

            return NextResponse.json({ message: 'Report processed successfully' })
      } catch (error) {
            console.error('Error processing report:', error)
            return NextResponse.json({ error: 'Failed to process report' }, { status: 500 })
      }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { id } = params

      try {
            const report = await prisma.report.findUnique({
                  where: { id },
                  include: { post: true, comment: true }
            })

            if (!report) {
                  return NextResponse.json({ error: 'Report not found' }, { status: 404 })
            }

            // Raporu sil
            await prisma.report.delete({
                  where: { id }
            })

            // ReportCount'u sıfırla
            if (report.postId) {
                  await prisma.post.update({
                        where: { id: report.postId },
                        data: { reportCount: 0 }
                  })
            } else if (report.commentId) {
                  await prisma.comment.update({
                        where: { id: report.commentId },
                        data: { reportCount: 0 }
                  })
            }

            return NextResponse.json({ message: 'Report deleted successfully and reportCount reset to 0' })
      } catch (error) {
            console.error('Error deleting report:', error)
            return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 })
      }
}
