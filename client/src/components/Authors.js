import { useQuery } from '@apollo/client';
import { ALL_AUTHORS } from '../queries/queries';
import { UpdateAuthor } from '../forms/UpdateAuthor';
import { useGetToken } from '../hooks/useGetToken';

export const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS);
  const token = useGetToken();
  if (result.loading) {
    return (
      <div> Loading data for authors</div>
    );
  }
  const authors = result.data.allAuthors;

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {token &&
        <div>
          <h2>Set Birth Year</h2>
          <UpdateAuthor authors={authors}/>
        </div>
      }
    </div>
  )
};
