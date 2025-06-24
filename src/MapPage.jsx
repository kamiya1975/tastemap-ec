// src/MapPage.js
import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';

function MapPage() {
  const [data, setData] = useState([]);
  const [contourZ, setContourZ] = useState([]);
  const [xRange, setXRange] = useState([0, 10]);
  const [yRange, setYRange] = useState([0, 10]);

  // Typeごとの色
  const typeColorMap = {
    Red: 'red',
    White: 'green',
    Spa: 'blue',
    Rose: 'pink',
    unknown: 'gray',
  };

  useEffect(() => {
    fetch("/Merged_TasteDataDB15.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            const parsed = results.data.filter(row => row.UMAP1 !== undefined && row.UMAP2 !== undefined);
            setData(parsed);
            computeContour(parsed);
          },
        });
      });
  }, []);

  const computeContour = (parsed) => {
    const x = parsed.map(d => d.UMAP1);
    const y = parsed.map(d => d.UMAP2);
    const z = parsed.map(d => {
      const v1 = parseFloat(d["ブドウ糖"] || 0);
      const v2 = parseFloat(d["果糖"] || 0);
      return v1 + v2;
    });

    const gridSize = 100;
    const xMin = Math.min(...x), xMax = Math.max(...x);
    const yMin = Math.min(...y), yMax = Math.max(...y);
    setXRange([xMin, xMax]);
    setYRange([yMin, yMax]);

    const xStep = (xMax - xMin) / gridSize;
    const yStep = (yMax - yMin) / gridSize;

    const densityGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
    parsed.forEach((row, i) => {
      const xi = Math.floor((x[i] - xMin) / xStep);
      const yi = Math.floor((y[i] - yMin) / yStep);
      if (xi >= 0 && xi < gridSize && yi >= 0 && yi < gridSize) {
        densityGrid[yi][xi] += z[i];
      }
    });

    setContourZ(densityGrid);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>ワインマップ（UMAP + 甘味 等高線）</h2>
      <Plot
        data={[
          // Type別バブル
          ...Object.entries(typeColorMap).map(([type, color]) => {
            const filtered = data.filter(d => (d.Type || 'unknown') === type);
            return {
              x: filtered.map(d => d.UMAP1),
              y: filtered.map(d => d.UMAP2),
              mode: 'markers',
              type: 'scatter',
              name: type,
              marker: { color, size: 8, opacity: 0.8 },
            };
          }),
          // 等高線
          {
            z: contourZ,
            type: 'contour',
            colorscale: 'YlOrRd',
            contours: { coloring: 'heatmap' },
            x: Array.from({ length: contourZ[0]?.length || 0 }, (_, i) => xRange[0] + i * (xRange[1] - xRange[0]) / (contourZ[0].length)),
            y: Array.from({ length: contourZ.length }, (_, j) => yRange[0] + j * (yRange[1] - yRange[0]) / (contourZ.length)),
            showscale: false,
            opacity: 0.5,
          },
        ]}
        layout={{
          width: 800,
          height: 600,
          autosize: false,
          xaxis: { title: 'UMAP1', range: xRange },
          yaxis: { title: 'UMAP2', range: yRange },
          legend: { orientation: "h" },
          margin: { t: 30 },
        }}
      />
    </div>
  );
}

export default MapPage;
