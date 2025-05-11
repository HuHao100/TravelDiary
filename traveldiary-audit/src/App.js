import React from 'react';
import { Routes,Route } from 'react-router-dom';
import Home from './pages/Home';
import Details from './pages/Details';

function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/details/:id" element={<Details />} /> {/* 详情页面 */}
      </Routes>
    </>
  );
}

export default App;