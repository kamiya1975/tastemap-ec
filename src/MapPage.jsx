import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';

function MapPage() {
  const [data, setData] = useState([]);
  const [contourZ, setContourZ] = useState([]);
  const [xArr, setXArr] = useState([]);
  const [yArr, setYArr] = useState([]);
  const [xRange, setXRange] = useState([0, 10]);
  const [yRange, setYRange] = useState([0, 10]);
  const [zRange, setZRange] = useState([0, 1]);
  const [selectedZKey, setSelectedZKey] = useState("Z_甘味");

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
    return 'unknown';
  };

  useEffect(() => {
    fetch("/wine_data.csv")
      .then(res => res.text())
      .then(text => {
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            const parsed = result.data
              .filter(d => d.UMAP1 !== undefined && d.UMAP2 !== undefined)
              .map(d => ({
                ...d,
                Type: normalizeType(d.Type),
              }));
            setData(parsed);
            computeContour(parsed, selectedZKey);
          },
        });
      });
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      computeContour(data, selectedZKey);
    }
  }, [selectedZKey]);

  const computeContour = (parsed, key) => {
    const gridSize = 100;
    const x = parsed.map(d => d.UMAP1);
    const y = parsed.map(d => d.UMAP2);
    const rawZ = parsed.map(d => parseFloat(d[key]));
    const validZ = rawZ.filter(v => !isNaN(v) && isFinite(v));

    const zMinRaw = Math.min(...validZ);
    const zMaxRaw = Math.max(...validZ);
    const safeZMin = isFinite(zMinRaw) ? zMinRaw : 0;
    const safeZMax = isFinite(zMaxRaw) && zMaxRaw > safeZMin ? zMaxRaw : safeZMin + 0.1;
    setZRange([safeZMin, safeZMax]);

    const xMin = Math.min(...x), xMax = Math.max(...x);
    const yMin = Math.min(...y), yMax = Math.max(...y);
    setXRange([xMin, xMax]);
    setYRange([yMin, yMax]);

    const xStep = (xMax - xMin) / (gridSize - 1);
    const yStep = (yMax - yMin) / (gridSize - 1);

    const densityGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
    const countGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));

    parsed.forEach((row) => {
      const value = parseFloat(row[key]);
      if (isNaN(value) || !isFinite(value)) return;
      const xi = Math.floor((row.UMAP1 - xMin) / xStep);
      const yi = Math.floor((row.UMAP2 - yMin) / yStep);
      if (xi >= 0 && xi < gridSize && yi >= 0 && yi < gridSize) {
        densityGrid[yi][xi] += value;
        countGrid[yi][xi] += 1;
      }
    });

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (countGrid[i][j] > 0) {
          densityGrid[i][j] /= countGrid[i][j];
        } else {
          densityGrid[i][j] = 0; // NaNは完全排除
        }
      }
    }

    const xArr = Array.from({ length: gridSize }, (_, i) => xMin + i * xStep);
    const yArr = Array.from({ length: gridSize }, (_, j) => yMin + j * yStep);
    setContourZ(densityGrid);
    setXArr(xArr);
    setYArr(yArr);
  };

  const zKeys = ["Z_甘味", "Z_渋味", "Z_酸味"];

  return (
    <div style={{ padding: '20px' }}>
      <h2>ワインマップ（UMAP + {selectedZKey} 等高線）</h2>
      <label>等高線項目を選択: </label>
      <select value={selectedZKey} onChange={(e) => setSelectedZKey(e.target.value)}>
        {zKeys.map(k => (
          <option key={k} value={k}>{k.replace("Z_", "")}</option>
        ))}
      </select>

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
              marker: { color, size: 7, opacity: 0.6 },
            };
          }),
          {
            z: contourZ,
            x: xArr,
            y: yArr,
            type: 'contour',
            colorscale: 'YlOrRd',
            contours: {
              coloring: 'lines',
              showlines: true,
              start: zRange[0],
              end: zRange[1],
              size: Math.max((zRange[1] - zRange[0]) / 10, 0.01),
            },
            showscale: true,
            opacity: 0.5,
          },
        ]}
        layout={{
          width: 900,
          height: 700,
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
