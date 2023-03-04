import React from 'react';
import { NavLink, generatePath } from 'react-router-dom';
import styled from 'styled-components';

import * as Routes from 'routes';

import { ExploreIcon, NotificationIcon, HomeIcon, PeopleIcon, EnvelopeIcon } from 'components/icons';

const Link = styled(NavLink)`
    text-decoration: none;
    transition: color 0.1s;
    color: ${(p) => p.theme.colors.text.primary};
    display: block;
    padding-left: ${(p) => p.theme.spacing.xs};

    &:hover,
    &.selected {
        color: ${(p) => p.theme.colors.primary.main};
        background-color: ${(p) => p.theme.colors.grey[100]};

        svg path {
            fill: ${(p) => p.theme.colors.primary.main};
        }

        @media (min-width: ${(p) => p.theme.screen.md}) {
            background-color: ${(p) => p.theme.colors.white};
        }
    }
`;

const List = styled.ul`
    list-style-type: none;
    padding: 0;
    line-height: 40px;
    font-size: ${(p) => p.theme.font.size.xs};
`;

const ListItem = styled.li`
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const Name = styled.div`
    font-family:  Helvetica, Arial, sans-serif;
    font-weight: '500';
    margin-left: ${(p) => p.theme.spacing.sm};
`;

/**
 * Navigation component used in SideBar
 */
const Navigation = () => {
    return (
        <List>
            <Link exact activeClassName="selected" to={Routes.HOME}>
                <ListItem>
                    <HomeIcon />
                    <Name>Trang chủ</Name>
                </ListItem>
            </Link>

            <Link exact activeClassName="selected" to={Routes.EXPLORE}>
                <ListItem>
                    <ExploreIcon width={20} />
                    <Name>Khám phá</Name>
                </ListItem>
            </Link>

            <Link exact activeClassName="selected" to={Routes.PEOPLE}>
                <ListItem>
                    <PeopleIcon />
                    <Name>Mọi người</Name>
                </ListItem>
            </Link>

            <Link exact activeClassName="selected" to={Routes.NOTIFICATIONS}>
                <ListItem>
                    <NotificationIcon width={18} />
                    <Name>Thông báo</Name>
                </ListItem>
            </Link>

            <Link exact activeClassName="selected" to={generatePath(Routes.MESSAGES, { userId: Routes.NEW_ID_VALUE })}>
                <ListItem>
                    <EnvelopeIcon width={18} />
                    <Name>Tin nhắn</Name>
                </ListItem>
            </Link>
        </List>
    );
}

export default Navigation;