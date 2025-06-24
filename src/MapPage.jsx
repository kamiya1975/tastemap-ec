// src/MapPage.js
import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';

function MapPage() {
  const [data, setData] = useState([]);
  const [contourZ, setContourZ] = useState([]);
  const [xRange, setXRange] = useState([0, 10]);
  const [yRange, setYRange] = useState([0, 10]);

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
    Promise.all([
      fetch("/wine_data.csv").then(res => res.text()),
      fetch("/Merged_TasteDataDB15.csv").then(res => res.text())
    ]).then(([wineText, mergedText]) => {
      Papa.parse(wineText, {
        header: true,
        dynamicTyping: true,
        complete: (wineResult) => {
          Papa.parse(mergedText, {
            header: true,
            dynamicTyping: true,
            complete: (mergedResult) => {
              const wineMap = {};
              wineResult.data.forEach(row => {
                wineMap[row.JAN] = row;
              });

              const features = ["ブドウ糖", "果糖", "グリセリン"];
              const validData = mergedResult.data.filter(row =>
                row.JAN in wineMap &&
                features.every(f => row[f] !== undefined && !isNaN(row[f]))
              );

              // min-max用スケールを計算
              const minMaxStats = {};
              features.forEach(f => {
                const vals = validData.map(d => parseFloat(d[f]));
                const min = Math.min(...vals);
                const max = Math.max(...vals);
                minMaxStats[f] = { min, max };
              });

              const combined = validData.map(row => {
                const wine = wineMap[row.JAN];
                const z = features.reduce((sum, f) => {
                  const value = parseFloat(row[f]);
                  const { min, max } = minMaxStats[f];
                  const norm = (value - min) / (max - min);
                  return sum + norm;
                }, 0);
                return {
                  JAN: row.JAN,
                  UMAP1: wine.UMAP1,
                  UMAP2: wine.UMAP2,
                  Type: normalizeType(row.Type),
                  z,
                };
              });

              setData(combined);
              computeContour(combined);
            }
          });
        }
      });
    });
  }, []);

  const computeContour = (parsed) => {
    const gridSize = 100;
    const x = parsed.map(d => d.UMAP1);
    const y = parsed.map(d => d.UMAP2);

    const xMin = Math.min(...x), xMax = Math.max(...x);
    const yMin = Math.min(...y), yMax = Math.max(...y);
    setXRange([xMin, xMax]);
    setYRange([yMin, yMax]);

    const xStep = (xMax - xMin) / gridSize;
    const yStep = (yMax - yMin) / gridSize;

    const densityGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
    parsed.forEach((row) => {
      const xi = Math.floor((row.UMAP1 - xMin) / xStep);
      const yi = Math.floor((row.UMAP2 - yMin) / yStep);
      if (xi >= 0 && xi < gridSize && yi >= 0 && yi < gridSize) {
        densityGrid[yi][xi] += row.z;
      }
    });

    setContourZ(densityGrid);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>ワインマップ（UMAP + 甘味 等高線）</h2>
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
              marker: { color, size: 8, opacity: 0.8 },
            };
          }),
          {
            z: contourZ,
            type: 'contour',
            colorscale: 'YlOrRd',
            contours: { coloring: 'heatmap' },
            x: Array.from({ length: contourZ[0]?.length || 0 }, (_, i) =>
              xRange[0] + i * (xRange[1] - xRange[0]) / (contourZ[0].length)
            ),
            y: Array.from({ length: contourZ.length }, (_, j) =>
              yRange[0] + j * (yRange[1] - yRange[0]) / (contourZ.length)
            ),
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
