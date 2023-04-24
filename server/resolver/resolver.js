const { GraphQLError } = require('graphql');
const jwt = require('jsonwebtoken');
const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();
const Author = require('../models/author');
const Book = require('../models/book');
const User = require('../models/user');

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
      let author = await Author.findOne({ name: args.author })
      if (!author) {
        author = new Author( { name: args.author });
        author = await author.save();
      }
      const book = new Book({ ...args, author });
      console.log(' *********** book to be saved: ', book);
      const saved = await book.save();

      pubsub.publish('BOOK_ADDED', { bookAdded: saved })

      return saved;
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
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
    }
  }
};

module.exports = resolvers;
