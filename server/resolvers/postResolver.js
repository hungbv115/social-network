
import { uploadFile, deleteFile } from '../utils/minioUtils';
import { v4 as uuid } from 'uuid';

const Query = {
    /**
     * Gets all posts
     * 
     * @param {string} authUserId
     * @param {int} skip how many posts to skip
     * @param {int} limit how many posts to limit
     */
    getPosts: async (root, { authUserId, skip, limit }, { Post }) => {
        const query = {
            $and: [{ image: { $ne: null } }, { author: { $ne: authUserId } }],
        };
        const postsCount = await Post.find(query).countDocuments();
        const allPosts = await Post.find(query)
            .populate({
                path: 'author',
                populate: [
                    { path: 'following' },
                    { path: 'followers' },
                    {
                        path: 'notifications',
                        populate: [{ path: 'author' }, { path: 'follow' }, { path: 'like' }, { path: 'comment' }]
                    },
                ],
            })
            .populate('likes')
            .populate({
                path: 'comments',
                options: { sort: { createdAt: 'desc' } },
                populate: { path: 'author' },
            })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: 'desc' });

        return { posts: allPosts, count: postsCount };
    },
    /**
     * Gets posts from followed users
     * 
     * @param {string} userId
     * @param {int} skip how many posts to skip
     * @param {int} limit how many posts to limit
     */
    getFollowedPosts: async (root, { userId, skip, limit }, { Post, Follow }) => {
        // Find user ids, that current user follows
        const userFollowing = [];
        const follow = await Follow.find({ follower: userId }, { _id: 0 }).select('user');
        follow.map((f) => userFollowing.push(f.user));

        // Find user posts and followed posts by using userFollowing ids array
        const query = {
            $or: [{ author: { $in: userFollowing } }, { author: userId }],
        };
        const followedPostsCount = await Post.find(query).countDocuments();
        const followedPosts = await Post.find(query)
            .populate({
                path: 'author',
                populate: [
                    { path: 'following' },
                    { path: 'followers' },
                    {
                        path: 'notifications',
                        populate: [{ path: 'author' }, { path: 'follow' }, { path: 'like' }, { path: 'comment' }],
                    },
                ],
            })
            .populate('likes')
            .populate({
                path: 'comments',
                options: { sort: { createdAt: 'desc' } },
                populate: { path: 'author' },
            })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: 'desc' });

        return { posts: followedPosts, count: followedPostsCount };
    },
    /**
     * Gets post by id
     * 
     * @param {string} id
     */
    getPost: async (root, { id }, { Post }) => {
        const post = await Post.findById(id)
            .populate({
                path: 'author',
                populate: [
                    { path: 'following' },
                    { path: 'followers' },
                    {
                        path: 'notifications',
                        populate: [{ path: 'author' }, { path: 'follow' }, { path: 'like' }, { path: 'comment' }],
                    },
                ],
            })
            .populate('likes')
            .populate({
                path: 'comments',
                options: { sort: { createdAt: -1 } },
                populate: { path: 'author' },
            });

        return post;
    },
};

const Mutation = {
    /**
     * Creates a new post
     * 
     * @param {string} title
     * @param {string} image
     * @param {string} authorId
     */
    createPost: async (root, { input: { title, image, authorId } }, { Post, User }) => {
        if (!title && !image) {
            throw new Error('Post title or image is required');
        }

        let imageUrl1, imagePublicId;
        if (image) {
            
            const {mimetype, createReadStream}  = await image;
            const stream = createReadStream();
            const reFileName = uuid();

            let result;

        try {
            const uploadStream = await uploadFile('post', reFileName, stream);
            stream.pipe(uploadStream.writeStream);
            result = await uploadStream;
        } catch (error) {
            console.log(
            `[Error]: Message: ${error.message}, Stack: ${error.stack}`
            );
            throw new ApolloError("Error uploading file");
        }
        if(mimetype.indexOf("image") !== -1) {
            imageUrl1 = process.env.MINIO_ENDPOINT_MINIO + "/v?filename=post/" + reFileName;
        } else {
            imageUrl1 = process.env.MINIO_ENDPOINT_MINIO + "/video?title=post/" + reFileName;
        }
            
            imagePublicId = 'post/' + reFileName;
        }

        const newPost = await new Post({
            title,
            image: imageUrl1,
            imagePublicId,
            author: authorId,
        }).save();

        await User.findOneAndUpdate({ _id: authorId }, { $push: { posts: newPost.id } });

        return newPost;
    },
    /**
     * Deletes a user post
     * 
     * @param {string} id
     * @param {imagePublicId} id
     */
    deletePost: async (root, { input: { id, imagePublicId } }, { Post, Like, User, Comment, Notification }) => {
        // Remove post image from cloudinary, if imagePublicId is present
        if (imagePublicId) {
            const bucketName = imagePublicId.split(/[/]/)[0];
            const fileName = imagePublicId.split(/[/]/)[1];
            console.log(fileName);
            await deleteFile(bucketName, fileName);
        }

        // Find post and remove it
        const post = await Post.findByIdAndRemove(id);;

        // Delete post from authors (users) posts collection
        await Like.find({ post: post.id }).deleteMany();
        // Delete post likes from users collection
        post.likes.map(async (likeId) => {
            await User.where({ likes: likeId }).update({ $pull: { likes: likeId } });
        });

        // Delete post comments from comments collection
        await Comment.find({ post: post.id }).deleteMany();
        // Delete comments from users collection
        post.comments.map(async (commentId) => {
            await User.where({ comments: commentId }).update({
                $pull: { comments: commentId },
            });
        });

        // Find user notification in users collection and remove them
        const userNotifications = await Notification.find({ post: post.id });

        userNotifications.map(async (notification) => {
            await User.where({ notifications: notification.id }).update({
                $pull: { notifications: notification.id },
            });
        });

        // Remove notifications from notifications collection
        await Notification.find({ post: post.id }).deleteMany();

        return post;
    },
};

export default { Query, Mutation };