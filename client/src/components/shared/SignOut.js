import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useApolloClient } from '@apollo/client';
import { withRouter } from 'react-router-dom';

import { Button } from 'styles/Form';

import * as Routes from 'routes';

import { useStore } from 'store';
import { CLEAR_AUTH_USER } from 'store/auth';

/**
 * Component that signs out the user
 */
const Wapper = styled.div`
    background-color: ${(p) => p.theme.colors.grey[100]};
    margin-right: 5px;
    border-radius: 50%;
    display: flex;
    align-items: center;
`;

const SignOut = ({ history }) => {
    const client = useApolloClient();
    const [, dispatch] = useStore();
    
    const handleSignOut = () => {
        dispatch({ type: CLEAR_AUTH_USER });
        localStorage.removeItem('token');
        client.resetStore();
        history.push(Routes.HOME);
    };

    return (
        <Button text onClick={handleSignOut} >
           <Wapper><img src="https://img.icons8.com/ios/20/null/logout-rounded--v1.png"/></Wapper> Đăng xuất
        </Button>
    );
};

SignOut.propTypes = {
    history: PropTypes.object.isRequired,
};

export default withRouter(SignOut);