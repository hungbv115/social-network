import {} from 'dotenv/config';
import express from 'express';
const path = require("path");
import { createServer } from 'http';
import cors from 'cors';
import connectDB from './config/db';
import models from './models';
import schema from './schema';
import resolvers from './resolvers';
import { createApolloServer } from './utils/apollo-server';

connectDB()

const UPLOAD_DIR_NAME = "uploads";
// Initializes application
const app = express();

// Enable cors
const corsOptions = {
    origin: '*'
};
app.use(cors(corsOptions));

app.use(express.static(__dirname));

// Create a Apollo Server
const server = createApolloServer(schema, resolvers, models);
server.applyMiddleware({ app, path: '/graphql' });

// Create http server and add subscriptions to it
const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

// Listen to HTTP and WebSocket server
const PORT = process.env.PORT || process.env.API_PORT
httpServer.listen({ port: PORT }, () => {
    console.log(`server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`);
});
