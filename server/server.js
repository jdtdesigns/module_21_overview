require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const cookieParser = require('cookie-parser');
const path = require('path');

const { authMiddleware } = require('./utils/auth');

const typeDefs = require('./schema/typeDefs');
const resolvers = require('./schema/resolvers');

const db = require('./config/connection');

const app = express();
const PORT = process.env.PORT || 3333;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startServer() {
  await server.start();

  app.use(
    '/graphql',
    express.json(),
    cookieParser(),
    expressMiddleware(server, {
      context: authMiddleware
    })
  );

  if (process.env.PORT) {
    app.use(express.static('../client/dist'));

    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'))
    })
  }

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log('Express server running on port', PORT);
      console.log('GraphQL ready at /graphql');
    });
  });
}

startServer();