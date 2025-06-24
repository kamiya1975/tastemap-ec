import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';

function MapPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadCSV = async () => {
      const wineRes = await fetch('/wine_data.csv');
      const wineText = await wineRes.text();
      const wineParsed = Papa.parse(wineText, { header: true }).data;

      const typeRes = await fetch('/Merged_TasteDataDB15.csv');
      const typeText = await typeRes.text();
      const typeParsed = Papa.parse(typeText, { header: true }).data;

      const typeMap = {};
      typeParsed.forEach((d) => {
        if (d.JAN) typeMap[d.JAN.trim()] = d.Type?.trim().toLowerCase() || 'unknown';
      });

      const merged = wineParsed
        .filter((d) => d.UMAP1 && d.UMAP2 && d.JAN)
        .map((d) => ({
          ...d,
          UMAP1: parseFloat(d.UMAP1),
          UMAP2: parseFloat(d.UMAP2),
          price: parseInt(d['希望小売価格'], 10),
          type: typeMap[d.JAN.trim()] || 'unknown',
        }));

      setData(merged);
    };

    loadCSV();
  }, []);

  const colorMap = {
    red: 'red',
    white: 'green',
    rose: 'deeppink',
    spa: 'blue',
    unknown: 'gray',
  };

  const grouped = {};
  data.forEach((d) => {
    const t = d.type;
    if (!grouped[t]) grouped[t] = [];
    grouped[t].push(d);
  });

  return (
    <div style={{ padding: '20px', width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
      <h2 style={{ textAlign: 'center', fontSize: '22px' }}>ワインマップ（UMAP表示）</h2>
      <div style={{ width: '100%', height: '70vh' }}>
        <Plot
          data={Object.keys(grouped).map((type) => ({
            x: grouped[type].map((d) => d.UMAP1),
            y: grouped[type].map((d) => d.UMAP2),
            text: grouped[type].map((d) => `${d.商品名}（${d.希望小売価格}円）`),
            mode: 'markers',
            type: 'scatter',
            name: type,
            marker: {
              size: 10,
              color: colorMap[type] || 'gray',
              opacity: 0.75,
            },
          }))}
          layout={{
            autosize: true,
            margin: { t: 30, l: 30, r: 30, b: 30 },
            showlegend: true,
            legend: { orientation: 'h' },
          }}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
          config={{ responsive: true }}
        />
      </div>
      <div style={{ textAlign: 'right', marginTop: '12px' }}>
        <Link to="/" style={{ color: 'blue' }}>← トップへ戻る</Link>
      </div>
    </div>
  );
}

export default MapPage;
