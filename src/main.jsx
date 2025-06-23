// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import MapPage from './MapPage'; // ← App ではなく MapPage

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MapPage />
  </React.StrictMode>,
);
