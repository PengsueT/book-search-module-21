const express = require('express');
const { ApolloServer } = require('@apollo/server'); // Apollo server dependency
const { expressMiddleware } = require('@apollo/server/express4'); // Express middleware for Apollo server
const { authMiddleware } = require('./utils/auth'); // Authorization helper
const { typeDefs, resolvers } = require('./schemas'); // GraphQL schemas
const path = require('path');
const db = require('./config/connection');

const server = new ApolloServer({ typeDefs, resolvers, introspection: true }); // defines our apollo server

const app = express();
const PORT = process.env.PORT || 3001;

const startApolloServer = async () => { // Function to start the Apollo server
  await server.start();
  

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use("/graphql", expressMiddleware(server, { context: authMiddleware }));

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../client/dist/index.html"))
    });
  }

  db.once('open', () => {
    app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });
}

startApolloServer(); // Calls the function to start the Apollo server