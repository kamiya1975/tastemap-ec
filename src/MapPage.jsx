// src/MapPage.jsx
import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';

function MapPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/Merged_TasteDataDB15.csv')
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            setData(result.data);
          },
        });
      });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>読み込んだデータ件数: {data.length}</h1>
    </div>
  );
}

export default MapPage;
