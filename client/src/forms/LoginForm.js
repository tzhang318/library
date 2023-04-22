import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../queries/queries';

export const LoginForm = props => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [login, result] = useMutation(LOGIN);
  const navigate = useNavigate();

  const submit = e => {
    e.preventDefault();
    login({
      variables: { username, password }
    });
  };

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.token.value;
      props.setToken(token);
      localStorage.setItem('lib-user-token', token);
      localStorage.setItem('username', result.data.login.user.username);
      localStorage.setItem('favorite-genre', result.data.login.user.favoriteGenre);
      navigate('/books');
    }
  }, [result.data]);

  return (
    <form onSubmit={submit}>
      <h2 style={{ marginBottom: '2rem' }}>Please login</h2>
      <div style={{ marginBottom: '1rem'}}>
        <label style={{ margin: '0 2rem' }}>username</label>
        <input name="username" value={username} onChange={e=>setUsername(e.target.value)} />
      </div>
      <div style={{ marginBottom: '1rem'}}>
        <label style={{ margin: '0 2rem' }}>password</label>
        <input name="password" type='password' value={password} onChange={e=>setPassword(e.target.value)} />
      </div>
      <button type='submit' style={{ padding: '0.5rem 1rem' }}>Submit</button>
    </form>
  );
};
