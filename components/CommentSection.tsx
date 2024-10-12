'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { formatDate } from '@/lib/utils';

export default function CommentSection({ comments, postId }) {
      const { data: session } = useSession();
      const [newComment, setNewComment] = useState('');

      const handleSubmit = async (e) => {
            e.preventDefault();
            // Implement comment submission logic here
      };

      return (
            <section className="mt-8">
                  <h2 className="text-2xl font-bold mb-4">Comments</h2>
                  {comments.map((comment) => (
                        <div key={comment.id} className="mb-4 p-4 bg-gray-100 rounded-lg">
                              <div className="font-bold">{comment.user.name}</div>
                              <div className="text-sm text-gray-600 mb-2">{formatDate(comment.createdAt)}</div>
                              <p>{comment.commentText}</p>
                        </div>
                  ))}
                  {session ? (
                        <form onSubmit={handleSubmit} className="mt-4">
                              <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="w-full p-2 border rounded-lg"
                                    rows={4}
                                    placeholder="Write a comment..."
                              />
                              <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg">
                                    Submit Comment
                              </button>
                        </form>
                  ) : (
                        <p>Please log in to leave a comment.</p>
                  )}
            </section>
      );
}
