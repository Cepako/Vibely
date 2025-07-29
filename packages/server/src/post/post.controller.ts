import { FastifyReply, FastifyRequest } from 'fastify';
import { PostService } from './post.service';
import UserService from '../user/user.service';

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

    async addPost(req: FastifyRequest, reply: FastifyReply) {}
}
