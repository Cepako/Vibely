import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    Comment,
    CreateCommentData,
    CommentLikeInfo,
} from '../../../types/comment';
import toast from 'react-hot-toast';

const commentsApi = {
    async getPostComments(postId: number): Promise<Comment[]> {
        const response = await fetch(
            `/api/comment-reaction/posts/${postId}/comments`,
            {
                credentials: 'include',
            }
        );

        if (!response.ok) {
            const error = await response
                .json()
                .catch(() => ({ error: 'Failed to fetch comments' }));
            throw new Error(error.error || 'Failed to fetch comments');
        }

        return response.json();
    },

    async createComment(
        postId: number,
        data: CreateCommentData
    ): Promise<{ message: string; comment: Comment }> {
        const response = await fetch(
            `/api/comment-reaction/posts/${postId}/comments`,
            {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            }
        );

        if (!response.ok) {
            const error = await response
                .json()
                .catch(() => ({ error: 'Failed to create comment' }));
            throw new Error(error.error || 'Failed to create comment');
        }

        return response.json();
    },

    async updateComment(
        commentId: number,
        content: string
    ): Promise<{ message: string; comment: Comment }> {
        const response = await fetch(
            `/api/comment-reaction/comments/${commentId}`,
            {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content }),
            }
        );

        if (!response.ok) {
            const error = await response
                .json()
                .catch(() => ({ error: 'Failed to update comment' }));
            throw new Error(error.error || 'Failed to update comment');
        }

        return response.json();
    },

    async deleteComment(commentId: number): Promise<{ message: string }> {
        const response = await fetch(
            `/api/comment-reaction/comments/${commentId}`,
            {
                method: 'DELETE',
                credentials: 'include',
            }
        );

        if (!response.ok) {
            const error = await response
                .json()
                .catch(() => ({ error: 'Failed to delete comment' }));
            throw new Error(error.error || 'Failed to delete comment');
        }

        return response.json();
    },

    async toggleCommentLike(
        commentId: number
    ): Promise<{ message: string; liked: boolean }> {
        const response = await fetch(
            `/api/comment-reaction/comments/${commentId}/like`,
            {
                method: 'POST',
                credentials: 'include',
            }
        );

        if (!response.ok) {
            const error = await response
                .json()
                .catch(() => ({ error: 'Failed to toggle comment like' }));
            throw new Error(error.error || 'Failed to toggle comment like');
        }

        return response.json();
    },

    async getCommentLikeInfo(commentId: number): Promise<CommentLikeInfo> {
        const response = await fetch(
            `/api/comment-reaction/comments/${commentId}/likes`,
            {
                credentials: 'include',
            }
        );

        if (!response.ok) {
            const error = await response
                .json()
                .catch(() => ({ error: 'Failed to get comment like info' }));
            throw new Error(error.error || 'Failed to get comment like info');
        }

        return response.json();
    },

    async togglePostLike(
        postId: number
    ): Promise<{ message: string; liked: boolean }> {
        const response = await fetch(
            `/api/comment-reaction/posts/${postId}/like`,
            {
                method: 'POST',
                credentials: 'include',
            }
        );

        if (!response.ok) {
            const error = await response
                .json()
                .catch(() => ({ error: 'Failed to toggle post like' }));
            throw new Error(error.error || 'Failed to toggle post like');
        }

        return response.json();
    },
};

export const usePostComments = (postId: number) => {
    return useQuery({
        queryKey: ['comments', postId],
        queryFn: () => commentsApi.getPostComments(postId),
        staleTime: 2 * 60 * 1000,
        retry: (failureCount, error) => {
            if (
                error?.message?.includes('404') ||
                error?.message?.includes('401')
            ) {
                return false;
            }
            return failureCount < 3;
        },
    });
};

export const useCreateComment = (postId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCommentData) =>
            commentsApi.createComment(postId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', postId] });
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast.success('Comment added!');
        },
        onError: (error: Error) => {
            console.error('Create comment error:', error);
            toast.error(error.message || 'Failed to add comment');
        },
    });
};

export const useUpdateComment = (postId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            commentId,
            content,
        }: {
            commentId: number;
            content: string;
        }) => commentsApi.updateComment(commentId, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', postId] });
            toast.success('Comment updated!');
        },
        onError: (error: Error) => {
            console.error('Update comment error:', error);
            toast.error(error.message || 'Failed to update comment');
        },
    });
};

export const useDeleteComment = (postId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: commentsApi.deleteComment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', postId] });
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast.success('Comment deleted!');
        },
        onError: (error: Error) => {
            console.error('Delete comment error:', error);
            toast.error(error.message || 'Failed to delete comment');
        },
    });
};

export const useToggleCommentLike = (postId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: commentsApi.toggleCommentLike,
        onMutate: async (commentId: number) => {
            await queryClient.cancelQueries({ queryKey: ['comments', postId] });

            const previousComments = queryClient.getQueryData([
                'comments',
                postId,
            ]);

            queryClient.setQueryData(
                ['comments', postId],
                (oldComments: Comment[]) => {
                    if (!oldComments) return oldComments;

                    return oldComments.map((comment) => {
                        if (comment.id === commentId) {
                            return {
                                ...comment,
                                isLiked: !comment.isLiked,
                                likeCount: comment.isLiked
                                    ? comment.likeCount - 1
                                    : comment.likeCount + 1,
                            };
                        }
                        if (comment.replies) {
                            return {
                                ...comment,
                                replies: comment.replies.map((reply) => {
                                    if (reply.id === commentId) {
                                        return {
                                            ...reply,
                                            isLiked: !reply.isLiked,
                                            likeCount: reply.isLiked
                                                ? reply.likeCount - 1
                                                : reply.likeCount + 1,
                                        };
                                    }
                                    return reply;
                                }),
                            };
                        }
                        return comment;
                    });
                }
            );

            return { previousComments };
        },
        onError: (error: Error, commentId, context) => {
            if (context?.previousComments) {
                queryClient.setQueryData(
                    ['comments', postId],
                    context.previousComments
                );
            }
            console.error('Toggle comment like error:', error);
            toast.error(error.message || 'Failed to toggle like');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        },
    });
};

export const useTogglePostLike = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: commentsApi.togglePostLike,
        onSuccess: (data, postId) => {
            queryClient.setQueryData(['posts'], (oldPosts: any[]) => {
                if (!oldPosts) return oldPosts;

                return oldPosts.map((post) => {
                    if (post.id === postId) {
                        const currentUser = queryClient.getQueryData([
                            'currentUser',
                        ]);
                        const userId = (currentUser as any)?.id;

                        if (data.liked) {
                            return {
                                ...post,
                                postReactions: [
                                    ...post.postReactions,
                                    { userId, postId },
                                ],
                            };
                        } else {
                            return {
                                ...post,
                                postReactions: post.postReactions.filter(
                                    (reaction: any) =>
                                        reaction.userId !== userId
                                ),
                            };
                        }
                    }
                    return post;
                });
            });

            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
        onError: (error: Error) => {
            console.error('Toggle post like error:', error);
            toast.error(error.message || 'Failed to toggle like');
        },
    });
};
