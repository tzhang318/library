export const BooksTable = ({ books }) => {
  return (
    <table style={{ marginBottom: '1rem' }}>
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
  );
};
