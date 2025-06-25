import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';

function MapPage() {
  const [data, setData] = useState([]);
  const [selectedZKey, setSelectedZKey] = useState("Z_甘味");

  useEffect(() => {
    fetch("/wine_data.csv")
      .then(res => res.text())
      .then(text => {
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            const parsed = result.data.filter(d => d.UMAP1 && d.UMAP2);
            setData(parsed);
          },
        });
      });
  }, []);

  const x = data.map(d => d.UMAP1);
  const y = data.map(d => d.UMAP2);
  const z = data.map(d => parseFloat(d[selectedZKey]));

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1 }}>
        <label>等高線項目: </label>
        <select value={selectedZKey} onChange={(e) => setSelectedZKey(e.target.value)}>
          <option value="Z_甘味">甘味</option>
          <option value="Z_渋味">渋味</option>
          <option value="Z_酸味">酸味</option>
        </select>
      </div>

      <Plot
        data={[
          {
            x,
            y,
            mode: 'markers',
            type: 'scatter',
            marker: {
              size: 6,
              color: 'rgba(100,100,100,0.6)',
            },
            text: data.map(d => d.商品名),
            name: 'Wine',
          },
          {
            x,
            y,
            z,
            type: 'contour',
            colorscale: 'YlOrRd',
            contours: {
              coloring: 'heatmap',
              showlines: true,
            },
            opacity: 0.5,
            showscale: true,
            name: selectedZKey,
          },
        ]}
        layout={{
          autosize: true,
          dragmode: 'pan',
          hovermode: 'closest',
          margin: { t: 40, l: 20, r: 20, b: 20 },
          xaxis: { title: 'UMAP1', zeroline: false },
          yaxis: { title: 'UMAP2', zeroline: false },
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
        config={{ responsive: true }}
      />
    </div>
  );
}

export default MapPage;
