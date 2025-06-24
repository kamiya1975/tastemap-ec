import React, { useRef, useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';

function useResizeObserver(ref, callback) {
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(() => callback());
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, callback]);
}

function MapPage() {
  const [data, setData] = useState([]);
  const plotWrapperRef = useRef(null);
  const [plotSize, setPlotSize] = useState({ width: 600, height: 600 });

  useResizeObserver(plotWrapperRef, () => {
    if (plotWrapperRef.current) {
      const { width, height } = plotWrapperRef.current.getBoundingClientRect();
      setPlotSize({
        width: width - 20,
        height: Math.max(400, height - 20),
      });
    }
  });

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
    <div style={{ padding: '1rem' }}>
      <h2 style={{ textAlign: 'center' }}>ワインマップ（UMAP表示）</h2>
      <div ref={plotWrapperRef} style={{ width: '100%', minHeight: '70vh' }}>
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
            autosize: false,
            width: plotSize.width,
            height: plotSize.height,
            margin: { t: 30, l: 30, r: 30, b: 30 },
            legend: { orientation: 'h' },
          }}
          config={{ responsive: true }}
        />
      </div>
    </div>
  );
}

export default MapPage;
