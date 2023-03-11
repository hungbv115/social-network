import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { generatePath } from 'react-router-dom';
import styled from 'styled-components';
import { useApolloClient } from '@apollo/client';
import { Divider } from '@material-ui/core'
import { Spacing } from 'styles/Layout';
import { A } from 'styles/Text';
import { Button } from 'styles/Form';

import { DotsIcon, PostCommentIcon } from 'components/icons';
import Comment from 'components/shared/Comment';
import CreateComment from 'components/post/CreateComment';
import Like from 'components/shared/Like';
import Modal from 'components/shared/Modal';
import Avatar from 'components/shared/Avatar';
import PostCardOption from './PostCardOption';

import { GET_FOLLOWED_POSTS, DELETE_POST } from 'graphql/post';
import { GET_AUTH_USER } from 'graphql/user';
import { GET_USER_POSTS } from 'graphql/user';

import { HOME_PAGE_POSTS_LIMIT, PROFILE_PAGE_POSTS_LIMIT } from 'constants/DataLimit';

import { useStore } from 'store';

import * as Routes from 'routes';

import { timeAgo } from 'utils/date';

const Root = styled.div`
    width: 100%;
    border-radius: 10px;
    padding-bottom: ${(p) => p.theme.spacing.xxs};
    background-color: ${(p) => p.theme.colors.white};
    border: 1px solid ${(p) => p.theme.colors.border.main};
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
`;

const TopRow = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    padding: ${(p) => p.theme.spacing.xs} ${(p) => p.theme.spacing.sm};
`;

const CreatedAt = styled.div`
    font-size: ${(p) => p.theme.font.size.xxs};
    color: ${(p) => p.theme.colors.text.hint};
    border-bottom: 1px solid ${(p) => p.theme.colors.text.secondary};
    border: 0;
    margin-top: 2px;
`;

const Author = styled(A)`
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const Name = styled.span`
    font-size: ${(p) => p.theme.font.size.xs};
    font-weight: ${(p) => p.theme.font.weight.bold};
    color: ${(p) => p.theme.colors.primary.main};
`;

const Poster = styled.img`
    display: block;
    width: 100%;
    max-height: 700px;
    object-fit: cover;
    cursor: pointer;
    margin-bottom: ${(p) => p.theme.spacing.sm};
`;

const PosterVideo = styled.video`
    display: block;
    width: 100%;
    max-height: 700px;
    object-fit: cover;
    cursor: pointer;
    margin-bottom: ${(p) => p.theme.spacing.sm};
`;


const Title = styled.div`
    word-break: break-word;
    white-space: pre-line;
    font-family: Helvetica, Arial, sans-serif !important;
    font-size: .9375rem !important;
    font-weight: 400;
    line-height: 1.3333;
`;

const BottomRow = styled.div`
    overflow: hidden;
`;

const CountAndIcons = styled.div`
    padding: 0 ${(p) => p.theme.spacing.sm};
`;

const Count = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding-bottom: ${(p) => p.theme.spacing.xs};
    font-size: ${(p) => p.theme.font.size.xs};
    color: ${(p) => p.theme.colors.text.secondary};
`;

const Icons = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    border-top: 1px solid ${(p) => p.theme.colors.border.main};
`;

const Comments = styled.div`
    padding: 0 ${(p) => p.theme.spacing.sm};
`;

const StyledButton = styled(Button)`
    padding: 0;
    padding-left: 4px;
    font-size: ${(p) => p.theme.font.size.xxs};
`;

const CommentLine = styled.div`
    margin-bottom: 5px;
    border-top: 1px solid ${(p) => p.theme.colors.border.main};
`;


/**
 * Component for rendering user post
 */
const PostCard = ({
    author,
    imagePublicId,
    comments,
    title,
    createdAt,
    image,
    likes,
    postId,
    openModal
}) => {
    const [{ auth }] = useStore();
    const client = useApolloClient();
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [isOptionOpen, setIsOptionOpen] = useState(false);

    const toggleCreateComment = () => {
        setIsCommentOpen(true);
    }

    const toggleComment = () => {
        setIsCommentOpen(!isCommentOpen);
    };

    const closeOption = () => setIsOptionOpen(false);
    const openOption = () => setIsOptionOpen(true);

    const deletePost = async () => {
        try {
            await client.mutate({
                mutation: DELETE_POST,
                variables: { input: { id: postId, imagePublicId } },
                refetchQueries: () => [
                    {
                        query: GET_FOLLOWED_POSTS,
                        variables: {
                            userId: auth.user.id,
                            skip: 0,
                            limit: HOME_PAGE_POSTS_LIMIT,
                        },
                    },
                    { query: GET_AUTH_USER },
                    {
                        query: GET_USER_POSTS,
                        variables: {
                            username: auth.user.username,
                            skip: 0,
                            limit: PROFILE_PAGE_POSTS_LIMIT,
                        },
                    },
                ],
            });
        } catch (err) { }

        setIsOptionOpen(false);
    }

    return (
        <>
            <Root>
                <Modal onClose={closeOption} open={isOptionOpen} >
                    <PostCardOption postId={postId} closeOption={closeOption} author={author} deletePost={deletePost} />
                </Modal>

                <TopRow>
                    <Author
                        to={generatePath(Routes.USER_PROFILE, {
                            username: author.username,
                        })}
                    >
                        <Avatar image={author.image} />

                        <Spacing left="xs">
                            <Name>{author.fullName}</Name>
                            <CreatedAt>{timeAgo(createdAt)}</CreatedAt>
                        </Spacing>
                    </Author>

                    <Button ghost onClick={openOption}>
                        <DotsIcon />
                    </Button>
                </TopRow>

                <Spacing left="sm" bottom="sm" top="xs" right="sm">
                    <Title>
                        {title}
                    </Title>
                </Spacing>

                {(image && image.includes("video"))
                ? <PosterVideo onClick={openModal} controls>
                    <source src={image} type="video/mp4"/>
                </PosterVideo> : <Poster src={image} onClick={openModal} /> }

                <BottomRow>
                    <CountAndIcons>
                        <Count>
                            {likes.length} Thích
                            <Spacing />
                            <StyledButton onClick={toggleComment} text>
                                {comments.length} Bình luận
                            </StyledButton>
                        </Count>

                    </CountAndIcons>
                    <Icons>
                        <Like fullWidth withText user={author} postId={postId} likes={likes} />
                        
                        <Button fullWidth text onClick={toggleCreateComment}>
                            <PostCommentIcon /> <Spacing inline left="xxs" /> <b>Bình Luận</b>
                        </Button>
                    </Icons>

                    {isCommentOpen && (
                        <>
                            <Spacing top="xs">
                                <CommentLine />
                                <CreateComment post={{ id: postId, author }} focus={isCommentOpen} />
                            </Spacing>

                            {comments.length > 0 && <CommentLine />}

                            <Comments>
                                {comments.map((comment) => (
                                    <Comment key={comment.id} comment={comment} postId={postId} postAuthor={author} />
                                ))}
                            </Comments>
                        </>
                    )}
                </BottomRow>
            </Root>
        </>
    );
}

PostCard.propTypes = {
    author: PropTypes.object.isRequired,
    imagePublicId: PropTypes.string,
    title: PropTypes.string.isRequired,
    image: PropTypes.string,
    likes: PropTypes.array.isRequired,
    comments: PropTypes.array,
    createdAt: PropTypes.string.isRequired,
    postId: PropTypes.string.isRequired,
    openModal: PropTypes.func.isRequired,
};

export default PostCard;