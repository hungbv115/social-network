import React from 'react';
import ReactDOM from 'react-dom';
import { StoreProvider } from 'store';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from 'styled-components';
import { createApolloClient } from 'utils/apollo-client';

import 'normalize.css';
import theme from 'theme';
import App from './App';
import reportWebVitals from './reportWebVitals';

const API_URL = 'http://103.149.28.204:8081/graphql';

// GraphQL WebSocket (subscriptions) URL.
// If its url is not set in .env then it has same url, host and pathname
const WEBSOCKET_API_URL = 'ws://103.149.28.204:8081/graphql';
const websocketApiUrl = WEBSOCKET_API_URL
  ? WEBSOCKET_API_URL
  : API_URL.replace('https://', 'ws://').replace('http://', 'ws://');

// Create a Apollo client
const apolloClient = createApolloClient(API_URL, websocketApiUrl);

ReactDOM.render(
    <ApolloProvider client={apolloClient}>
      <ThemeProvider theme={theme}>
        <StoreProvider>
          <App />
        </StoreProvider>
      </ThemeProvider>
    </ApolloProvider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
