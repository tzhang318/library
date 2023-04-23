import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_BOOK, ALL_BOOKS } from '../queries/queries';
import { updateCache } from '../utils/updateCache';

import 'react-toastify/dist/ReactToastify.css';

export const NewBook = (props) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [addNewBook] = useMutation(ADD_BOOK, {
    onError: e => {
      const errors = e.graphQLErrors[0]
      const { message } = errors;
      console.log(message);
    },
    update: (cache, response) => {
      updateCache(cache, { query: ALL_BOOKS }, response.data.bookAdded);
    }
  });

  const submit = async (event) => {
    event.preventDefault()
    addNewBook({
      variables: {
        title, author, genres, published: Number(published)
      }
    });
    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook