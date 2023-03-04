import React from 'react';
import styled, { css } from 'styled-components';
import { generatePath, NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

import SignOut from 'components/shared/SignOut';
import { A } from 'styles/Text';
import Avatar from 'components/shared/Avatar';
import { Spacing } from 'styles/Layout';

import * as Routes from 'routes';

import { useStore } from 'store';

const Root = styled.div`
    text-align: center;
    position: absolute;
    background-color: white;
    line-height: ${(p) => p.theme.spacing.md};
    right: -105px;
    top: 60px;
    z-index: ${(p) => p.theme.zIndex.xl};
    box-shadow: ${(p) => p.theme.shadows.sm};
    border-radius: 10px;
    padding: 10px;
`;

const CSS = css`
    transition: background-color 0.1s;
    display: block;
    padding: ${(p) => p.theme.spacing.xxs} ${(p) => p.theme.spacing.xxs};
    border-radius: 10px;

    &:hover {
        background-color: ${(p) => p.theme.colors.grey[100]};
        color: ${(p) => p.theme.colors.text.secondary};
    }
`;

const Link = styled(A)`
    ${CSS}
`;

const Item = styled.div`
    ${CSS}
`;

const User = styled(NavLink)`
    box-sizing: border-box;
    background-color: transparent;
    box-shadow: 0 2px 12px var(--shadow-2);
    text-decoration: none;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 10px 50px;;
    border: 1px solid transparent;
    border-radius: 10px;

    &:hover {
        background-color: ${(p) => p.theme.colors.grey[100]};
        color: ${(p) => p.theme.colors.text.secondary};
    }
`;

const FullName = styled.div`
    font-family:  Helvetica, Arial, sans-serif;
    font-size: 15px;
    font-weight: ${(p) => p.theme.font.weight.bold};
    color: ${(p) => (p.active ? p.theme.colors.primary.main : p.theme.colors.text.primary)};
`;

const Wapper = styled.div`
    margin: 10px;
    padding: 5px;
    border: 1px solid #f5f5f5;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
`;

/**
 * Component that renders Header User's dropdown
 */
const HeaderUserDropDown = ({ userRef }) => {
    const [{ auth }] = useStore();

    return (
        <Root ref={userRef}>
            <Wapper>
                <User exact to={generatePath(Routes.USER_PROFILE, { username: auth.user.username })} activeClassName="selected">
                    <Avatar image={auth.user.image} size={30} />

                    <Spacing left="xxs">
                        <FullName >{auth.user.fullName}</FullName>
                    </Spacing>
                </User>
                <div style={{borderBottom: "1px solid  #e0e0e0", margin: '4px'}}></div>
                    <Link 
                        to={generatePath(Routes.USER_PROFILE, {
                            username: auth.user.username,
                        })}
                    >
                        Thông tin của bạn
                    </Link>
            </Wapper>
            

            <Item>
                <SignOut />
            </Item>
        </Root>
    );
}

HeaderUserDropDown.propTypes = {
    userRef: PropTypes.object,
};

export default HeaderUserDropDown;