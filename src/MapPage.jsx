import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
import { Link } from 'react-router-dom';

function MapPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/wine_data.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsed = results.data.map(d => ({
              商品名: d["商品名"],
              JAN: d["JAN"],
              Type: d["Type"],
              UMAP1: parseFloat(d["UMAP1"]),
              UMAP2: parseFloat(d["UMAP2"]),
              希望小売価格: parseFloat(d["希望小売価格"]),
            }));
            setData(parsed);
          }
        });
      });
  }, []);

  // ✅ 色をTypeごとに明示的に割り当て
  const colorMap = {
    Spa: 'blue',
    White: 'green',
    Red: 'red',
    Rose: 'deeppink', // 'rose' という色名はないため、代わりに 'deeppink' 使用
    未分類: 'gray',
  };

  // ✅ Typeごとにグループ化
  const grouped = {};
  data.forEach(d => {
    const type = d.Type || '未分類';
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(d);
  });

  return (
    <div style={{ padding: '30px', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '30px' }}>ワインマップ（UMAP表示）</h2>
      <Plot
        data={Object.keys(grouped).map(type => ({
          x: grouped[type].map(d => d.UMAP1),
          y: grouped[type].map(d => d.UMAP2),
          text: grouped[type].map(d => `${d.商品名}（${d.希望小売価格}円）`),
          mode: 'markers',
          type: 'scatter',
          name: type,
          marker: {
            size: 10,
            color: colorMap[type] || 'gray',
            opacity: 0.7,
          },
        }))}
        layout={{
          width: 700,
          height: 600,
          margin: { l: 40, r: 40, b: 40, t: 40 },
          xaxis: { title: 'UMAP1' },
          yaxis: { title: 'UMAP2' },
          legend: { orientation: 'h' },
        }}
      />
      <Link to="/" style={{ marginTop: '20px', display: 'inline-block', color: '#6666ff' }}>← トップへ戻る</Link>
    </div>
  );
}

export default MapPage;
