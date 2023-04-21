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

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book]!
    allAuthors(name: String): [Author!]!
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
    ): Token
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
    allAuthors: async (root, args) => {
      const authors = args.author ?
        await Author.find({ name: args.name }) :
        await Author.find({});
      // const authors = await Author.find({});
      // const books = await Book.find({}).populate('author');
      // return authors.map(author => {
      //   const myBooks = books.filter(book => book.author === author.name);
      //   return { ...author, bookCount: myBooks.length };
      // })
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
      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
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


// let authors = [
//   {
//     name: 'Robert Martin',
//     id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
//     born: 1952,
//   },
//   {
//     name: 'Martin Fowler',
//     id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
//     born: 1963
//   },
//   {
//     name: 'Fyodor Dostoevsky',
//     id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
//     born: 1821
//   },
//   { 
//     name: 'Joshua Kerievsky', // birthyear not known
//     id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
//   },
//   { 
//     name: 'Sandi Metz', // birthyear not known
//     id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
//   },
// ]

// let books = [
//   {
//     title: 'Clean Code',
//     published: 2008,
//     author: 'Robert Martin',
//     id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
  //   genres: ['refactoring']
  // },
  // {
  //   title: 'Agile software development',
  //   published: 2002,
  //   author: 'Robert Martin',
  //   id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
  //   genres: ['agile', 'patterns', 'design']
  // },
  // {
  //   title: 'Refactoring, edition 2',
  //   published: 2018,
  //   author: 'Martin Fowler',
  //   id: "afa5de00-344d-11e9-a414-719c6709cf3e",
  //   genres: ['refactoring']
  // },
  // {
  //   title: 'Refactoring to patterns',
  //   published: 2008,
  //   author: 'Joshua Kerievsky',
  //   id: "afa5de01-344d-11e9-a414-719c6709cf3e",
  //   genres: ['refactoring', 'patterns']
  // },  
  // {
  //   title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
  //   published: 2012,
  //   author: 'Sandi Metz',
  //   id: "afa5de02-344d-11e9-a414-719c6709cf3e",
  //   genres: ['refactoring', 'design']
  // },
  // {
  //   title: 'Crime and punishment',
  //   published: 1866,
  //   author: 'Fyodor Dostoevsky',
  //   id: "afa5de03-344d-11e9-a414-719c6709cf3e",
  //   genres: ['classic', 'crime']
  // },
  // {
//     title: 'The Demon ',
//     published: 1872,
//     author: 'Fyodor Dostoevsky',
//     id: "afa5de04-344d-11e9-a414-719c6709cf3e",
//     genres: ['classic', 'revolution']
//   },
// ]
