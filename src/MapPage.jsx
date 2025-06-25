import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';

function MapPage() {
  const [data, setData] = useState([]);

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

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Plot
        data={[
          {
            x: data.map(d => d.UMAP1),
            y: data.map(d => d.UMAP2),
            text: data.map(d => d.商品名),
            mode: 'markers',
            type: 'scatter',
            marker: {
              size: 6,
              color: 'rgba(100,100,100,0.6)',
            },
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
