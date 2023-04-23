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

  type Subscription {
    bookAdded: Book!
  }
`

module.exports = typeDefs;
