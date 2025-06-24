// src/MapPage.js
import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
import './App.css';
import { Link } from 'react-router-dom';

function MapPage() {
  const [data, setData] = useState([]);
  const [xRange, setXRange] = useState([-10, 10]);
  const [yRange, setYRange] = useState([-10, 10]);

  useEffect(() => {
    fetch('/data/wine_data.csv')
      .then((res) => res.text())
      .then((csv) => {
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsed = results.data.map((row) => ({
              ...row,
              UMAP1: parseFloat(row.UMAP1),
              UMAP2: parseFloat(row.UMAP2),
            }));
            setData(parsed);

            const xVals = parsed.map((d) => d.UMAP1);
            const yVals = parsed.map((d) => d.UMAP2);
            const xMin = Math.min(...xVals);
            const xMax = Math.max(...xVals);
            const yMin = Math.min(...yVals);
            const yMax = Math.max(...yVals);
            setXRange([xMin - 1, xMax + 1]);
            setYRange([yMin - 1, yMax + 1]);
          },
        });
      })
      .catch((err) => {
        console.error("CSV読み込みエラー:", err);
      });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>ワインマップ（UMAP表示）</h2>

      <Plot
        data={[
          {
            x: data.map((d) => d.UMAP1),
            y: data.map((d) => d.UMAP2),
            text: data.map((d) => d["商品名"]),
            mode: 'markers',
            type: 'scatter',
            marker: { size: 8, color: 'black', opacity: 0.6 },
            name: 'ワイン'
          }
        ]}
        layout={{
          width: 600,
          height: 600,
          title: 'UMAPワインマップ',
          xaxis: { range: xRange, title: 'UMAP1' },
          yaxis: { range: yRange, title: 'UMAP2' },
          dragmode: 'pan',
        }}
        config={{ responsive: true, scrollZoom: true }}
      />

      <div style={{ marginTop: '20px' }}>
        <Link to="/">← トップへ戻る</Link>
      </div>
    </div>
  );
}

export default MapPage;
