const config = require('./configs/config');
const jwt = require('jsonwebtoken');
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { v1: uuid } = require('uuid');
const { GraphQLError } = require('graphql');
const mongoose = require('mongoose');
const User = require('./models/user');
const Author = require('./models/author');
const Book = require('./models/book');
const logger = require('./utils/logger');

mongoose.set('strictQuery', false);
logger.info('connecting to mongoDB...')

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  });

const typeDefs = `
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }
  type Author {
    name: String!
    born: Int
    bookCount: Int
    allBooks: [Book]!
    id: String!
  }
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type AuthPayload {
    token: Token!
    user: User!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book]!
    allAuthors(name: String): [Author!]!
    booksByGenre(genre: String): [Book]
    recommendation: [Book]
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book

    editAuthor(
      name: String!
      born: Int!
    ): Author

    createUser(
      username: String!
      favoriteGenre: String!
    ): User

    login(
      username: String!
      password: String!
    ): AuthPayload
  }
`

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const booksByAuthor = args.author ?
        await Book.find({ name: args.author }).populate('allBooks') :
        await Book.find({}).populate('author');
      const booksByGenres = args.genre ?
        await Book.find({ genres: args.genre }) :
        booksByAuthor;
      if (args.author && args.genre) {
        return booksByAuthor.filter(book => book.genres.some(g => g === args.genre));
      }
      return args.author ? booksByAuthor : booksByGenres;
    },
    booksByGenre: async (root, args) => {
      if (!args.genre) {
        return await Book.find({}).populate('author');
      }
      return await Book.find({ genres: args.genre }).populate('author');
    },
    recommendation: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }
      return await Book.find({ genres: currentUser.favoriteGenre }).populate('author');
    },
    allAuthors: async (root, args) => {
      const authors = args.author ?
        await Author.find({ name: args.name }) :
        await Author.find({});
      return authors;
    },
    me: async (root, args) => User.findOne({ username: args.username })
  },
  Book: {
    author: (root) => root.author
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const { currentUser } = context;
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }
      const author = await Author.findOne({ name: args.author });
      const book = new Book({ ...args, id: uuid(), author });
      return await book.save();
    },
    editAuthor: async (root, args, context) => {
      const { currentUser } = context;
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }
      const { name, born } = args;
      return await Author.findOneAndUpdate({ name }, { born }, { new: true });
    },
    createUser: async (root, args) => {
      const { username, favoriteGenre} = args;
      const user = new User({
        username, favoriteGenre
      });
      return await user.save();
    },
    login: async (root, { username, password }) => {
      const user = await User.findOne({ username });
      if (!user || password !== 'secret' ) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        });
      }
      const userForToken = {
        username: user.username,
        id: user.id,
      };
      const value = jwt.sign(userForToken, process.env.JWT_SECRET)
      return {
        token: {
          value: jwt.sign(userForToken, process.env.JWT_SECRET)
        },
        user
      };
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: config.PORT },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), process.env.JWT_SECRET
      )
      const currentUser = await User
        .findById(decodedToken.id);
      return { currentUser }
    }
  }
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
