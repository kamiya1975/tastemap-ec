import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';

function MapPage() {
  const [xVals, setXVals] = useState([]);
  const [yVals, setYVals] = useState([]);
  const [zMatrix, setZMatrix] = useState([]);

  useEffect(() => {
    fetch("/wine_grid_final_甘味.csv")
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            const rows = result.data.filter(row => row["y"] !== undefined);

            // y 軸値
            const yRaw = rows.map(row => row["y"]);

            // x 軸名の抽出
            const xKeys = Object.keys(rows[0]).filter(k => k.startsWith("x_"));
            const xRaw = xKeys.map(k => parseFloat(k.replace("x_", "")));

            // z 行列
            const zRaw = rows.map(row => xKeys.map(k => row[k]));

            // ✅ min-max スケーリング関数
            const scaleTo100 = (arr) => {
              const flat = arr.flat();
              const min = Math.min(...flat);
              const max = Math.max(...flat);
              return arr.map(row => row.map(v => (v - min) / (max - min) * 100));
            };

            const scaledZ = scaleTo100(zRaw);
            const scaledX = xRaw.map((v, _, arr) => (v - Math.min(...arr)) / (Math.max(...arr) - Math.min(...arr)) * 100);
            const scaledY = yRaw.map((v, _, arr) => (v - Math.min(...arr)) / (Math.max(...arr) - Math.min(...arr)) * 100);

            setXVals(scaledX);
            setYVals(scaledY);
            setZMatrix(scaledZ);
          }
        });
      });
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {zMatrix.length > 0 && (
        <Plot
          data={[
            {
              x: xVals,
              y: yVals,
              z: zMatrix,
              type: "contour",
              colorscale: "YlOrRd",
              contours: {
                coloring: "heatmap",
                showlines: true,
              },
              opacity: 0.8,
              showscale: true,
              name: "Z_甘味",
            },
          ]}
          layout={{
            autosize: true,
            margin: { t: 40, l: 40, r: 40, b: 40 },
            xaxis: { title: "UMAP1" },
            yaxis: { title: "UMAP2" },
            dragmode: "pan",
          }}
          config={{ responsive: true }}
          useResizeHandler={true}
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
}

export default MapPage;

