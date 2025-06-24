import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';

function MapPage() {
  const [data, setData] = useState([]);
  const [contourZ, setContourZ] = useState([]);

  const selectedVariables = ['ブドウ糖', '果糖'];

  useEffect(() => {
    const loadData = async () => {
      const [wineRes, tasteRes] = await Promise.all([
        fetch('/wine_data.csv'),
        fetch('/Merged_TasteDataDB15.csv'),
      ]);

      const [wineText, tasteText] = await Promise.all([
        wineRes.text(),
        tasteRes.text(),
      ]);

      const wineParsed = Papa.parse(wineText, { header: true }).data;
      const tasteParsed = Papa.parse(tasteText, { header: true }).data;

      const tasteMap = {};
      tasteParsed.forEach((row) => {
        if (row.JAN) tasteMap[row.JAN.trim()] = row;
      });

      const merged = wineParsed
        .filter((d) => d.UMAP1 && d.UMAP2 && d.JAN)
        .map((d) => {
          const jan = d.JAN.trim();
          const taste = tasteMap[jan] || {};
          const stdSum = selectedVariables.reduce((sum, v) => {
            const val = parseFloat(taste[v]);
            return sum + (isNaN(val) ? 0 : val);
          }, 0);

          return {
            ...d,
            UMAP1: parseFloat(d.UMAP1),
            UMAP2: parseFloat(d.UMAP2),
            price: parseInt(d['希望小売価格'], 10),
            type: d.Type?.trim().toLowerCase() || 'unknown',
            stdSum,
          };
        });

      setData(merged);
      setContourZ(merged.map((d) => d.stdSum));
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

  const contourTrace = {
    x: data.map((d) => d.UMAP1),
    y: data.map((d) => d.UMAP2),
    z: contourZ,
    type: 'contour',
    colorscale: 'YlGnBu',
    contours: {
      coloring: 'heatmap',
      showlabels: true,
      labelfont: { size: 10, color: 'black' },
    },
    name: '等高線（標準偏差）',
    opacity: 0.4,
    showscale: true,
  };

  return (
    <div style={{ padding: '1rem', width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
      <h2 style={{ textAlign: 'center' }}>ワインマップ（UMAP表示 + 等高線）</h2>
      <div style={{ width: '100%', aspectRatio: '4 / 3' }}>
        <Plot
          data={[
            contourTrace,
            ...Object.keys(grouped).map((type) => ({
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
            })),
          ]}
          layout={{
            autosize: true,
            margin: { t: 30, l: 30, r: 30, b: 30 },
            showlegend: true,
            legend: { orientation: 'h' },
            yaxis: {
              scaleanchor: 'x',
              scaleratio: 0.75, // 4:3 比率
            },
          }}
          config={{ responsive: true }}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}

export default MapPage;
