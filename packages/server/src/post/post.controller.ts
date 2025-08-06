import { FastifyReply, FastifyRequest } from 'fastify';
import { PostService, UpdatePostData } from './post.service';
import { ContentType, PrivacyLevel } from './post.schema';
import { FriendshipService } from '@/friendship/friendship.service';

export default class PostController {
    private postService: PostService;
    private friendshipService: FriendshipService;

    constructor(
        postService: PostService,
        friendshipService: FriendshipService
    ) {
        this.postService = postService;
        this.friendshipService = friendshipService;
    }

    async getPosts(
        req: FastifyRequest<{ Params: { profileId: number } }>,
        reply: FastifyReply
    ) {
        const { id: userId } = req.user;
        const { profileId } = req.params;

        const friendshipStatus =
            await this.friendshipService.getFriendshipStatus(userId, profileId);

        const posts = await this.postService.getPosts(
            profileId,
            userId,
            friendshipStatus
        );

        return reply.status(200).send(posts);
    }

    async createPost(req: FastifyRequest, reply: FastifyReply) {
        try {
            const { id: userId } = req.user;
            let content: string = '';
            let contentType: ContentType = 'photo';
            let privacyLevel: PrivacyLevel = 'public';
            let file = null;

            if (req.isMultipart()) {
                const parts = req.parts();

                for await (const part of parts) {
                    if (part.type === 'field') {
                        switch (part.fieldname) {
                            case 'content':
                                content = part.value as string;
                                break;
                            case 'contentType':
                                contentType = part.value as ContentType;
                                break;
                            case 'privacyLevel':
                                privacyLevel = part.value as PrivacyLevel;
                                break;
                        }
                    } else if (
                        part.type === 'file' &&
                        part.fieldname === 'file'
                    ) {
                        file = {
                            buffer: await part.toBuffer(),
                            filename: part.filename,
                            mimetype: part.mimetype,
                        };
                    }
                }
            }

            if (!content || content.length === 0 || content.length > 2000) {
                return reply.status(400).send({
                    error: 'Content must be between 1 and 2000 characters',
                });
            }

            if (!['photo', 'video'].includes(contentType)) {
                return reply.status(400).send({
                    error: 'Invalid content type',
                });
            }

            if (!['public', 'friends', 'private'].includes(privacyLevel)) {
                return reply.status(400).send({
                    error: 'Invalid privacy level',
                });
            }
            if (!file)
                return reply.status(400).send({
                    error: 'Missing file',
                });

            const post = await this.postService.createPost(userId, {
                content,
                contentType,
                privacyLevel,
                file,
            });

            return reply.status(201).send({
                message: 'Post created successfully',
                post,
            });
        } catch (error) {
            return reply.status(400).send({
                error: error || 'Failed to create post',
            });
        }
    }

    async editPost(
        req: FastifyRequest<{
            Params: { postId: number };
            Body: {
                content: string;
                privacyLevel: PrivacyLevel;
            };
        }>,
        reply: FastifyReply
    ) {
        try {
            const { id: userId } = req.user;
            const { postId } = req.params;
            const { content, privacyLevel } = req.body;

            const updateData: UpdatePostData = { content, privacyLevel };

            const updatedPost = await this.postService.editPost(
                postId,
                userId,
                updateData
            );

            return reply.status(200).send({
                message: 'Post updated successfully',
                post: updatedPost,
            });
        } catch (error: any) {
            if (error.message.includes('not found or unauthorized')) {
                return reply.status(404).send({
                    error: 'Post not found or unauthorized',
                });
            }
            return reply.status(400).send({
                error: error.message,
            });
        }
    }

    async deletePost(
        req: FastifyRequest<{
            Params: { postId: number };
        }>,
        reply: FastifyReply
    ) {
        try {
            const { id: userId } = req.user;
            const { postId } = req.params;

            await this.postService.deletePost(postId, userId);

            return reply.status(200).send({
                message: 'Post deleted successfully',
            });
        } catch (error: any) {
            if (error.message.includes('not found or unauthorized')) {
                return reply.status(404).send({
                    error: 'Post not found or unauthorized',
                });
            }
            return reply.status(400).send({
                error: error.message,
            });
        }
    }
}
