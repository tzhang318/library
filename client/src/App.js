import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useApolloClient, useSubscription } from '@apollo/client';
import { Authors } from './components/Authors';
import { Books } from './components/Books';
import { NewBook } from './components/NewBook';
import { LoginForm } from './forms/LoginForm';
import { Home } from './components/Home';
import { useGetToken } from './hooks/useGetToken';
import { Recommendations } from './components/Recommendations';
import { BOOK_ADDED, ALL_BOOKS } from './queries/queries';
import { updateCache } from './utils/updateCache';

const App = () => {
  const [token, setToken] = useState(useGetToken());
  const client = useApolloClient();
  const navigate = useNavigate();

  useSubscription(BOOK_ADDED, {
    shouldResubscribe: true,
    onComplete: () => {
      console.log('sub completed!')
    },
    onError: (e) => {
      console.log('subscription error: ', e);
    },
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded;
      toast.success(`${addedBook.title} added`, {
        position: toast.POSITION.TOP_CENTER
      });

      updateCache(client.cache, { query: ALL_BOOKS }, addedBook);
    }
  })

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
    navigate('/');
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link to='/authors' style={{ paddingRight: '1rem'}}>authors</Link>
        <Link to='/books' style={{ paddingRight: '1rem'}}>books</Link>
        {!token && <Link to='/login' style={{ paddingRight: '1rem'}}>login</Link>}
        {token && <Link to='add' style={{ paddingRight: '1rem'}}>add book</Link>}
        {token && <Link to='recommend'>recommend</Link>}
        {token && <button style={{ position: 'absolute', right: '5rem' }} onClick={logout}>logout</button>}
      </div>

      <ToastContainer autoClose={8000} />

      <Routes>
        <Route path='/authors' element={<Authors />} />
        <Route path='/books' element={<Books />} />
        <Route path='/login' element={<LoginForm setToken={setToken} /> } />
        <Route path='/add' element={<NewBook />} />
        <Route path='/recommend' element={<Recommendations />} />
        <Route path='/' element={<Home />} />
      </Routes>
    </div>
  );
};

export default App;
