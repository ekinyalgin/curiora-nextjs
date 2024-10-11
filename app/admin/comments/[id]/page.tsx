'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminFormLayout } from '@/components/ui/admin-form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EditComment({ params }: { params: { id: string } }) {
      const [comment, setComment] = useState({
            commentText: '',
            status: '',
            userId: '',
            postId: '',
      });
      const [users, setUsers] = useState([]);
      const [posts, setPosts] = useState([]);
      const router = useRouter();
      const id = parseInt(params.id);

      useEffect(() => {
            fetchComment();
            fetchUsers();
            fetchPosts();
      }, [id]);

      async function fetchComment() {
            const response = await fetch(`/api/comments/${id}`);
            const data = await response.json();
            setComment(data);
      }

      async function fetchUsers() {
            const response = await fetch('/api/users');
            const data = await response.json();
            setUsers(data);
      }

      async function fetchPosts() {
            const response = await fetch('/api/posts');
            const data = await response.json();
            setPosts(data);
      }

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            try {
                  const response = await fetch(`/api/comments/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(comment),
                  });

                  if (!response.ok) {
                        throw new Error('Failed to update comment');
                  }

                  router.push('/admin/comments');
            } catch (err) {
                  console.error('Error updating comment:', err);
                  alert('Failed to update comment. Please try again.');
            }
      };

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setComment((prev) => ({ ...prev, [name]: value }));
      };

      return (
            <AdminFormLayout
                  title="Edit Comment"
                  backLink="/admin/comments"
                  onSubmit={handleSubmit}
                  submitText="Update Comment">
                  <Textarea
                        name="commentText"
                        label="Comment Text"
                        value={comment.commentText}
                        onChange={handleInputChange}
                        placeholder="Enter comment text"
                        required
                  />
                  <Select
                        value={comment.status}
                        onValueChange={(value) => setComment((prev) => ({ ...prev, status: value }))}>
                        <SelectTrigger>
                              <SelectValue placeholder="Select comment status" />
                        </SelectTrigger>
                        <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                  </Select>
                  <Select
                        value={comment.userId}
                        onValueChange={(value) => setComment((prev) => ({ ...prev, userId: value }))}>
                        <SelectTrigger>
                              <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                        <SelectContent>
                              {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                          {user.name}
                                    </SelectItem>
                              ))}
                        </SelectContent>
                  </Select>
                  <Select
                        value={comment.postId}
                        onValueChange={(value) => setComment((prev) => ({ ...prev, postId: value }))}>
                        <SelectTrigger>
                              <SelectValue placeholder="Select post" />
                        </SelectTrigger>
                        <SelectContent>
                              {posts.map((post) => (
                                    <SelectItem key={post.id} value={post.id.toString()}>
                                          {post.title}
                                    </SelectItem>
                              ))}
                        </SelectContent>
                  </Select>
            </AdminFormLayout>
      );
}
