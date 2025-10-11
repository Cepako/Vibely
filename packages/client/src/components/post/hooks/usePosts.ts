import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ContentType, Post, PrivacyLevel } from '../../../types/post';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/AuthProvider';
import { apiClient } from '../../../lib/apiClient';

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
        return await apiClient.get<Post>(`/post/single/${postId}`);
    },

    async getPosts(profileId: number): Promise<Post[]> {
        return await apiClient.get<Post[]>(`/post/${profileId}`);
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

        return await apiClient.upload<{ message: string; post: Post }>(
            '/post/create',
            formData
        );
    },

    async updatePost(
        postId: number,
        data: UpdatePostData
    ): Promise<{ message: string; post: Post }> {
        return await apiClient.put(`/api/post/${postId}/edit`, data);
    },

    async deletePost(postId: number): Promise<{ message: string }> {
        return await apiClient.delete(`/api/post/${postId}`);
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
