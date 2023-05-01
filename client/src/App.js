import { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useApolloClient } from '@apollo/client';
import { Authors } from './components/Authors';
import { Books } from './components/Books';
import { NewBook } from './components/NewBook';
import { LoginForm } from './forms/LoginForm';
import { Home } from './components/Home';
import { useGetToken } from './hooks/useGetToken';
import { Recommendations } from './components/Recommendations';
import Game from './ticTacToe/TicTacToe';

const App = () => {
  const [token, setToken] = useState(useGetToken());
  const client = useApolloClient();
  const navigate = useNavigate();

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
    navigate('/');
  };

  return (
    <div>
      <div className='menu'>
        <div className='nav'>
          <Link className='link' to='/authors' style={{ paddingRight: '1rem'}}>authors</Link>
          <Link className='link' to='/books' style={{ paddingRight: '1rem'}}>books</Link>
          {!token && <Link className='link' to='/login' style={{ paddingRight: '1rem'}}>login</Link>}
          {token && <Link className='link' to='add' style={{ paddingRight: '1rem'}}>add book</Link>}
          {token && <Link className='link' to='recommend'>recommend</Link>}
          <Link className='link' to='/tic' >Game</Link>
        </div>
        {token && <button className='logout'  onClick={logout}>logout</button>}
      </div>

      <ToastContainer autoClose={8000} />

      <Routes>
        <Route path='/authors' element={<Authors />} />
        <Route path='/books' element={<Books />} />
        <Route path='/login' element={<LoginForm setToken={setToken} /> } />
        <Route path='/add' element={<NewBook />} />
        <Route path='/recommend' element={<Recommendations />} />
        <Route path='/' element={<Home />} />
        <Route path='/tic' element={<Game />} />
      </Routes>
    </div>
  );
};

export default App;
