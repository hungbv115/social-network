import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client';

import { Spacing } from 'styles/Layout';
import { Button, Textarea } from 'styles/Form';
import { SendIcon, CancelIcon} from 'components/icons';
import Avatar from 'components/shared/Avatar';

import { CREATE_MESSAGE } from 'graphql/messages';
import { GET_CONVERSATIONS } from 'graphql/user';

import { currentDate } from 'utils/date';

import PostImageUpload from '../../components/post/PostImageUpload';
import PostVideoUpload from '../../components/post/PostVideoUpload';

import  Picker, { Emoji } from 'emoji-picker-react';

import * as Routes from 'routes';

const Root = styled.div`
    padding: 0 ${(p) => p.theme.spacing.sm};
    overflow-y: auto;
    height: 100vh;
    margin-top: -120px;
    padding-top: 120px;
    display: flex;
    flex-direction: column;

    ::-webkit-scrollbar {
        width: 8px;
    }

    ::-webkit-scrollbar-thumb {
        background-color: ${(p) => p.theme.colors.grey[500]};
        border-radius: ${(p) => p.theme.radius.lg};
        visibility: hidden;

        &:hover {
            background-color: ${(p) => p.theme.colors.grey[600]};
        }
    }

    &:hover {
        ::-webkit-scrollbar-thumb {
            visibility: visible;
        }
    }
`;

const WrapperIcon = styled.div`
    display: flex;
    justify-content: flex-start;
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

const Conversation = styled.div`
    flex: 1;
`;

const MessageDate = styled.span`
    position: absolute;
    bottom: -${(p) => p.theme.spacing.sm};
    left: ${(p) => !p.userMessage && p.theme.spacing.lg};
    right: -${(p) => p.userMessage && 0};
    display: none;
    font-size: ${(p) => p.theme.font.size.tiny};
    color: ${(p) => p.theme.colors.text.secondary};
`;

const MessageWrapper = styled.div`
    display: flex;
    position: relative;
    flex-direction: column;
    align-items: ${(p) => p.userMessage ? 'flex-end' : 'flex-start'};
    justify-content: ${(p) => p.userMessage && 'flex-end'};
    margin: ${(p) => p.theme.spacing.md} 0;

    &:hover ${MessageDate} {
        display: block;
    }
`;

const MessageWrapperHasImage = styled.div`
    display: flex;
    position: relative;
    flex-direction: column;
    align-items: ${(p) => p.userMessage ? 'flex-end' : 'flex-start'};
    justify-content: ${(p) => p.userMessage && 'flex-end'};
    margin: ${(p) => p.theme.spacing.md} 0;

    &:hover ${MessageDate} {
        display: block;
    }
`;

const Message = styled.div`
    margin-left: ${(p) => !p.userMessage && '25px'};
    display: flex;
    flex-direction: row;
    position: relative;
    max-width: 300px;
    line-height: 21px;
    font-size: ${(p) => p.theme.font.size.xs};
    padding: ${(p) => p.theme.spacing.xxs} ${(p) => p.theme.spacing.xs};
    border-radius: ${(p) =>  p.theme.radius.lg};
    color: ${(p) => p.userMessage && p.theme.colors.white};
    background-color: ${(p) => (p.userMessage ? p.theme.colors.primary.light : p.theme.colors.grey[200])};
`;
const MessageHasImage = styled.div`
    margin-left: ${(p) => !p.userMessage && '25px'};
    display: flex;
    flex-direction: row;
    position: relative;
    max-width: 100%;
    line-height: 21px;
    font-size: ${(p) => p.theme.font.size.xs};
    padding: ${(p) => p.theme.spacing.xxs} ${(p) => p.theme.spacing.xs};
    border-radius: ${(p) => (p.userMessage ? `12px 14px 3px 12px` : `14px 12px 12px 3px`)};
    color: ${(p) => p.userMessage && p.theme.colors.white};
    background-color: ${(p) => (p.userMessage ? p.theme.colors.primary.light : p.theme.colors.grey[200])};
`;

const MessageImage = styled.div`
    display: flex;
    flex-direction: row;
    position: relative;
    max-width: 150%;
    padding-top: 3px;
`;

const MessageVideo = styled.div`
    display: flex;
    flex-direction: row;
    position: relative;
    height: 100%;
    width: 60%;
    padding-top: 3px;
`;

const Form = styled.form`
    background-color: ${(p) => p.theme.colors.white};
    position: sticky;
    bottom: 0;
    width: 100%;
    display: flex;
    padding: ${(p) => p.theme.spacing.xxs};
`;

const StyledTextarea = styled(Textarea)`

    border-radius: ${(p) => p.theme.radius.lg};
    background-color: ${(p) => p.theme.colors.grey[200]};
    width: 100%;
    margin: 0 ${(p) => p.theme.spacing.xs};
    padding-left: ${(p) => p.theme.spacing.sm};
    padding-top: ${(p) => p.theme.spacing.xs};
    border: 0;
    outline: none;
    resize: none;
    transition: 0.1s ease-out;
    height: ${(p) => (p.focus ? '80px' : '40px')};
    font-size: ${(p) => p.theme.font.size.xs};
`;

const SendButton = styled(Button)`
    margin-left: ${(p) => p.theme.spacing.sm};
    align-self: center;
`;

const ButtonCancel = styled.div`
    position: absolute;
    top: -10px;
    right: -10px;
    z-index: 10000;
    cursor: pointer;
`
const ButtonClick = styled.div`
    margin-top: 6px;
    cursor: pointer;
`

const Poster = styled.img`
    display: block;
    max-height: 400px;
    width: 300px;
    margin-left: ${(p) => !p.userMessage && '25px'};
    border-radius: ${(p) => (p.userMessage ? `12px 3px 12px 12px` : `3px 14px 12px 12px`)};
