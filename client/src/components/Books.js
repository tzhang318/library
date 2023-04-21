import { useQuery } from '@apollo/client';
import { ALL_BOOKS } from '../queries/queries';

const Books = (props) => {
  const result = useQuery(ALL_BOOKS);
  if (result.loading) {
    return (
      <div>Loading books data</div>
    )
  }
  const books = result.data.allBooks;

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((b) => (
            <tr key={b.id} style={{ paddingBottom: '0.5rem' }}>
              <td style={{ paddingRight: '1rem' }}>{b.title}</td>
              <td style={{ paddingRight: '1rem' }}>{b.author.name}</td>
              <td style={{ paddingRight: '1rem' }}>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Books
