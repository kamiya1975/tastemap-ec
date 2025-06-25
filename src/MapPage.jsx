// ✅ 改善点：
// - 1ファイル読み込み（wine_data_with_z-2.csv）
// - Z項目をプルダウンで選択可能
// - Type色分け、UMAP軸表示、等高線に選択Z値を使用

import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';

function MapPage() {
  const [data, setData] = useState([]);
  const [contourZ, setContourZ] = useState([]);
  const [xRange, setXRange] = useState([0, 10]);
  const [yRange, setYRange] = useState([0, 10]);
  const [selectedZ, setSelectedZ] = useState("Z_甘味");

  const typeColorMap = {
    Red: 'red',
    White: 'green',
    Rose: 'pink',
    Spa: 'blue',
    unknown: 'gray',
  };

  const normalizeType = (t) => {
    if (!t || typeof t !== 'string') return 'unknown';
    if (t.includes('赤')) return 'Red';
    if (t.includes('白')) return 'White';
    if (t.includes('ロゼ')) return 'Rose';
    if (t.includes('泡') || t.includes('スパー')) return 'Spa';
    return t;
  };

  useEffect(() => {
    fetch("/wine_data_with_z-2.csv")
      .then(res => res.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            const rows = result.data.filter(d => d.UMAP1 && d.UMAP2);
            const normalized = rows.map(row => ({
              ...row,
              Type: normalizeType(row.Type),
            }));
            setData(normalized);
            computeContour(normalized, selectedZ);
          }
        });
      });
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      computeContour(data, selectedZ);
    }
  }, [selectedZ]);

  const computeContour = (parsed, zField) => {
    const gridSize = 50;
    const x = parsed.map(d => d.UMAP1);
    const y = parsed.map(d => d.UMAP2);
    const xMin = Math.min(...x), xMax = Math.max(...x);
    const yMin = Math.min(...y), yMax = Math.max(...y);
    setXRange([xMin, xMax]);
    setYRange([yMin, yMax]);

    const xStep = (xMax - xMin) / gridSize;
    const yStep = (yMax - yMin) / gridSize;

    const densityGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
    const countGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));

    parsed.forEach((row) => {
      const xi = Math.floor((row.UMAP1 - xMin) / xStep);
      const yi = Math.floor((row.UMAP2 - yMin) / yStep);
      const value = parseFloat(row[zField]);
      if (!isNaN(value) && xi >= 0 && xi < gridSize && yi >= 0 && yi < gridSize) {
        densityGrid[yi][xi] += value;
        countGrid[yi][xi] += 1;
      }
    });

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (countGrid[i][j] > 0) {
          densityGrid[i][j] /= countGrid[i][j];
        }
      }
    }

    setContourZ(densityGrid);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>ワインマップ（UMAP + {selectedZ} 等高線）</h2>
      <div style={{ marginBottom: '10px' }}>
        <label>等高線項目を選択: </label>
        <select value={selectedZ} onChange={e => setSelectedZ(e.target.value)}>
          <option value="Z_甘味">甘味</option>
          <option value="Z_渋味">渋味</option>
          <option value="Z_酸味">酸味</option>
        </select>
      </div>
      <Plot
        data={[
          ...Object.entries(typeColorMap).map(([type, color]) => {
            const filtered = data.filter(d => d.Type === type);
            return {
              x: filtered.map(d => d.UMAP1),
              y: filtered.map(d => d.UMAP2),
              mode: 'markers',
              type: 'scatter',
              name: type,
              marker: { color, size: 8, opacity: 0.7 },
            };
          }),
          {
            z: contourZ,
            type: 'contour',
            colorscale: 'YlOrRd',
            contours: {
              coloring: 'heatmap',
              showlines: true
            },
            x: Array.from({ length: contourZ[0]?.length || 0 }, (_, i) =>
              xRange[0] + i * (xRange[1] - xRange[0]) / (contourZ[0].length)
            ),
            y: Array.from({ length: contourZ.length }, (_, j) =>
              yRange[0] + j * (yRange[1] - yRange[0]) / (contourZ.length)
            ),
            showscale: false,
            opacity: 0.5,
          }
        ]}
        layout={{
          width: 800,
          height: 600,
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