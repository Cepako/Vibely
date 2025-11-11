import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    Comment,
    CreateCommentData,
    CommentLikeInfo,
} from '../../../types/comment';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/AuthProvider';
import { apiClient } from '../../../lib/apiClient';

const commentsApi = {
    async getPostComments(postId: number): Promise<Array<Comment>> {
        return await apiClient.get<Array<Comment>>(
            `/comment-reaction/posts/${postId}/comments`
        );
    },

    async createComment(
        postId: number,
        data: CreateCommentData
    ): Promise<{ message: string; comment: Comment }> {
        return await apiClient.post<{
            message: string;
            comment: Comment;
        }>(`/comment-reaction/posts/${postId}/comments`, data);
    },

    async updateComment(
        commentId: number,
        content: string
    ): Promise<{ message: string; comment: Comment }> {
        return await apiClient.put<{ message: string; comment: Comment }>(
            `/comment-reaction/comments/${commentId}`,
            { content }
        );
    },

    async deleteComment(commentId: number): Promise<{ message: string }> {
        return await apiClient.delete<{ message: string }>(
            `/comment-reaction/comments/${commentId}`
        );
    },

    async toggleCommentLike(
        commentId: number
    ): Promise<{ message: string; liked: boolean }> {
        return await apiClient.post<{
            message: string;
            liked: boolean;
        }>(`/comment-reaction/comments/${commentId}/like`);
    },

    async getCommentLikeInfo(commentId: number): Promise<CommentLikeInfo> {
        return await apiClient.get<CommentLikeInfo>(
            `/comment-reaction/comments/${commentId}/likes`
        );
    },

    async togglePostLike(
        postId: number
    ): Promise<{ message: string; liked: boolean }> {
        return await apiClient.post<{
            message: string;
            liked: boolean;
        }>(`/comment-reaction/posts/${postId}/like`);
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
            queryClient.invalidateQueries({
                queryKey: ['homeFeed', 'infinite'],
                exact: false,
            });
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
            queryClient.invalidateQueries({
                queryKey: ['homeFeed', 'infinite'],
                exact: false,
            });
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
        onError: (error: Error, _, context) => {
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
            queryClient.invalidateQueries({
                queryKey: ['commentLikes'],
                exact: false,
            });
        },
    });
};
export const useTogglePostLike = (profileId: number) => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: commentsApi.togglePostLike,
        onMutate: async (postId: number) => {
            await queryClient.cancelQueries({
                queryKey: ['posts', user?.id, profileId],
            });

            const previousPosts = queryClient.getQueryData([
                'posts',
                user?.id,
                profileId,
            ]);

            queryClient.setQueryData(
                ['posts', user?.id, profileId],
                (oldPosts: any[]) => {
                    if (!oldPosts) return oldPosts;

                    return oldPosts.map((post) => {
                        if (post.id === postId) {
                            const isCurrentlyLiked = post.postReactions.some(
                                (reaction: any) => reaction.userId === user?.id
                            );

                            if (isCurrentlyLiked) {
                                return {
                                    ...post,
                                    postReactions: post.postReactions.filter(
                                        (reaction: any) =>
                                            reaction.userId !== user?.id
                                    ),
                                };
                            } else {
                                return {
                                    ...post,
                                    postReactions: [
                                        ...post.postReactions,
                                        { userId: user?.id, postId },
                                    ],
                                };
                            }
                        }
                        return post;
                    });
                }
            );

            return { previousPosts };
        },
        onError: (error: Error, _, context) => {
            if (context?.previousPosts) {
                queryClient.setQueryData(
                    ['posts', user?.id, profileId],
                    context.previousPosts
                );
            }
            console.error('Toggle post like error:', error);
            toast.error(error.message || 'Failed to toggle like');
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ['posts', user?.id, profileId],
            });
            queryClient.invalidateQueries({
                queryKey: ['homeFeed', 'infinite'],
                exact: false,
            });
        },
    });
};

export const useCommentLikeInfo = (commentId: number) => {
    return useQuery({
        queryKey: ['commentLikes', commentId],
        queryFn: () => commentsApi.getCommentLikeInfo(commentId),
        enabled: !!commentId,
        staleTime: 30 * 1000, // 30 seconds
    });
};
