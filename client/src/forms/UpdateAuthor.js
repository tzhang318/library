import { useMutation } from '@apollo/client';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { UPDATE_AUTHOR } from '../queries/queries';

export const UpdateAuthor = props => {
  const [updateAuthor, result] = useMutation(UPDATE_AUTHOR);
  const [born, setBorn] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const options = props.authors.map(a => ({
    value: a.name,
    label: a.name
  }));

  const submit = e => {
    e.preventDefault();
    updateAuthor({
      variables: { name: selectedOption.value, born }
    });
    setBorn('');
    setSelectedOption(null);
  }

  useEffect(() => {
    if (result.data && !result.data.editAuthor) {
      const error = result.errors[0].message;
      console.log(error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.data?.editAuthor]);

  return (
    <form style={{marginTop: '2rem'}} onSubmit={submit}>
      <div style={{marginBottom: '0.5rem'}}>
        <Select
          defaultValue={selectedOption}
          value={selectedOption}
          onChange={setSelectedOption}
          options={options}
        />
      </div>
      <div style={{marginBottom: '1rem'}}>
        born
        <input
          style={{marginLeft: '1rem'}}
          type='number'
          value={born}
          onChange={e=>setBorn(Number(e.target.value))}
        />
      </div>
      <button type='submit'>Update Author Info</button>
    </form>
  )
}

