import { gql } from '@apollo/client';

const AUTHOR = `
  name,
  born,
  bookCount,
  id
`;

const BOOK = `
    title
    published
    genres
    author {
      name
    }
  id
`;

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      ${AUTHOR}
    }
  }
`;

export const ALL_BOOKS = gql`
  query {
    allBooks {
      ${BOOK}
    }
  }
`;

export const BOOKS_BY_GENRE = gql`
  query getBooksByGenre (
    $genre: String
  ){
    booksByGenre(
      genre: $genre
    ) {
      ${BOOK}
    }
  }
`;

export const RECOMMENDED_BOOKS = gql`
  query {
    recommendation {
      ${BOOK}
    }
  }
`;

export const USER_INFO = gql`
  query getUserInfo (
    $username: String
  ){
    me(
      username: $username
    ) {
      username
      favoriteGenre
    }
  }
`;

export const ADD_BOOK = gql`
  mutation addNewBook(
    $title: String!
    $author: String!
    $published: Int!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
    ) {
      ${BOOK}
    }
  }
`;

export const UPDATE_AUTHOR = gql`
  mutation updateAuthor(
    $name: String!
    $born: Int!
  ) {
    editAuthor(
      name: $name
      born: $born
    ) {
      ${AUTHOR}
    }
  }
`;

export const CREATE_USER = gql`
  mutation createUser(
    $username: String!
    $favoriteGenre: String!
  ) {
    createUser(
      username: $username
      favoriteGenre: $favoriteGenre
    ) {
      username
      favoriteGenre
      id
    }
  }
`;

export const LOGIN = gql`
  mutation login(
    $username: String!
    $password: String!
  ) {
    login (
      username: $username
      password: $password
    ) {
      token {
        value
      }
      user {
        username
        favoriteGenre
      }
    }
  }
`;
