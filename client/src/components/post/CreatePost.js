import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import styled from 'styled-components';

import { Spacing, Overlay, Container } from 'styles/Layout';
import { Error } from 'styles/Text';
import { Button } from 'styles/Form';
import Avatar from 'components/shared/Avatar';

import PostImageUpload from './PostImageUpload';

import { IconButton } from 'components/icons';

import { GET_FOLLOWED_POSTS, CREATE_POST } from 'graphql/post';
import { GET_AUTH_USER, GET_USER_POSTS } from 'graphql/user';

import { useStore } from 'store';

import { PROFILE_PAGE_POSTS_LIMIT } from 'constants/DataLimit';
import { HOME_PAGE_POSTS_LIMIT } from 'constants/DataLimit';
// import { MAX_POST_IMAGE_SIZE } from 'constants/ImageSize';

// import { useGlobalMessage } from 'hooks/useGlobalMessage';
import PostVideoUpload from './PostVideoUpload';
import  Picker from 'emoji-picker-react';

const Root = styled(Container)`
    border: 0;
    border: 1px solid ${(p) => p.theme.colors.border.main};
    box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;
    border-radius: 10px;
`;

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: ${(p) => p.theme.spacing.xs} 0;
    border-bottom: 1px solid ${(p) => p.theme.colors.border.main};
`;

const WrapperIcon = styled.div`
    display: flex;
    justify-content: flex-start;
    padding: ${(p) => p.theme.spacing.xs} 0;
`;

const Textarea = styled.textarea`
    width: 100%;
    margin: 0 ${(p) => p.theme.spacing.xs};
    padding-left: ${(p) => p.theme.spacing.sm};
    padding-top: ${(p) => p.theme.spacing.xs};
    border: 0;
    outline: none;
    resize: none;
    transition: 0.1s ease-out;
    height: ${(p) => (p.focus ? '75px' : '40px')};
    font-size: ${(p) => p.theme.font.size.xs};
    background-color: ${(p) => p.theme.colors.grey[100]};
    border-radius: ${(p) => p.theme.radius.xl};
`;

const ImagePreviewContainer = styled.div`
    width: 150px;
    height: 150px;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: ${(p) => p.theme.shadows.sm};
`;

const ImagePreview = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const VideoPreview = styled.source`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const Options = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    border-top: 1px solid ${(p) => p.theme.colors.border.main};
    padding: ${(p) => p.theme.spacing.sm} 0;
`;

const Buttons = styled.div`
    display: flex;
    flex-direction: row;
`;

const EmojiButton = styled.div`
    position: absolute;
    bottom: -470px;
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

const ButtonClick = styled.div`
    margin-top: 6px;
    cursor: pointer;
`

/**
 * Component for creating a post
 */
const CreatePost = () => {
    const [{ auth }] = useStore();
    const [title, setTitle] = useState('');
    const [image, setImage] = useState('');
    const [video, setVideo] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [error, setError] = useState('');
    const [apiError, setApiError] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    // const message = useGlobalMessage();
    const [createPost, { loading }] = useMutation(CREATE_POST, {
        refetchQueries: [
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

    const handleReset = () => {
        setTitle('');
        setVideo(false);
        setImage('');
        setIsFocused(false);
        setError('');
        setApiError(false);
    };

    const handleOnFocus = () => setIsFocused(true);

    const handlePostImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        let typeFile = file.type;

        if(typeFile.includes("video")) {
            setVideo(true);
        }

        // if (file.size >= MAX_POST_IMAGE_SIZE) {
        //     message.error(`File size should be less then ${MAX_POST_IMAGE_SIZE / 1000000}MB`);
        //     return;
        // }

        setImage(file);
        setIsFocused(true);
        e.target.value = null;
    };

    const handleTitleChange = (e) => setTitle(e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createPost({
                variables: { input: { title, image, authorId: auth.user.id } },
                fetchPolicy: 'no-cache',
            });
            handleReset();
        } catch (error) {
            setApiError(true);
        }
    };

    const onEmojiClick = (event) => {
        console.log(event);
        let message = title;
        message += event.emoji;
        setTitle(message);
    }

    const handleEmojiPickerhideShow = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const isShareDisabled = loading || (!loading && !image && !title && !video);

    return (
        <>
            {isFocused && <Overlay onClick={handleReset} />}

            <Root zIndex={isFocused ? 'md' : 'xs'} color="white" radius="sm" padding="sm">
                <form onSubmit={handleSubmit}>
                    <Wrapper>
                        <Avatar image={auth.user.image} size={40} />

                        <Textarea
                            type="textarea"
                            name="title"
                            focus={isFocused}
                            value={title}
                            onFocus={handleOnFocus}
                            onChange={handleTitleChange}
                            placeholder={auth.user.fullName + " ơi, bạn đang nghĩ gì thế?"}
                        />
                        
                        <ButtonClick disabled={isFocused} onClick={handleEmojiPickerhideShow}>
                            <IconButton />
                        </ButtonClick>
                            
                        {showEmojiPicker && (
                            <EmojiButton className="emoji-picker-react">
                                <Picker onEmojiClick={onEmojiClick} disableAutoFocus={true}/>
                            </EmojiButton>
                        )}
                    </Wrapper>

                    {!isFocused && (
                    <WrapperIcon>
                        <PostImageUpload handleChange={handlePostImageUpload} />
                        <div style={{margin: "2px"}}></div>
                        <PostVideoUpload handleChange={handlePostImageUpload} />
                    </WrapperIcon>)}
                    

                    {video ? 
                    (
                        image && (
                        <Spacing bottom="sm">
                            <video width="300" controls>
                                <VideoPreview src={URL.createObjectURL(image)} />
                            </video>
                        </Spacing>
                    ))
                    : (
                        image && (
                        <Spacing bottom="sm">
                            <ImagePreviewContainer>
                                <ImagePreview src={URL.createObjectURL(image)} />
                            </ImagePreviewContainer>
                        </Spacing> 
                    ))}



                    {isFocused && (
                        <Options>
                            <WrapperIcon>
                                <PostImageUpload label="photo" handleChange={handlePostImageUpload} />
                                <div style={{margin: "2px"}}></div>
                                <PostVideoUpload label="video" handleChange={handlePostImageUpload} />
                            </WrapperIcon>
                            
                            <Buttons>
                                <Button text type="button" onClick={handleReset}>
                                    Cancel
                                </Button>
                                <Button disabled={isShareDisabled} type="submit">
                                    Share
                                </Button>
                            </Buttons>
                        </Options>
                    )}

                    {apiError ||
                        (error && (
                            <Spacing top="xs" bottom="sm">
                                <Error size="xs">{apiError ? 'Something went wrong, please try again.' : error}</Error>
                            </Spacing>
                        ))}
                </form>
            </Root>
        </>
    );
}

export default CreatePost;