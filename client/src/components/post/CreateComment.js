import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useMutation } from '@apollo/client';

import { GET_AUTH_USER, GET_USER } from 'graphql/user';
import { GET_POST, GET_POSTS, GET_FOLLOWED_POSTS } from 'graphql/post';
import { CREATE_COMMENT } from 'graphql/comment';

import { Textarea, Button } from 'styles/Form';
import { IconButton } from 'components/icons';

import { NotificationType } from 'constants/NotificationType';

import { useNotifications } from 'hooks/useNotifications';

import  Picker from 'emoji-picker-react';

import { useStore } from 'store';

const Form = styled.form`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
`;
const ButtonClick = styled.div`
    padding-left: ${(p) => p.theme.spacing.sm};
    padding-top: ${(p) => p.theme.spacing.xs};
    cursor: pointer;
`
const EmojiButton = styled.div`
    z-index: 100;
    margin-top: 38px;
    position: absolute;
    left: 20px;
    border-color: #9a86f3;
    border-radius: 5%;
    .emoji-scroll-wrapper::-webkit-scrollbar {
    background-color: #080420;
    width: 5px;
    &-thumb {
        background-color: #9a86f3;
    }
    .emoji-categories {
        button {
          filter: contrast(0);
        }
      }
    .emoji-search {
    background-color: transparent;
    border-color: #9a86f3;
    }
    .emoji-group:before {
    background-color: #080420;
    }
`;

const Options = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
`
/**
 * Creates a comment for a post
 */
const CreateComment = ({ post, focus }) => {
    const [{ auth }] = useStore();
    const notification = useNotifications();
    const [comment, setComment] = useState('');
    const buttonEl = useRef(null);
    const TextareaEl = useRef(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [createComment, { loading }] = useMutation(CREATE_COMMENT, {
        refetchQueries: [
            { query: GET_FOLLOWED_POSTS, variables: { userId: auth.user.id } },
            { query: GET_USER, variables: { username: auth.user.username } },
            { query: GET_AUTH_USER },
            { query: GET_POSTS, variables: { authUserId: auth.user.id } },
            { query: GET_POST, variables: { id: post.id } },
        ],
    });

    useEffect(() => {
        focus && TextareaEl.current.focus();
    }, [focus]);

    const onEmojiClick = (event) => {
        console.log(event);
        let message = comment;
        message += event.emoji;
        setComment(message);
    }

    const handleEmojiPickerhideShow = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const { data } = await createComment({
            variables: { input: { comment, author: auth.user.id, postId: post.id } },
        });
        setComment('');

        // Create notification on comment
        if (auth.user.id !== post.author.id) {
            notification.create({
                user: post.author,
                postId: post.id,
                notificationType: NotificationType.COMMENT,
                notificationTypeId: data.createComment.id,
            });
        }
    };

    const onEnterPress = (e) => {
        if (e.keyCode === 13) {
            e.preventDefault();
            buttonEl.current.click();
        }
    };
    
    const handleEmojiPickerclose = () => {
        setShowEmojiPicker(false);
    };


    return (
        <Form onSubmit={handleSubmit}>
            <Options>
                <Textarea
                    onClick={handleEmojiPickerclose}
                    onChange={(e) => setComment(e.target.value)}
                    value={comment}
                    placeholder="Viết bình luận..."
                    onKeyDown={onEnterPress}
                    ref={TextareaEl}
                />
                <ButtonClick onClick={handleEmojiPickerhideShow}>
                    <IconButton />
                </ButtonClick>
                
                {showEmojiPicker && (
                    <EmojiButton className="emoji-picker-react">
                        <Picker onEmojiClick={onEmojiClick} disableAutoFocus={true}/>
                    </EmojiButton>
                )}

                <Button
                    onClick={handleEmojiPickerclose}
                    type="submit"
                    color={comment ? 'primary.main' : 'grey[500]'}
                    weight="bold"
                    text
                    ref={buttonEl}
                    disabled={!comment || loading}
                >
                    Bình luận
                </Button>
            </Options>
        </Form>
    );
}

CreateComment.propTypes = {
    post: PropTypes.object.isRequired,
    focus: PropTypes.bool,
};

export default CreateComment;