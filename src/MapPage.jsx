import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';

function MapPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const wineRes = await fetch('/wine_data.csv');
      const wineText = await wineRes.text();
      const wineParsed = Papa.parse(wineText, { header: true }).data;

      const merged = wineParsed
        .filter((d) => d.UMAP1 && d.UMAP2 && d.JAN)
        .map((d) => ({
          ...d,
          UMAP1: parseFloat(d.UMAP1),
          UMAP2: parseFloat(d.UMAP2),
          type: d.Type?.trim().toLowerCase() || 'unknown',
        }));

      setData(merged);

      // ⭐️ 初回レンダリングで強制 resize を発火
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 300);
    };

    loadData();
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
    <div style={{ padding: '1rem', width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
      <h2 style={{ textAlign: 'center' }}>ワインマップ（UMAP表示）</h2>
      <div style={{ width: '100%', height: '70vh' }}>
        <Plot
          data={Object.keys(grouped).map((type) => ({
            x: grouped[type].map((d) => d.UMAP1),
            y: grouped[type].map((d) => d.UMAP2),
            text: grouped[type].map((d) => d.商品名),
            mode: 'markers',
            type: 'scatter',
            name: type,
            marker: {
              size: 10,
              color: colorMap[type],
              opacity: 0.7,
            },
          }))}
          layout={{
            autosize: true,
            margin: { t: 30, l: 30, r: 30, b: 30 },
            legend: { orientation: 'h' },
          }}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
          config={{ responsive: true }}
        />
      </div>
    </div>
  );
}

export default MapPage;
