import { prisma } from '@/lib/prisma';
import PostComponent from '@/components/PostComponent';
import CommentSection from '@/components/CommentSection';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function PostPage({ params }: { params: { slug: string } }) {
      const session = await getServerSession(authOptions);
      const post = await prisma.post.findUnique({
            where: { slug: params.slug },
            include: {
                  user: true,
                  category: true,
                  language: true,
                  tags: true,
                  comments: {
                        include: { user: true },
                        where: { status: 'approved' },
                        orderBy: { createdAt: 'desc' },
                  },
            },
      });

      if (!post) {
            return <div>Post not found</div>;
      }

      const isAdmin = session?.user?.role === 1;

      return (
            <div className="container mx-auto px-4 py-8">
                  <PostComponent post={post} showEditLink={isAdmin} />
                  <CommentSection comments={post.comments} postId={post.id} />
            </div>
      );
}
