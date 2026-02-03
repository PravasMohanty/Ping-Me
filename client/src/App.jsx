import React from 'react';

import {
  Route,
  Routes,
} from 'react-router-dom';

import ChatPage from '../components/ChatPage';
import HomePage from '../components/HomePage';
import LoginPage from '../components/LoginPage';

function App() {
  return (
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='/auth' element={<LoginPage />} />
      <Route path='/messages' element={<ChatPage />} />
      {/* <Route path='/user' element={<UserProfilePage />} /> */}

    </Routes>
  )
}

export default App
