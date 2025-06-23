// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MapPage from './MapPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MapPage />} />
    </Routes>
  );
}

export default App;