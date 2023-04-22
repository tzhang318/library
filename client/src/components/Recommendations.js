import { useQuery } from '@apollo/client';
import { RECOMMENDED_BOOKS } from '../queries/queries';
import { BooksTable } from './BooksTable';

export const Recommendations = props => {
  const favoriteGenre = localStorage.getItem('favorite-genre');
  const result = useQuery(RECOMMENDED_BOOKS);

  if (result.loading) {
    return <div>loading...</div>
  }

  const recommended = result.data.recommendation;

  return (
    <div>
      <h5>Recommendations</h5>
      <p style={{ marginBottom: '1rem' }}>
        books in your favorite genre:
        <strong>{` ${favoriteGenre}`}</strong>
      </p>
      <BooksTable books={recommended} />
    </div>
  );
};
