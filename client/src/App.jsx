import React, { useContext } from 'react';

import { Toaster } from 'react-hot-toast';
import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import ChatPage from '../components/ChatPage';
import HomePage from '../components/HomePage';
import LoginPage from '../components/LoginPage';
import UserProfilePage from '../components/UserProfilePage';
import { AuthContext } from '../context/authContext';

function App() {
  const { authUser } = useContext(AuthContext)
  return (
    <div>
      <Toaster />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/auth' element={!authUser ? <LoginPage /> : <Navigate to="/messages" />} />
        <Route path='/messages' element={authUser ? <ChatPage /> : <Navigate to="/auth" />} />
        <Route path='/profile' element={authUser ? <UserProfilePage /> : <Navigate to="/auth" />} />
      </Routes>
    </div>
  )
}

export default App
