import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';

function MapPage() {
  const [gridData, setGridData] = useState(null);
  const [selectedZType, setSelectedZType] = useState("Z_甘味");

  useEffect(() => {
    fetch("/wine_grid_contour.csv")
      .then(res => res.text())
      .then(text => {
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            const rows = result.data;
            const y_vals = rows.map(row => row["y"]);
            const x_keys = Object.keys(rows[0]).filter(k => k.startsWith(`${selectedZType}_x`));
            const x_vals = x_keys.map(k => parseFloat(k.split("_x")[1]));
            const z_vals = rows.map(row => x_keys.map(k => row[k]));

            setGridData({ x: x_vals, y: y_vals, z_all: result.data, x_keys });
          },
        });
      });
  }, []);

  const updateZ = (type) => {
    setSelectedZType(type);
    if (!gridData) return;

    const x_keys = Object.keys(gridData.z_all[0]).filter(k => k.startsWith(`${type}_x`));
    const x_vals = x_keys.map(k => parseFloat(k.split("_x")[1]));
    const z_vals = gridData.z_all.map(row => x_keys.map(k => row[k]));

    setGridData(prev => ({
      ...prev,
      x: x_vals,
      x_keys,
      z_all: prev.z_all,
      y: prev.y,
      z: z_vals,
    }));
  };

  useEffect(() => {
    if (gridData) updateZ(selectedZType);
  }, [selectedZType]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1 }}>
        <label>等高線項目を選択: </label>
        <select value={selectedZType} onChange={(e) => setSelectedZType(e.target.value)}>
          <option value="Z_甘味">甘味</option>
          <option value="Z_渋味">渋味</option>
          <option value="Z_酸味">酸味</option>
        </select>
      </div>

      {gridData && gridData.z && (
        <Plot
          data={[
            {
              x: gridData.x,
              y: gridData.y,
              z: gridData.z,
              type: 'contour',
              colorscale: 'YlOrRd',
              contours: {
                coloring: 'heatmap',
                showlines: true,
              },
              opacity: 0.8,
              showscale: true,
              name: selectedZType,
            },
          ]}
          layout={{
            autosize: true,
            dragmode: 'pan',
            margin: { t: 40, l: 20, r: 20, b: 20 },
            xaxis: { title: 'UMAP1' },
            yaxis: { title: 'UMAP2' },
          }}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }}
          config={{ responsive: true }}
        />
      )}
    </div>
  );
}

export default MapPage;
