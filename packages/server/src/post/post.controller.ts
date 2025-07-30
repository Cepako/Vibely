import { FastifyReply, FastifyRequest } from 'fastify';
import { PostService, UpdatePostData } from './post.service';
import UserService from '../user/user.service';
import { ContentType, PrivacyLevel } from './post.schema';

export default class PostController {
    private postService: PostService;
    private userService: UserService;

    constructor(postService: PostService, userService: UserService) {
        this.postService = postService;
        this.userService = userService;
    }

    async getPosts(
        req: FastifyRequest<{ Params: { profileId: number } }>,
        reply: FastifyReply
    ) {
        const { id: userId } = req.user;
        const { profileId } = req.params;

        const friendshipStatus = await this.userService.getFriendshipStatus(
            userId,
            profileId
        );

        const posts = await this.postService.getPosts(
            profileId,
            userId,
            friendshipStatus
        );

        return reply.status(200).send(posts);
    }

    async createPost(
        req: FastifyRequest<{
            Body: {
                content: string;
                contentType: ContentType;
                privacyLevel: PrivacyLevel;
            };
        }>,
        reply: FastifyReply
    ) {
        try {
            const { id: userId } = req.user;
            const { content, contentType, privacyLevel } = req.body;

            let file = null;
            if (req.isMultipart()) {
                const data = await req.file();
                if (data) {
                    file = {
                        buffer: await data.toBuffer(),
                        filename: data.filename,
                        mimetype: data.mimetype,
                    };
                }
            }

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
                error,
            });
        }
    }

    async editPost(
        req: FastifyRequest<{
            Params: { postId: number };
            Body: {
                content?: string;
                contentType?: ContentType;
                privacyLevel?: PrivacyLevel;
                removeFile?: boolean;
            };
        }>,
        reply: FastifyReply
    ) {
        try {
            const { id: userId } = req.user;
            const { postId } = req.params;
            const { content, contentType, privacyLevel, removeFile } = req.body;

            let file = null;
            if (req.isMultipart()) {
                const data = await req.file();
                if (data) {
                    file = {
                        buffer: await data.toBuffer(),
                        filename: data.filename,
                        mimetype: data.mimetype,
                    };
                }
            }
            const updateData: UpdatePostData = {};

            if (content !== undefined) updateData.content = content;
            if (contentType !== undefined) updateData.contentType = contentType;
            if (privacyLevel !== undefined)
                updateData.privacyLevel = privacyLevel;
            if (removeFile !== undefined) updateData.removeFile = removeFile;
            if (file) updateData.file = file;

            const updatedPost = await this.postService.editPost(
                postId,
                userId,
                {
                    ...updateData,
                }
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