`;

const PosterVideo = styled.video`
    display: block;
    height: 100%;
    width: 100%;
    margin-left: ${(p) => !p.userMessage && '25px'};
    border-radius: ${(p) => (p.userMessage ? `12px 3px 12px 12px` : `3px 14px 12px 12px `)};
`;

const EmojiButton = styled.div`
    position: absolute;
    top: -470px;
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

/**
 * Component that renders messages conversations UI
 */
const MessagesChatConversation = ({ messages, authUser, chatUser, data, match }) => {
    const bottomRef = useRef(null);

    const [messageText, setMessageText] = useState('');
    const [image, setImage] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [video, setVideo] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const [createMessage] = useMutation(CREATE_MESSAGE);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView();
        }
    }, [bottomRef, data]);

    
    const onEmojiClick = (event) => {
        console.log(event);
        let message = messageText;
        message += event.emoji;
        setMessageText(message);
    }

    const handleEmojiPickerhideShow = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const sendMessage = async (e) => {
        e.preventDefault();

        if (!messageText && !image) return;

        setMessageText('');
        await createMessage({
            variables: {
                input: {
                    sender: authUser.id,
                    receiver: chatUser ? chatUser.id : null,
                    message: messageText,
                    imageMessage: image,
                },
            },
            refetchQueries: ({ data }) => {
                if (data && data.createMessage && data.createMessage.isFirstMessage) {
                    return [
                        {
                            query: GET_CONVERSATIONS,
                            variables: { authUserId: authUser.id },
                        },
                    ];
                }
            },
        });
        handleReset();
    };

    const handleReset = () => {
        setVideo(false);
        setImage('');
        setIsFocused(false);
    };

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

    const onEnterPress = (e) => {
        if (e.keyCode === 13 && e.shiftKey === false) {
            sendMessage(e);
        }
    };

    return (
        <Root>
            <Conversation>
                {messages.map((message) => {
                    const isAuthUserReceiver = authUser.id === message.sender.id;

                    return (
                        <div key={message.id}>
                            {!message.imageMessage ? 
                            <MessageWrapper userMessage={isAuthUserReceiver} >
                                    
                                <Message userMessage={isAuthUserReceiver}>{message.message}</Message>

                                <MessageDate userMessage={isAuthUserReceiver}>{currentDate(message.createdAt)}</MessageDate>
                            
                                {!isAuthUserReceiver && (
                                    <Spacing right="xs">
                                        <Avatar image={message.sender.image} size={30}/>
                                    </Spacing>
                                )}
                            </MessageWrapper> :
                             <MessageWrapperHasImage userMessage={isAuthUserReceiver}>

                                {message.message && <MessageHasImage userMessage={isAuthUserReceiver}>
                                    {message.message}                                 
                                </MessageHasImage>}
                                
                                {(message.imageMessage && message.imageMessage.includes("video")) ? 
                                    <MessageVideo> <PosterVideo userMessage={isAuthUserReceiver} src={message.imageMessage} controls/> </MessageVideo>
                                    : <MessageImage> <Poster src={message.imageMessage} userMessage={isAuthUserReceiver} /> </MessageImage>
                                }
                                
                                {!isAuthUserReceiver && (
                                    <Spacing right="xs">
                                        <Avatar image={message.sender.image}  size={30}/>
                                    </Spacing>
                                )}
                                <MessageDate userMessage={isAuthUserReceiver}>{currentDate(message.createdAt)}</MessageDate>
                            </MessageWrapperHasImage>}
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </Conversation>

            {match.params.userId !== Routes.NEW_ID_VALUE && chatUser && (
                <Form onSubmit={sendMessage}>
                    {!isFocused && (
                        <WrapperIcon>
                            <PostImageUpload handleChange={handlePostImageUpload} />
                            <div style={{margin: "2px"}}></div>
                            <PostVideoUpload handleChange={handlePostImageUpload} />
                        </WrapperIcon>)}
                        <StyledTextarea
                            placeholder="Aa"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={onEnterPress}
                        />
                        <ButtonClick onClick={handleEmojiPickerhideShow}>
                            <Emoji unified="1f600" size="25" />
                        </ButtonClick>
                        
                        {showEmojiPicker && (
                            <EmojiButton className="emoji-picker-react">
                                <Picker onEmojiClick={onEmojiClick} disableAutoFocus={true}/>
                            </EmojiButton>
                        )}

                    {video ? 
                        (
                            image && (
                            <Spacing bottom="sm" style={{position: "relative"}}>
                                <ButtonCancel onClick={handleReset}>
                                    <CancelIcon />
                                </ButtonCancel>
                                    <video style={{zIndex: -1}} width="300" controls>
                                        <VideoPreview src={URL.createObjectURL(image)} />
                                    </video>                          
                            </Spacing>
                        ))
                        : (
                            image && (
                            <Spacing bottom="sm" style={{position: "relative"}}>
                                <ButtonCancel onClick={handleReset}>
                                    <CancelIcon />
                                </ButtonCancel>
                                <ImagePreviewContainer>
                                    <ImagePreview src={URL.createObjectURL(image)} />
                                </ImagePreviewContainer>
                            </Spacing> 
                    ))}
                    
                    
                    <SendButton type="submit" ghost>
                        <SendIcon width="28" />
                    </SendButton>
                </Form>
            )}
        </Root>
    );
}

MessagesChatConversation.propTypes = {
    messages: PropTypes.array.isRequired,
    authUser: PropTypes.object.isRequired,
    chatUser: PropTypes.object,
    data: PropTypes.any,
    match: PropTypes.object.isRequired,
};

export default MessagesChatConversation;