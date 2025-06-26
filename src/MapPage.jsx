import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';

function MapPage() {
  const [gridData, setGridData] = useState(null);
  const [wineData, setWineData] = useState([]);
  const [selectedZType, setSelectedZType] = useState("Z_甘味");

  // 等高線グリッド読み込み
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
            setGridData({ x: x_vals, y: y_vals, z_all: result.data, x_keys, z: z_vals });
          },
        });
      });
  }, []);

  // 打点（ワイン位置）読み込み
  useEffect(() => {
    fetch("/wine_data.csv")
      .then(res => res.text())
      .then(text => {
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            const parsed = result.data.filter(
              d => Number.isFinite(d.UMAP1) && Number.isFinite(d.UMAP2)
            );
            setWineData(parsed);
          },
        });
      });
  }, []);

  // Zタイプ変更時の再構築
  useEffect(() => {
    if (!gridData) return;
    const x_keys = Object.keys(gridData.z_all[0]).filter(k => k.startsWith(`${selectedZType}_x`));
    const x_vals = x_keys.map(k => parseFloat(k.split("_x")[1]));
    const z_vals = gridData.z_all.map(row => x_keys.map(k => row[k]));
    setGridData(prev => ({
      ...prev,
      x: x_vals,
      x_keys,
      z: z_vals
    }));
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
            // 等高線レイヤー
            {
              x: gridData.x,
              y: gridData.y,
              z: gridData.z,
              type: 'contour',
              colorscale: 'YlOrRd',
              contours: {
                coloring: 'lines',
                showlines: true,
                start: 0,
                end: 1.0,
                size: 0.05
              },
              opacity: 0.6,
              showscale: true,
              name: selectedZType,
            },
            // ワインの打点（前面）
            {
              x: wineData.map(d => d.UMAP1),
              y: wineData.map(d => d.UMAP2),
              text: wineData.map(d => d.商品名),
              mode: 'markers',
              type: 'scatter',
              marker: {
                size: 7,
                color: 'black',
                opacity: 0.9,
              },
              name: 'Wine Points',
            },
          ]}
          layout={{
            autosize: true,
            dragmode: 'pan',
            hovermode: 'closest',
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