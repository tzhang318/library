import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { ALL_BOOKS, BOOKS_BY_GENRE } from '../queries/queries';
import { BooksTable } from './BooksTable';

export const Books = (props) => {
  const result = useQuery(ALL_BOOKS);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genres, setGenres] = useState([]);
  const allBooks = result.data?.allBooks;
  const selectBookResult = useQuery(BOOKS_BY_GENRE, {
    variables: {
      genre: selectedGenre
    }
  });
  const books = selectedGenre ? selectBookResult.data?.booksByGenre : allBooks;

  useMemo(()=> {
    if (allBooks) {
      setGenres(allBooks.reduce((acc, curr) =>
        [...new Set([...curr.genres, ...acc])], []));
    }
  }, [allBooks]);

  const handleClick = genre => {
    setSelectedGenre(genre);
  };

  return (
    <div>
      <h2>books</h2>
      {(result.loading || selectBookResult.loading) &&
        <div>Loading books data</div>
      }
      {(result.data && selectBookResult.data) && (
        <BooksTable books={books} />
      )}
      <div>
        {selectedGenre && (
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-start' }}>
            <button style={{marginRight: '2rem', height: '100%'}} onClick={()=> setSelectedGenre(null)}>
              Clear selection
            </button>
            <label style={{ fontWeight: 'bold' }}>{`selected genre: ${selectedGenre}`}</label>
          </div>
        )}
        {genres.map(genre=>(
          <button
            key={genre}
            style={{ marginRight: '1rem' }}
            onClick={()=>handleClick(genre)}
          >{genre}</button>
        ))}
      </div>
    </div>
  )
};
