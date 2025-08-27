import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ContentType, Post, PrivacyLevel } from '../../../types/post';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/AuthProvider';

export interface CreatePostData {
    content: string;
    contentType: ContentType;
    privacyLevel: PrivacyLevel;
    file: File;
}

export interface UpdatePostData {
    content: string;
    privacyLevel: PrivacyLevel;
}

const postsApi = {
    async getPostById(postId: number): Promise<Post> {
        const response = await fetch(`/api/post/single/${postId}`, {
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(
                    'Post not found or you do not have permission to view it'
                );
            }
            throw new Error('Failed to fetch post');
        }

        return response.json();
    },

    async getPosts(profileId: number): Promise<Post[]> {
        const response = await fetch(`/api/post/${profileId}`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }

        return response.json();
    },

    async createPost(
        data: CreatePostData
    ): Promise<{ message: string; post: Post }> {
        const formData = new FormData();
        formData.append('content', data.content);
        formData.append('contentType', data.contentType);
        formData.append('privacyLevel', data.privacyLevel);

        if (data.file) {
            formData.append('file', data.file);
        }

        const response = await fetch('/api/post/create', {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create post');
        }

        return response.json();
    },

    async updatePost(
        postId: number,
        data: UpdatePostData
    ): Promise<{ message: string; post: Post }> {
        const response = await fetch(`/api/post/${postId}/edit`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update post');
        }

        return response.json();
    },

    async deletePost(postId: number): Promise<{ message: string }> {
        const response = await fetch(`/api/post/${postId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete post');
        }

        return response.json();
    },
};

export const usePost = (postId: number) => {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['post', postId, user?.id],
        queryFn: () => postsApi.getPostById(postId),
        staleTime: 5 * 60 * 1000,
        enabled: !!postId,
    });
};

export const usePosts = (profileId: number) => {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['posts', user?.id, profileId],
        queryFn: () => postsApi.getPosts(profileId),
        staleTime: 5 * 60 * 1000,
    });
};

export const useCreatePost = (profileId: number) => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: postsApi.createPost,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['posts', user?.id, profileId],
            });
            toast.success('Post created successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};

export const useUpdatePost = (profileId: number) => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: ({
            postId,
            data,
        }: {
            postId: number;
            data: UpdatePostData;
        }) => postsApi.updatePost(postId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['posts', user?.id, profileId],
            });
            toast.success('Post updated successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};

export const useDeletePost = (profileId: number) => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    return useMutation({
        mutationFn: postsApi.deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['posts', user?.id, profileId],
            });
            toast.success('Post deleted successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
