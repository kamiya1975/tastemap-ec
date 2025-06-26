import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';

function MapPage() {
  const [xVals, setXVals] = useState([]);
  const [yVals, setYVals] = useState([]);
  const [zMatrix, setZMatrix] = useState([]);
  const [scatterX, setScatterX] = useState([]);
  const [scatterY, setScatterY] = useState([]);

  useEffect(() => {
    fetch("/wine_grid_final_甘味.csv")
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            const rows = result.data.filter(row => row["y"] !== undefined && !isNaN(row["y"]));

            const yRaw = rows.map(row => row["y"]);
            const xKeys = Object.keys(rows[0]).filter(k => k.startsWith("x_"));
            const xRaw = xKeys.map(k => parseFloat(k.replace("x_", "")));
            const zRaw = rows.map(row => xKeys.map(k => row[k]));

            // ✅ min-maxスケーリング
            const scaleTo100 = (arr) => {
              const flat = arr.flat();
              const min = Math.min(...flat);
              const max = Math.max(...flat);
              return arr.map(row => row.map(v => (v - min) / (max - min) * 100));
            };

            const scale1D = (arr) => {
              const min = Math.min(...arr);
              const max = Math.max(...arr);
              return arr.map(v => (v - min) / (max - min) * 100);
            };

            const scaledX = scale1D(xRaw);
            const scaledY = scale1D(yRaw);
            const scaledZ = scaleTo100(zRaw);

            setXVals(scaledX);
            setYVals(scaledY);
            setZMatrix(scaledZ);

            // ✅ 打点位置（確認用）– 元の raw 点を x-y に変換して scatter 表示
            const scatterPoints = [];
            for (let i = 0; i < scaledY.length; i++) {
              for (let j = 0; j < scaledX.length; j++) {
                scatterPoints.push({ x: scaledX[j], y: scaledY[i] });
              }
            }
            setScatterX(scatterPoints.map(p => p.x));
            setScatterY(scatterPoints.map(p => p.y));
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
              opacity: 0.7,
              showscale: true,
              name: "Z_甘味",
            },
            {
              x: scatterX,
              y: scatterY,
              type: "scatter",
              mode: "markers",
              marker: {
                size: 4,
                color: "black"
              },
              name: "打点確認"
            }
          ]}
          layout={{
            autosize: true,
            margin: { t: 40, l: 40, r: 40, b: 40 },
            xaxis: { title: "UMAP1 (scaled)" },
            yaxis: { title: "UMAP2 (scaled)" },
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
